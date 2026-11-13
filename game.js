'use strict';

const WIDTH = 600;
const HEIGHT = 800;
const GROUND = 644;
const MOVE_SPEED = 285;
const COFFEE_MS = 5000;
const COFFEE_SPEED_MULTIPLIER = 1.35;
const GAPS_PER_LEVEL = 8;
const GATE_WIDTH = 96;
const PLAYER_HALF_WIDTH = 23;
const PLAYER_HALF_HEIGHT = 27;
const BEST_KEY = 'rv-dash-best-v3';
const CENTERS = [400, 325, 525, 350, 495, 405, 270, 445, 345, 520, 370, 455];
const LOW_HAZARDS = ['cone', 'robot', 'hydrant', 'lite_tt_v2', 'generic_bunkhouse_fifth_wheel_teal'];
const HIGH_HAZARDS = ['branch', 'banner', 'sign'];

function difficulty(level) {
    const step = level - 1;
    return {
        speed: Math.min(350, 148 * 1.09 ** step),
        opening: Math.max(176, 292 - step * 12),
        spacing: Math.max(234, 334 - step * 10)
    };
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

    const ink = 0x172635;
    const cream = 0xfff4de;
    function box(color, x, y, w, h, radius = 7) {
        graphics.fillStyle(ink).fillRoundedRect(x, y, w, h, radius);
        graphics.fillStyle(color).fillRoundedRect(x + 4, y + 4, w - 8, h - 8, Math.max(2, radius - 4));
    }
    function circle(color, x, y, radius) {
        graphics.fillStyle(ink).fillCircle(x, y, radius);
        graphics.fillStyle(color).fillCircle(x, y, radius - 4);
    }
    texture('marshmallow', 64, 64, () => {
        box(cream, 9, 10, 46, 44, 13);
        rect(0xe5b59d, 17, 42, 30, 5);
        rect(0xffffff, 19, 18, 25, 4);
    });
    texture('mile-marker', 64, 64, () => {
        box(0x85af99, 27, 35, 11, 23);
        box(0x187449, 3, 9, 58, 33);
        const letters = [['101','111','101','101','101'], ['111','010','010','010','111'],
            ['100','100','100','100','111'], ['111','100','110','100','111']];
        letters.forEach((letter, i) => letter.forEach((row, y) => [...row].forEach((pixel, x) => {
            if (pixel === '1') rect(cream, 10 + i * 12 + x * 3, 18 + y * 3, 3, 3);
        })));
    });
    texture('coffee', 64, 64, () => {
        circle(0xdb9c68, 49, 35, 12);
        box(0x8d4935, 9, 24, 40, 34, 10);
        rect(0xffd09e, 16, 31, 24, 5);
        graphics.lineStyle(4, cream).beginPath()
            .moveTo(22, 19).lineTo(25, 12).lineTo(22, 5)
            .moveTo(34, 19).lineTo(38, 12).lineTo(35, 5).strokePath();
    });
    texture('spare_tire', 64, 64, () => {
        circle(0x344353, 32, 32, 26);
        circle(0xadc2c7, 32, 32, 15);
        circle(0x435363, 32, 32, 7);
        for (const x of [17, 25, 33, 41]) rect(0x718494, x, 11, 4, 4);
    });
    texture('cone', 64, 64, () => {
        graphics.fillStyle(ink).fillTriangle(10, 50, 30, 5, 54, 50);
        graphics.fillStyle(0xf57938).fillTriangle(16, 48, 30, 12, 48, 48);
        rect(cream, 23, 29, 16, 5);
        rect(cream, 19, 40, 24, 5);
        box(0xe35632, 5, 47, 54, 12, 5);
    });
    texture('robot', 64, 64, () => {
        box(0x758b9d, 28, 5, 11, 18);
        box(0xa6bac5, 6, 16, 52, 40);
        box(0x3a4b61, 11, 25, 42, 17);
        circle(0xff4f5a, 23, 33, 7);
        circle(0xff4f5a, 41, 33, 7);
        rect(cream, 24, 45, 16, 3);
    });
    texture('hydrant', 64, 64, () => {
        box(0xe54e43, 9, 27, 46, 17);
        box(0xf66543, 20, 16, 24, 38);
        circle(0xffb375, 32, 19, 12);
        box(0xc83739, 15, 47, 34, 12, 5);
    });
    texture('branch', 64, 64, () => {
        box(0x805035, 12, 26, 43, 19);
        circle(0x417955, 18, 25, 14);
        circle(0x56956c, 33, 18, 15);
        circle(0x397e60, 48, 24, 13);
    });
    texture('banner', 64, 64, () => {
        box(0xcf4f41, 6, 14, 52, 38);
        graphics.fillStyle(cream).fillTriangle(15, 21, 29, 21, 22, 43);
        graphics.fillStyle(cream).fillTriangle(35, 21, 49, 21, 42, 43);
    });
    texture('sign', 64, 64, () => {
        box(0xf7b951, 6, 10, 52, 45);
        graphics.fillStyle(ink).fillTriangle(21, 34, 43, 34, 32, 45);
        rect(ink, 29, 21, 6, 17);
    });
    texture('sky', WIDTH, HEIGHT, () => {
        for (let y = 0; y < HEIGHT; y += 4) {
            const t = y / HEIGHT;
            const rgb = [40 + 204 * t, 78 + 111 * t, 119 + 27 * t].map(Math.round);
            rect((rgb[0] << 16) | (rgb[1] << 8) | rgb[2], 0, y, WIDTH, 4);
        }
        graphics.fillStyle(0xffdeb0).fillCircle(463, 132, 49);
        for (const [x, y] of [[0, 420], [76, 388], [156, 432], [292, 404], [440, 420], [572, 415]]) {
            graphics.fillStyle(0x648a96).fillTriangle(x - 110, 552, x, y, x + 110, 552);
        }
        rect(0x476d73, 0, 540, WIDTH, GROUND - 540);
    });
    texture('clouds', WIDTH, HEIGHT, () => {
        for (const [x, y] of [[60, 150], [290, 228], [505, 74]]) {
            graphics.fillStyle(0xfaf1d6, 0.62).fillRoundedRect(x - 36, y, 102, 23, 11);
            graphics.fillRoundedRect(x - 8, y - 12, 54, 26, 13);
        }
    });
    texture('track', WIDTH, HEIGHT - GROUND + 24, () => {
        rect(0x58686f, 0, 0, WIDTH, 24);
        rect(0xe3bf79, 0, 24, WIDTH, 5);
        rect(0x263640, 0, 29, WIDTH, HEIGHT - GROUND - 5);
        for (const x of [0, 200, 400]) {
            rect(0xc5ac78, x, 104, 96, 6);
            rect(0x334750, x + 20, 66, 44, 2);
            rect(0x334750, x + 128, 134, 24, 2);
        }
    });
    graphics.destroy();
}

const SCENERY = [
    ['prop_tree_pine', 12, 547, 104, 148, 0x83b4a6, 0.18],
    ['prop_tree_pine', 338, 548, 90, 128, 0x83b4a6, 0.18],
    ['prop_fence_segment', 85, 592, 156, 64, 0xa2b9ad, 0.36],
    ['prop_fence_segment', 400, 592, 156, 64, 0xa2b9ad, 0.36],
    ['lite_tt_v2', 168, 610, 218, 132, 0xe5efed, 0.36],
    ['generic_bunkhouse_fifth_wheel_teal', 478, 610, 248, 146, 0xe5efed, 0.36]
];

function makeScenery(scene) {
    return SCENERY.flatMap(([key, x, y, maxWidth, maxHeight, tint, speed]) => {
        if (!scene.textures.exists(key)) return [];
        const frame = scene.textures.getFrame(key);
        const scale = Math.min(maxWidth / frame.width, maxHeight / frame.height);
        return [-1, 0, 1].map((copy) => ({
            image: scene.add.image(x + copy * WIDTH, y, key).setOrigin(0.5, 1).setScale(scale).setTint(tint),
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
            this.keys = new Set();
            this.drag = null;
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
            this.road = this.add.tileSprite(0, GROUND - 24, WIDTH, HEIGHT - GROUND + 24, 'track').setOrigin(0);
            for (const side of ['left', 'right']) {
                const key = 'run-' + side;
                if (!this.anims.exists(key)) this.anims.create({
                    key,
                    frames: this.anims.generateFrameNumbers('taggy-walk-' + side, { start: 0, end: 3 }),
                    duration: 560,
                    repeat: -1
                });
            }
            this.player = this.add.sprite(150, 400, 'taggy-idle-right', 0).setScale(0.5).setDepth(5);
            this.muted = true;
            this.best = readBest();
            this.gates = [];
            this.effects = [];
            this.banner = this.add.text(WIDTH / 2, 100, '', {
                fontFamily: 'monospace', fontStyle: 'bold', fontSize: '52px',
                color: '#ffdf97', stroke: '#172635', strokeThickness: 10
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
            const gameplayKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'];
            on(document, 'keydown', (event) => {
                if (this.state !== STATES.PLAYING || !gameplayKeys.includes(event.code)
                    || event.ctrlKey || event.metaKey || event.altKey) return;
                event.preventDefault();
                this.keys.add(event.code);
            });
            on(document, 'keyup', (event) => this.keys.delete(event.code));
            const field = byId('playfield');
            on(field, 'pointerdown', (event) => {
                if (event.button !== 0 || this.drag || this.state !== STATES.PLAYING) return;
                field.setPointerCapture(event.pointerId);
                this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
                    targetX: this.player.x, targetY: this.player.y };
            });
            on(field, 'pointermove', (event) => {
                if (this.drag?.id !== event.pointerId) return;
                const rect = field.getBoundingClientRect();
                const drag = this.drag;
                drag.targetX = Phaser.Math.Clamp(drag.targetX + (event.clientX - drag.x) * WIDTH / rect.width, 35, WIDTH - 35);
                drag.targetY = Phaser.Math.Clamp(drag.targetY + (event.clientY - drag.y) * HEIGHT / rect.height, 34, HEIGHT - 34);
                drag.x = event.clientX;
                drag.y = event.clientY;
            });
            for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
                on(field, event, (pointer) => {
                    if (this.drag?.id === pointer.pointerId) this.drag = null;
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
            for (const [key, label] of [
                ['coffee', 'Speed boost 5s'], ['spare_tire', 'Blocks 1 hit'],
                ['marshmallow', 'Marshmallow +5'], ['mile-marker', 'Mile marker +10'],
                ['cone', 'Cone ends run'], ['robot', 'Robot ends run']
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
            this.keys.clear();
            const field = byId('playfield');
            if (this.drag && field.hasPointerCapture(this.drag.id)) field.releasePointerCapture(this.drag.id);
            this.drag = null;
        }

        start() {
            if (this.state !== STATES.AWAITING_START && this.state !== STATES.GAME_OVER) return;
            for (const gate of this.gates) this.destroyGate(gate);
            for (const effect of this.effects) effect.object.destroy();
            this.gates = [];
            this.effects = [];
            this.score = 0;
            this.level = 1;
            this.passed = 0;
            this.elapsed = 0;
            this.scroll = 0;
            this.nextGate = 0;
            this.gateIndex = 0;
            this.coffeeUntil = 0;
            this.shield = false;
            this.facing = 'right';
            this.heading = 0;
            this.crashUntil = 0;
            this.flashUntil = 0;
            this.bannerUntil = 0;
            this.player.clearTint().setAngle(0).setPosition(150, 400);
            this.drawTaggy(false);
            this.banner.setVisible(false);
            this.drawScenery();
            this.selectStore(null);
            this.setRoundState(STATES.PLAYING);
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
            byId('status').textContent = this.state === PAUSED ? 'Run paused. Select Resume to continue.' : '';
            byId('result').hidden = this.state !== GAME_OVER;
            byId('game-area').hidden = this.state === GAME_OVER;
        }

        updateStats() {
            byId('score').textContent = this.score;
            byId('level').textContent = this.level;
            const remaining = Math.max(0, Math.ceil((this.coffeeUntil - this.elapsed) / 1000));
            const effects = [remaining && 'Coffee ' + remaining + 's · x2', this.shield && 'Spare tire ready']
                .filter(Boolean).join(' · ');
            const indicator = byId('effects');
            if (indicator.textContent !== effects) indicator.textContent = effects;
            indicator.hidden = !effects || this.state === STATES.GAME_OVER;
        }

        update(_, delta) {
            if (this.state !== STATES.PLAYING) return;
            // Small substeps keep collision and gate crossings reliable on slow frames.
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
        }

        advance(step) {
            this.elapsed += step;
            const dt = step / 1000;
            if (this.crashUntil) {
                if (this.elapsed >= this.crashUntil) this.finish();
                return;
            }
            this.steer(dt);
            const { speed, opening, spacing } = difficulty(this.level);
            const distance = speed * dt;
            this.scroll += distance;
            if (this.scroll >= this.nextGate) {
                this.spawnGate(opening);
                this.nextGate = this.scroll + spacing;
            }
            for (const gate of this.gates) {
                gate.view.x -= distance;
                this.checkGate(gate);
                if (this.crashUntil) break;
            }
            this.gates = this.gates.filter((gate) => {
                if (gate.view.x > -GATE_WIDTH) return true;
                this.destroyGate(gate);
                return false;
            });
        }

        steer(dt) {
            const key = (a, b) => Number(this.keys.has(a) || this.keys.has(b));
            let x = key('ArrowRight', 'KeyD') - key('ArrowLeft', 'KeyA');
            let y = key('ArrowDown', 'KeyS') - key('ArrowUp', 'KeyW');
            const speed = MOVE_SPEED * (this.elapsed < this.coffeeUntil ? COFFEE_SPEED_MULTIPLIER : 1);
            let travel = speed * dt;
            if (this.drag) {
                x = this.drag.targetX - this.player.x;
                y = this.drag.targetY - this.player.y;
                travel = Math.min(travel, Math.hypot(x, y));
            }
            const length = Math.hypot(x, y);
            if (length > 0.001) {
                this.player.x = Phaser.Math.Clamp(this.player.x + travel * x / length, 35, WIDTH - 35);
                this.player.y = Phaser.Math.Clamp(this.player.y + travel * y / length, 34, HEIGHT - 34);
            }
            if (Math.abs(x) > 0.1) {
                const heading = Math.sign(x);
                if (this.heading && heading !== this.heading && !this.reducedMotion.matches) {
                    this.addEffect(this.add.circle(this.player.x - heading * 23, this.player.y + 22, 9, 0xf4dab5), 290, 18);
                }
                this.heading = heading;
                this.facing = x < 0 ? 'left' : 'right';
            }
            const tilt = length > 0.001 ? Phaser.Math.Clamp(y / length * 9 + x / length * 4, -12, 12) : 0;
            this.player.setAngle(this.reducedMotion.matches ? 0 : tilt);
            this.drawTaggy(length > 0.001);
        }

        drawScenery() {
            const scroll = this.reducedMotion.matches ? 0 : this.scroll;
            this.clouds.tilePositionX = scroll * 0.10;
            this.road.tilePositionX = scroll;
            for (const { image, x, speed } of this.scenery) {
                image.x = x - (scroll * speed) % WIDTH;
            }
        }

        drawTaggy(moving) {
            if (moving && !this.reducedMotion.matches) {
                this.player.play('run-' + this.facing, true);
                return;
            }
            const key = 'taggy-idle-' + this.facing;
            if (this.player.texture.key !== key || this.player.anims.isPlaying) {
                this.player.anims.stop();
                this.player.setTexture(key, 0);
            }
        }

        spawnGate(opening) {
            const index = this.gateIndex++;
            const center = CENTERS[index % CENTERS.length];
            const top = center - opening / 2;
            const bottom = center + opening / 2;
            const view = this.add.container(WIDTH + GATE_WIDTH / 2, 0).setDepth(3);
            const high = HIGH_HAZARDS[index % HIGH_HAZARDS.length];
            const low = LOW_HAZARDS[index % LOW_HAZARDS.length];
            const hazards = [
                this.makeHazard(view, 0, top, high, true),
                this.makeHazard(view, bottom, HEIGHT, low, false)
            ];
            const key = index % 13 === 8 ? 'spare_tire' : index % 7 === 3 ? 'coffee'
                : index % 2 ? 'mile-marker' : 'marshmallow';
            const pickup = this.add.image(0, center, key).setScale(0.76);
            view.add(pickup);
            this.gates.push({ view, center, hazards, pickup, passed: false, close: false, hit: false });
        }

        makeHazard(view, top, bottom, key, high) {
            const graphic = this.add.graphics();
            const left = -GATE_WIDTH / 2;
            const height = bottom - top;
            const cap = high ? bottom - 10 : top + 10;
            graphic.fillStyle(0x172635).fillRoundedRect(left, top, GATE_WIDTH, height, 12);
            graphic.fillStyle(high ? 0x2c4654 : 0x3a4c58).fillRoundedRect(left + 4, top + 4, GATE_WIDTH - 8, height - 8, 9);
            for (let y = top + 24; y < bottom - 22; y += 28) {
                graphic.fillStyle(0x56717a, 0.38).fillRoundedRect(left + 11, y, GATE_WIDTH - 22, 3, 1);
            }
            graphic.fillStyle(0xf0a35c).fillRoundedRect(left + 8, cap - 3, GATE_WIDTH - 16, 6, 3);
            const icon = this.add.image(0, high ? bottom - 42 : top + 43, key);
            const scale = Math.min(76 / icon.width, 65 / icon.height);
            icon.setScale(scale);
            view.add([graphic, icon]);
            return { graphic, icon, top, bottom, alive: true };
        }

        destroyGate(gate) {
            gate.view.destroy();
        }

        checkGate(gate) {
            const { x, y } = this.player;
            const horizontal = Math.abs(x - gate.view.x);
            const reach = PLAYER_HALF_WIDTH + GATE_WIDTH / 2;
            if (horizontal < reach) {
                for (const hazard of gate.hazards) {
                    if (!hazard.alive) continue;
                    const clearance = y < hazard.top ? hazard.top - y - PLAYER_HALF_HEIGHT
                        : y > hazard.bottom ? y - hazard.bottom - PLAYER_HALF_HEIGHT : -1;
                    if (clearance <= 0) {
                        this.hitObstacle(gate, hazard);
                        if (this.crashUntil) return;
                    } else if (clearance <= 15) gate.close = true;
                }
            }
            if (gate.pickup.visible && horizontal < PLAYER_HALF_WIDTH + 20 && Math.abs(y - gate.center) < PLAYER_HALF_HEIGHT + 20) {
                this.collectPickup(gate);
            }
            // Count only when the gate has cleared Taggy and cannot still be ahead of his left bound.
            if (!gate.passed && gate.view.x + GATE_WIDTH / 2 < 35 - PLAYER_HALF_WIDTH) {
                gate.passed = true;
                this.passed += 1;
                if (!gate.hit) {
                    this.addScore(10);
                    if (gate.close) {
                        const bonus = this.addScore(5);
                        this.showFeedback('✦ CLOSE! +' + bonus, x, y, '#fff1a8');
                        if (!this.reducedMotion.matches) {
                            this.addEffect(this.add.star(x + 26, y - 14, 4, 3, 12, 0xffe39a), 420, 30);
                        }
                    }
                }
                if (this.passed % GAPS_PER_LEVEL === 0) {
                    this.level += 1;
                    this.banner.setText('LEVEL ' + this.level).setVisible(true);
                    this.bannerUntil = this.elapsed + 1100;
                }
            }
        }

        addScore(points) {
            const amount = points * (this.elapsed < this.coffeeUntil ? 2 : 1);
            this.score += amount;
            return amount;
        }

        collectPickup(gate) {
            const key = gate.pickup.texture.key;
            gate.pickup.setVisible(false);
            let type = 'score';
            let label;
            if (key === 'coffee') {
                this.coffeeUntil = this.elapsed + COFFEE_MS;
                type = 'coffee';
                label = 'BOOST!';
            } else if (key === 'spare_tire') {
                this.shield = true;
                type = 'spare_tire';
                label = 'SHIELD!';
            } else {
                label = '+' + this.addScore(key === 'marshmallow' ? 5 : 10);
            }
            this.showFeedback(label, gate.view.x, gate.center);
            this.playPickupSound(type);
            track('pickup_collect', { type });
        }

        hitObstacle(gate, hazard) {
            gate.hit = true;
            this.playPickupSound('crash');
            if (this.shield) {
                this.shield = false;
                hazard.alive = false;
                hazard.graphic.destroy();
                hazard.icon.destroy();
                this.showFeedback('SHIELD USED', this.player.x, this.player.y);
                this.flashUntil = this.elapsed + 145;
            } else {
                this.crashUntil = this.elapsed + 220;
                this.clearInput();
                this.player.anims.pause();
            }
            if (!this.reducedMotion.matches) this.player.setTint(0xff8267);
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
            if (this.elapsed >= this.flashUntil && !this.crashUntil) this.player.clearTint();
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
            const notes = { score: [620, 830], coffee: [420, 630, 940], spare_tire: [330, 440, 550], crash: [145, 80] };
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
            byId('result-title').focus();
            track('game_complete', {
                result: 'crash', score: this.score, level: this.level,
                duration_seconds: Math.round((this.elapsed - 220) / 1000)
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
