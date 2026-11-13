'use strict';

const WIDTH = 600;
const HEIGHT = 800;
const GROUND = 644;
const GRAVITY = 690;
const THRUST = 1370;
const MAX_VERTICAL_SPEED = 330;
const CEILING_Y = 36;
const FLOOR_Y = GROUND - 32;
const START_X = 150;
const CRASH_MS = 520;
const BRAND_RED = 0xdc2626;
const IDLE_LINES = ['Nice day for a cruise.', 'Taking the scenic route.', 'Still with me?'];
const COFFEE_MS = 5000;
const LEVEL_DISTANCE = 2400;
const MIN_SPEED = 132;
const MAX_SPEED = 230;
const PLAYER_HALF_WIDTH = 21;
const PLAYER_HALF_HEIGHT = 25;
const BEST_KEY = 'rv-dash-best-v3';
const COIN_POINTS = 5;
// Spacing leaves time to travel floor-to-ceiling even at maximum speed.
const PATTERNS = [
    { key: 'fence', y: 604, width: 120, height: 76, lane: 'low', spacing: 590, coins: 'arc' },
    { key: 'sign', y: 83, width: 102, height: 176, lane: 'high', spacing: 590, coins: 'line' },
    { key: 'stump', y: 601, width: 90, height: 86, lane: 'low', spacing: 590, coins: 'line' },
    { key: 'branch', y: 106, width: 158, height: 166, lane: 'high', spacing: 590, coins: 'arc' },
    { key: 'cone', y: 605, width: 78, height: 78, lane: 'low', spacing: 590, coins: 'arc' },
    { key: 'tire', y: 579, width: 98, height: 98, lane: 'low', spacing: 590, coins: 'line' }
];

function scrollSpeed(distance) {
    return Math.min(MAX_SPEED, MIN_SPEED + distance / 90);
}

function readBest() {
    try {
        const best = JSON.parse(localStorage.getItem(BEST_KEY));
        if (Number.isFinite(best?.score) && Number.isFinite(best?.level)) return best;
    } catch {
        // Play still works when storage is unavailable.
    }
    return { score: 0, level: 1 };
}

const STORE_URLS = {
    dewitt: 'https://www.pricerightrv.com/location/dewitt',
    sterlingHeights: 'https://www.pricerightrv.com/location/sterling-heights'
};
const STATES = Object.freeze({
    AWAITING_START: 'AWAITING_START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
});
const byId = (id) => document.getElementById(id);
let viewTracked = false;

function track(event, details = {}) {
    const payload = { game_name: 'RV Dash', ...details };
    try {
        if (typeof window.gtag === 'function') {
            window.gtag('event', event, payload);
        } else if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event, ...payload });
        }
    } catch {
        // Analytics is optional and must never interrupt a round or navigation.
    }
}

function makeTextures(scene) {
    const graphics = scene.make.graphics({ add: false });
    function rect(color, x, y, width, height) {
        graphics.fillStyle(color).fillRect(x, y, width, height);
    }
    function texture(key, width, height, draw) {
        if (scene.textures.exists(key)) return;
        graphics.clear();
        draw();
        graphics.generateTexture(key, width, height);
    }

    const ink = 0x111111;
    const cream = 0xfff4de;
    function box(color, x, y, w, h, radius = 7) {
        graphics.fillStyle(ink).fillRoundedRect(x, y, w, h, radius);
        graphics.fillStyle(color).fillRoundedRect(x + 4, y + 4, w - 8, h - 8, Math.max(2, radius - 4));
    }
    function circle(color, x, y, radius) {
        graphics.fillStyle(ink).fillCircle(x, y, radius);
        graphics.fillStyle(color).fillCircle(x, y, radius - 4);
    }
    texture('coin', 64, 64, () => {
        circle(0xffefc2, 32, 32, 29);
        circle(BRAND_RED, 32, 32, 23);
        graphics.fillStyle(0xffffff).fillRoundedRect(18, 23, 22, 18, 3);
        graphics.fillStyle(0xffffff).fillTriangle(39, 23, 48, 32, 39, 41);
        graphics.fillStyle(BRAND_RED).fillCircle(39, 32, 2);
    });
    texture('coffee', 64, 64, () => {
        circle(0xdb9c68, 49, 35, 12);
        box(0x8d4935, 9, 24, 40, 34, 10);
        rect(0xffd09e, 16, 31, 24, 5);
        graphics.lineStyle(4, cream).beginPath()
            .moveTo(22, 19).lineTo(25, 12).lineTo(22, 5)
            .moveTo(34, 19).lineTo(38, 12).lineTo(35, 5).strokePath();
    });
    texture('tire', 64, 64, () => {
        circle(0x333337, 32, 32, 29);
        circle(0xc2b8af, 32, 32, 17);
        circle(0x454149, 32, 32, 8);
        for (const x of [19, 28, 37]) rect(0x878086, x, 10, 5, 5);
    });
    texture('cone', 64, 64, () => {
        graphics.fillStyle(ink).fillTriangle(10, 50, 30, 5, 54, 50);
        graphics.fillStyle(0xf57938).fillTriangle(16, 48, 30, 12, 48, 48);
        rect(cream, 23, 29, 16, 5);
        rect(cream, 19, 40, 24, 5);
        box(BRAND_RED, 5, 47, 54, 12, 5);
    });
    texture('fence', 120, 76, () => {
        box(0x8c5d48, 2, 24, 116, 15);
        box(0x8c5d48, 2, 48, 116, 15);
        for (const x of [7, 30, 53, 76, 99]) {
            box(0xbd8560, x, 3, 15, 72, 4);
            rect(cream, x + 5, 22, 5, 4);
        }
    });
    texture('stump', 90, 86, () => {
        graphics.fillStyle(ink).fillTriangle(1, 83, 38, 41, 89, 83);
        graphics.fillStyle(0x85543e).fillTriangle(10, 79, 40, 47, 79, 79);
        box(0x96634a, 15, 13, 60, 62, 13);
        graphics.fillStyle(ink).fillEllipse(45, 20, 65, 35);
        graphics.fillStyle(0xd79e72).fillEllipse(45, 20, 56, 27);
        graphics.lineStyle(3, 0x9d6248).strokeEllipse(45, 20, 30, 14);
    });
    texture('sign', 102, 176, () => {
        box(0x827a77, 20, 0, 12, 113, 4);
        box(0x827a77, 69, 0, 12, 113, 4);
        box(BRAND_RED, 1, 100, 100, 74, 11);
        graphics.fillStyle(cream).fillTriangle(30, 127, 72, 127, 51, 156);
        rect(cream, 47, 114, 8, 18);
    });
    texture('branch', 158, 166, () => {
        graphics.lineStyle(21, ink).beginPath().moveTo(105, 0).lineTo(90, 72).lineTo(46, 131).strokePath();
        graphics.lineStyle(13, 0x906147).beginPath().moveTo(105, 0).lineTo(90, 72).lineTo(46, 131).strokePath();
        for (const [x, y, r] of [[35, 129, 27], [69, 136, 28], [110, 116, 34], [133, 86, 24]]) {
            circle(0x637b4e, x, y, r);
        }
    });
    texture('sky', WIDTH, HEIGHT, () => {
        for (let y = 0; y < HEIGHT; y += 4) {
            const t = y / HEIGHT;
            const rgb = [44 + 156 * t, 42 + 118 * t, 46 + 98 * t].map(Math.round);
            rect((rgb[0] << 16) | (rgb[1] << 8) | rgb[2], 0, y, WIDTH, 4);
        }
        graphics.fillStyle(0xe9c7ab).fillCircle(463, 132, 49);
        for (const [x, y] of [[0, 420], [76, 388], [156, 432], [292, 404], [440, 420], [572, 415]]) {
            graphics.fillStyle(0x716866).fillTriangle(x - 110, 503, x, y, x + 110, 503);
        }
        rect(0x514b49, 0, 503, WIDTH, GROUND - 503);
        rect(0x645b56, 0, 522, WIDTH, 5);
        rect(0x5a5350, 0, 527, WIDTH, GROUND - 527);
    });
    texture('clouds', WIDTH, HEIGHT, () => {
        for (const [x, y] of [[60, 150], [290, 228], [505, 74]]) {
            graphics.fillStyle(0xfaf1d6, 0.62).fillRoundedRect(x - 36, y, 102, 23, 11);
            graphics.fillRoundedRect(x - 8, y - 12, 54, 26, 13);
        }
    });
    texture('track', WIDTH, HEIGHT - GROUND + 24, () => {
        rect(0x67615e, 0, 0, WIDTH, 24);
        rect(0xbbb0a5, 0, 24, WIDTH, 5);
        rect(0x302e2d, 0, 29, WIDTH, HEIGHT - GROUND - 5);
        for (const x of [0, 200, 400]) {
            rect(0xb7aaa0, x, 104, 96, 6);
            rect(0x494441, x + 20, 66, 44, 2);
            rect(0x494441, x + 128, 134, 24, 2);
        }
    });
    graphics.destroy();
}

// Trees and fences share a distant band. RVs sit in a separate foreground band.
const SCENERY = [
    ['prop_tree_pine', 68, 521, 72, 91, 0xb5aaa1, 0.18, 0],
    ['prop_fence_segment', 220, 521, 158, 54, 0xb5aaa1, 0.18, 0],
    ['prop_tree_pine', 377, 521, 70, 88, 0xb5aaa1, 0.18, 0],
    ['prop_fence_segment', 519, 521, 144, 54, 0xb5aaa1, 0.18, 0],
    ['lite_tt_v2', 152, 611, 181, 87, 0xd4c8be, 0.36, 1],
    ['generic_bunkhouse_fifth_wheel_teal', 447, 611, 200, 87, 0xd4c8be, 0.36, 1]
];

function makeScenery(scene) {
    return SCENERY.flatMap(([key, x, y, maxWidth, maxHeight, tint, speed, depth]) => {
        if (!scene.textures.exists(key)) return [];
        const frame = scene.textures.getFrame(key);
        const scale = Math.min(maxWidth / frame.width, maxHeight / frame.height);
        return [-1, 0, 1].map((copy) => ({
            image: scene.add.image(x + copy * WIDTH, y, key).setOrigin(0.5, 1).setScale(scale).setTint(tint).setDepth(depth),
            x: x + copy * WIDTH,
            speed
        }));
    });
}

function boot() {
    if (!window.Phaser) {
        byId('status').textContent = 'RV Dash could not load. Check your connection and refresh to try again.';
        return;
    }

    class DashScene extends Phaser.Scene {
        preload() {
            const assets = window.RV_DASH_EMBEDDED || {};
            this.loadFailures = new Set();
            const fail = (key) => {
                this.loadFailures.add(key);
                byId('status').textContent = 'Could not load: ' + [...this.loadFailures].join(', ');
            };
            this.load.on('loaderror', ({ key }) => fail(key));
            for (const side of ['right', 'left']) {
                for (const pose of ['idle', 'walk']) {
                    const key = 'taggy-' + pose + '-' + side;
                    if (!assets[key]) fail(key);
                    else this.load.spritesheet(key, assets[key], { frameWidth: 160, frameHeight: 144 });
                }
            }
            for (const key of new Set(SCENERY.map(([name]) => name))) {
                if (!assets[key]) fail(key);
                else this.load.image(key, assets[key]);
            }
        }

        create() {
            this.state = STATES.AWAITING_START;
            this.score = 0;
            this.elapsed = 0;
            this.store = null;
            this.spaceHeld = false;
            this.pointerId = null;
            this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
            makeTextures(this);
            if (['idle-right', 'walk-right', 'idle-left', 'walk-left']
                .some((pose) => !this.textures.exists('taggy-' + pose))) {
                if (!this.loadFailures.size) byId('status').textContent = 'Taggy could not load. Refresh to try again.';
                return;
            }
            if (this.loadFailures.size) return;
            this.add.image(0, 0, 'sky').setOrigin(0);
            this.clouds = this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'clouds').setOrigin(0);
            this.scenery = makeScenery(this);
            this.road = this.add.tileSprite(0, GROUND - 24, WIDTH, HEIGHT - GROUND + 24, 'track').setOrigin(0).setDepth(2);
            if (!this.anims.exists('run-right')) this.anims.create({
                key: 'run-right',
                frames: this.anims.generateFrameNumbers('taggy-walk-right', { start: 0, end: 3 }),
                duration: 560,
                repeat: -1
            });
            this.player = this.add.sprite(START_X, FLOOR_Y, 'taggy-idle-right', 0).setScale(0.5).setDepth(5);
            this.muted = true;
            this.best = readBest();
            this.segments = [];
            this.effects = [];
            this.banner = this.add.text(WIDTH / 2, 100, '', {
                fontFamily: 'monospace', fontStyle: 'bold', fontSize: '52px',
                color: '#ffffff', stroke: '#8f1616', strokeThickness: 10
            }).setOrigin(0.5).setDepth(8).setVisible(false);
            this.makeLegend();
            this.bindControls();
            this.renderState();
            if (!viewTracked) {
                viewTracked = true;
                track('game_view');
            }
        }

        bindControls() {
            const listeners = new AbortController();
            const on = (target, event, handler) => {
                target.addEventListener(event, handler, { signal: listeners.signal });
            };
            this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => listeners.abort());
            byId('sound').disabled = false;
            on(byId('sound'), 'click', async () => {
                this.muted = !this.muted;
                const button = byId('sound');
                button.setAttribute('aria-pressed', String(!this.muted));
                button.textContent = this.muted ? 'Sound off' : 'Sound on';
                if (this.muted) return;
                try {
                    const Audio = window.AudioContext || window.webkitAudioContext;
                    this.audio ??= new Audio();
                    await this.audio.resume();
                } catch {
                    this.muted = true;
                    button.setAttribute('aria-pressed', 'false');
                    button.textContent = 'Sound unavailable';
                }
            });
            this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
                this.audio?.close().catch(() => {});
            });
            on(byId('start'), 'click', () => this.start());
            on(byId('replay'), 'click', () => this.start());
            on(byId('pause'), 'click', () => {
                this.setRoundState(this.state === STATES.PLAYING ? STATES.PAUSED : STATES.PLAYING);
                if (this.state === STATES.PLAYING) byId('playfield').focus({ preventScroll: true });
            });
            on(document, 'visibilitychange', () => {
                if (document.hidden && this.state === STATES.PLAYING) this.setRoundState(STATES.PAUSED);
            });
            on(window, 'blur', () => this.clearInput());
            on(document, 'keydown', (event) => {
                if (event.code !== 'Space' || event.ctrlKey || event.metaKey || event.altKey
                    || event.target.closest('button, a')) return;
                if (this.state === STATES.PAUSED || this.loadFailures.size) return;
                event.preventDefault();
                if (event.repeat || this.crashUntil && this.state === STATES.PLAYING) return;
                if (this.state !== STATES.PLAYING) this.start();
                this.spaceHeld = true;
            });
            on(document, 'keyup', (event) => {
                if (event.code === 'Space') this.spaceHeld = false;
            });
            const field = byId('playfield');
            on(field, 'pointerdown', (event) => {
                if (event.button !== 0 || this.pointerId !== null || this.crashUntil
                    || this.state === STATES.PAUSED || this.loadFailures.size) return;
                if (this.state === STATES.AWAITING_START) this.start();
                if (this.state !== STATES.PLAYING) return;
                field.focus({ preventScroll: true });
                field.setPointerCapture(event.pointerId);
                this.pointerId = event.pointerId;
            });
            for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
                on(field, event, (pointer) => {
                    if (this.pointerId === pointer.pointerId) this.pointerId = null;
                });
            }
            for (const button of document.querySelectorAll('[data-store]')) {
                on(button, 'click', () => this.selectStore(button.dataset.store));
            }
            const inventory = byId('inventory');
            const trackInventory = () => {
                if (this.state === STATES.GAME_OVER && this.store) track('cta_click', { store: this.store });
            };
            on(inventory, 'click', trackInventory);
            on(inventory, 'auxclick', (event) => {
                if (event.button === 1) trackInventory();
            });
        }

        makeLegend() {
            byId('legend').replaceChildren();
            for (const [key, label] of [
                ['coin', 'Tag coin +5'], ['coffee', 'Double points'],
                ['fence', 'Jump fences'], ['sign', 'Duck signs'],
                ['cone', 'Avoid cones'], ['tire', 'Avoid tires']
            ]) {
                const item = document.createElement('li');
                const icon = this.textures.get(key).getSourceImage();
                const image = document.createElement('img');
                image.src = icon.toDataURL();
                image.alt = '';
                item.append(image, label);
                byId('legend').append(item);
            }
        }

        clearInput() {
            this.spaceHeld = false;
            const field = byId('playfield');
            if (this.pointerId !== null && field.hasPointerCapture(this.pointerId)) field.releasePointerCapture(this.pointerId);
            this.pointerId = null;
        }

        start() {
            if (this.state !== STATES.AWAITING_START && this.state !== STATES.GAME_OVER) return;
            for (const segment of this.segments) segment.view.destroy();
            for (const effect of this.effects) effect.object.destroy();
            this.segments = [];
            this.effects = [];
            this.score = 0;
            this.level = 1;
            this.bonus = 0;
            this.coinStreak = 0;
            this.newBest = false;
            this.elapsed = 0;
            this.scroll = 0;
            this.nextPattern = 385;
            this.patternIndex = 0;
            this.coffeeUntil = 0;
            this.crashUntil = 0;
            this.flashUntil = 0;
            this.bannerUntil = 0;
            this.verticalSpeed = 0;
            this.nextExhaust = 0;
            this.idleLine = 0;
            this.player.clearTint().setAngle(0).setPosition(START_X, FLOOR_Y);
            this.drawTaggy();
            this.banner.setVisible(false);
            this.drawScenery();
            this.selectStore(null);
            this.setRoundState(STATES.PLAYING);
            this.speak("Price Right. Let's roll.");
            this.updateStats();
            byId('playfield').focus({ preventScroll: true });
            track('game_start');
        }

        setRoundState(state) {
            this.state = state;
            this.clearInput();
            if (state === STATES.PLAYING) this.player.anims.resume();
            else this.player.anims.pause();
            this.renderState();
        }

        renderState() {
            const { AWAITING_START, PLAYING, PAUSED, GAME_OVER } = STATES;
            const intro = this.state === AWAITING_START;
            byId('start').disabled = false;
            byId('start').hidden = !intro;
            byId('intro').hidden = !intro;
            byId('pause').hidden = this.state !== PLAYING && this.state !== PAUSED;
            byId('pause').textContent = this.state === PAUSED ? 'Resume' : 'Pause';
            document.body.classList.toggle('in-flight', this.state === PLAYING);
            byId('status').textContent = this.state === PAUSED ? 'Run paused. Select Resume to continue.' : '';
            byId('result').hidden = this.state !== GAME_OVER;
            byId('game-area').hidden = this.state === GAME_OVER;
        }

        updateStats() {
            byId('score').textContent = this.score;
            byId('level').textContent = this.level;
            const remaining = Math.max(0, Math.ceil((this.coffeeUntil - this.elapsed) / 1000));
            const effects = remaining ? 'Coffee ' + remaining + 's � x2' : '';
            const indicator = byId('effects');
            if (indicator.textContent !== effects) indicator.textContent = effects;
            indicator.hidden = !effects || this.state === STATES.GAME_OVER;
        }

        update(_, delta) {
            if (this.state !== STATES.PLAYING) return;
            // Small substeps keep collision and pattern crossings reliable on slow frames.
            let remaining = Math.min(delta, 64);
            while (remaining > 0 && this.state === STATES.PLAYING) {
                const step = Math.min(remaining, 8);
                this.advance(step);
                remaining -= step;
            }
            if (this.state !== STATES.PLAYING) return;
            this.drawScenery();
            this.updateStats();
            this.updateEffects();
            this.updateSpeech();
        }

        advance(step) {
            this.elapsed += step;
            const dt = step / 1000;
            if (this.crashUntil) {
                if (this.elapsed >= this.crashUntil) this.finish();
                return;
            }
            this.fly(dt);
            const distance = scrollSpeed(this.scroll) * dt;
            this.scroll += distance;
            if (this.scroll >= this.nextPattern) {
                const pattern = PATTERNS[this.patternIndex % PATTERNS.length];
                this.spawnPattern(pattern, this.patternIndex++);
                this.nextPattern += pattern.spacing;
            }
            this.score = Math.floor(this.scroll / 20) + this.bonus;
            const level = 1 + Math.floor(this.scroll / LEVEL_DISTANCE);
            if (level > this.level) {
                this.level = level;
                this.banner.setText('LEVEL ' + level).setVisible(true);
                this.bannerUntil = this.elapsed + 1100;
                this.speak('Level ' + level + '. Faster now.');
            }
            if (!this.newBest && this.best.score > 0 && this.score > this.best.score) {
                this.newBest = true;
                this.speak('New best. Nice flying.');
            }
            for (const segment of this.segments) {
                segment.view.x -= distance;
                this.checkPattern(segment);
                if (this.crashUntil) break;
            }
            while (this.segments[0]?.view.x < -200) this.segments.shift().view.destroy();
        }

        fly(dt) {
            const thrusting = this.spaceHeld || this.pointerId !== null;
            const acceleration = GRAVITY - (thrusting ? THRUST : 0);
            this.verticalSpeed = Phaser.Math.Clamp(this.verticalSpeed + acceleration * dt,
                -MAX_VERTICAL_SPEED, MAX_VERTICAL_SPEED);
            const y = this.player.y + this.verticalSpeed * dt;
            this.player.y = Phaser.Math.Clamp(y, CEILING_Y, FLOOR_Y);
            if (y !== this.player.y) this.verticalSpeed = 0;
            if (thrusting && !this.reducedMotion.matches && this.elapsed >= this.nextExhaust) {
                this.addEffect(this.add.circle(START_X, this.player.y + 32, 7, BRAND_RED), 180, -19);
                this.nextExhaust = this.elapsed + 65;
            }
            this.player.setAngle(this.reducedMotion.matches ? 0 : this.verticalSpeed / MAX_VERTICAL_SPEED * 9);
            this.drawTaggy();
        }

        drawScenery() {
            const scroll = this.reducedMotion.matches ? 0 : this.scroll;
            this.clouds.tilePositionX = scroll * 0.10;
            this.road.tilePositionX = scroll;
            for (const { image, x, speed } of this.scenery) {
                image.x = x - (scroll * speed) % WIDTH;
            }
        }

        drawTaggy() {
            if (this.state === STATES.PLAYING && this.player.y === FLOOR_Y && !this.reducedMotion.matches) {
                this.player.play('run-right', true);
            } else if (this.player.texture.key !== 'taggy-idle-right') {
                this.player.anims.stop();
                this.player.setTexture('taggy-idle-right', 0);
            }
        }

        spawnPattern(pattern, index) {
            const view = this.add.container(WIDTH + 80, 0).setDepth(3);
            const hazard = this.add.image(0, pattern.y, pattern.key).setDisplaySize(pattern.width, pattern.height);
            view.add(hazard);
            const routeY = pattern.lane === 'high' ? 530 : 455;
            const coins = Array.from({ length: 5 }, (_, i) => {
                const y = routeY - (pattern.coins === 'arc' ? Math.sin(i / 4 * Math.PI) * 65 : 0);
                return this.add.image((i - 2) * 46, y, 'coin').setScale(0.55);
            });
            if (index % 5 === 3) coins[2].setTexture('coffee');
            view.add(coins);
            this.segments.push({ view, hazard, coins, pattern, near: false, passed: false });
        }

        checkPattern(segment) {
            const { view, hazard, pattern, coins } = segment;
            const y = this.player.y;
            const dx = Math.abs(view.x - START_X);
            const dy = Math.abs(hazard.y - y);
            // Use the opaque cap or base, with a small forgiving inset on each side.
            const halfWidth = pattern.width * (pattern.key === 'tire' ? 0.36 : 0.42);
            const halfHeight = pattern.height * (pattern.key === 'tire' ? 0.36 : 0.44);
            if (pattern.key === 'tire' && !this.reducedMotion.matches) hazard.rotation = this.scroll / 48;
            if (dx < halfWidth + PLAYER_HALF_WIDTH && dy < halfHeight + PLAYER_HALF_HEIGHT) {
                this.hitObstacle();
                return;
            }
            if (dx < halfWidth && dy < halfHeight + PLAYER_HALF_HEIGHT + 20) segment.near = true;
            if (!segment.passed && view.x + halfWidth + PLAYER_HALF_WIDTH < START_X) {
                segment.passed = true;
                if (segment.near) {
                    this.addBonus(5);
                    this.showFeedback('CLOSE! +5', START_X, y);
                    this.speak('Whoa, tight one!');
                }
            }
            for (const coin of coins) {
                if (!coin.visible) continue;
                const x = view.x + coin.x;
                if (Math.abs(x - START_X) < PLAYER_HALF_WIDTH + 15 && Math.abs(coin.y - y) < PLAYER_HALF_HEIGHT + 15) {
                    this.collectCoin(coin, x);
                } else if (x < START_X - PLAYER_HALF_WIDTH - 15) {
                    coin.setVisible(false);
                    this.coinStreak = 0;
                }
            }
        }

        addBonus(points) {
            this.bonus += points;
            this.score = Math.floor(this.scroll / 20) + this.bonus;
        }

        collectCoin(coin, x) {
            coin.setVisible(false);
            const coffee = coin.texture.key === 'coffee';
            if (coffee) {
                this.coffeeUntil = this.elapsed + COFFEE_MS;
                this.showFeedback('COFFEE x2', x, coin.y);
                this.speak('Coffee break? Maybe later.');
            } else {
                const points = this.elapsed < this.coffeeUntil ? COIN_POINTS * 2 : COIN_POINTS;
                this.addBonus(points);
                this.showFeedback('+' + points, x, coin.y);
                this.coinStreak += 1;
                if (this.coinStreak % 5 === 0) this.speak(this.coinStreak + ' tags in a row.');
                else if (this.coinStreak === 1) this.speak('One for the road.');
            }
            this.playPickupSound(coffee ? 'coffee' : 'score');
            track('pickup_collect', { type: coffee ? 'coffee' : 'score' });
        }

        hitObstacle() {
            this.playPickupSound('crash');
            this.crashAt = this.elapsed;
            this.crashUntil = this.elapsed + CRASH_MS;
            this.flashUntil = this.elapsed + 180;
            this.clearInput();
            this.player.anims.pause();
            this.speak("Ouch... that's a tag!");
            if (!this.reducedMotion.matches) this.player.setTint(0xff8267);
        }

        speak(line) {
            this.lastSpeech = this.elapsed;
            this.speechUntil = this.elapsed + 2000;
            const bubble = byId('speech');
            bubble.textContent = line;
            bubble.hidden = false;
            this.updateSpeech();
        }

        updateSpeech() {
            const bubble = byId('speech');
            if (!this.crashUntil && this.elapsed - this.lastSpeech >= 6000) {
                this.speak(IDLE_LINES[this.idleLine++ % IDLE_LINES.length]);
                return;
            }
            if (this.elapsed >= this.speechUntil) {
                bubble.hidden = true;
                return;
            }
            bubble.hidden = false;
            const field = byId('playfield');
            const scale = field.clientWidth / WIDTH;
            const width = bubble.offsetWidth / (scale || 1);
            const height = bubble.offsetHeight / (scale || 1);
            const { x, y } = this.player;
            const clampX = (left) => Phaser.Math.Clamp(left, 8, WIDTH - width - 8);
            const clampY = (top) => Phaser.Math.Clamp(top, 8, HEIGHT - height - 8);
            const places = [
                [clampX(x - width / 2), y - 48 - height],
                [clampX(x - width / 2), y + 48],
                [x - 43 - width, clampY(y - height / 2)],
                [x + 43, clampY(y - height / 2)]
            ];
            const safe = places.find(([left, top]) => left >= 8 && top >= 8
                && left + width <= WIDTH - 8 && top + height <= HEIGHT - 8
                && this.segments.every(({ view, pattern }) => left + width < view.x - pattern.width / 2
                    || left > view.x + pattern.width / 2
                    || top + height < pattern.y - pattern.height / 2 || top > pattern.y + pattern.height / 2));
            bubble.hidden = !safe;
            if (!safe) return;
            bubble.style.left = safe[0] * scale + 'px';
            bubble.style.top = safe[1] * scale + 'px';
            bubble.style.opacity = this.reducedMotion.matches ? 1 : Math.min(1, (this.speechUntil - this.elapsed) / 360);
        }

        showFeedback(label, x, y, color = '#fff6df') {
            const popup = this.add.text(Phaser.Math.Clamp(x, 100, WIDTH - 100), Math.max(45, y - 22), label, {
                fontFamily: 'monospace', fontSize: '25px', fontStyle: 'bold',
                color, stroke: '#172635', strokeThickness: 6
            }).setOrigin(0.5);
            this.addEffect(popup, 850, 32);
        }

        addEffect(object, duration, rise) {
            object.setDepth(7);
            this.effects.push({ object, start: this.elapsed, duration, rise, y: object.y });
        }

        updateEffects() {
            if (this.elapsed >= this.bannerUntil) this.banner.setVisible(false);
            if (this.elapsed >= this.flashUntil) this.player.clearTint();
            this.effects = this.effects.filter(({ object, start, duration, rise, y }) => {
                const progress = (this.elapsed - start) / duration;
                if (progress >= 1) {
                    object.destroy();
                    return false;
                }
                if (!this.reducedMotion.matches) object.y = y - progress * rise;
                object.alpha = 1 - Math.max(0, progress - 0.45) / 0.55;
                return true;
            });
        }

        playPickupSound(type) {
            if (this.muted || this.audio?.state !== 'running') return;
            const notes = { score: [620, 830], coffee: [420, 630, 940], crash: [145, 80] };
            notes[type].forEach((frequency, index) => {
                const start = this.audio.currentTime + index * 0.08;
                const tone = this.audio.createOscillator();
                const gain = this.audio.createGain();
                tone.frequency.value = frequency;
                gain.gain.setValueAtTime(0.08, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
                tone.connect(gain).connect(this.audio.destination);
                tone.start(start);
                tone.stop(start + 0.1);
            });
        }

        finish() {
            const record = this.score > this.best.score;
            this.best = { score: Math.max(this.best.score, this.score), level: Math.max(this.best.level, this.level) };
            try {
                localStorage.setItem(BEST_KEY, JSON.stringify(this.best));
            } catch {
                // Keep the session best even when storage is blocked.
            }
            byId('final-score').textContent = 'Score ' + this.score + ' · Level ' + this.level;
            byId('outcome').textContent = 'Best score ' + this.best.score + ' · Best level ' + this.best.level;
            this.setRoundState(STATES.GAME_OVER);
            byId('effects').hidden = true;
            byId('speech').hidden = true;
            byId('result-title').focus();
            track('game_complete', {
                result: 'crash', score: this.score, level: this.level,
                duration_seconds: Math.round(this.crashAt / 1000)
            });
        }

        selectStore(store) {
            if (store === this.store) return;
            this.store = store;
            const anchor = byId('inventory');
            anchor.hidden = !store;
            for (const button of document.querySelectorAll('[data-store]')) {
                button.setAttribute('aria-pressed', String(button.dataset.store === store));
            }
            if (!store) {
                anchor.removeAttribute('href');
                byId('store-status').textContent = 'Select a store to enable the inventory link.';
                return;
            }
            anchor.setAttribute('href', STORE_URLS[store]);
            anchor.textContent = 'Browse ' + (store === 'dewitt' ? 'DeWitt' : 'Sterling Heights') + ' inventory';
            byId('store-status').textContent = '';
            track('store_selected', { store });
        }
    }

    return new Phaser.Game({
        type: Phaser.AUTO,
        width: WIDTH,
        height: HEIGHT,
        parent: 'playfield',
        scale: { mode: Phaser.Scale.NONE },
        pixelArt: true,
        scene: DashScene
    });
}

const game = boot();
