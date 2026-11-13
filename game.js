'use strict';

const WIDTH = 600;
const HEIGHT = 800;
const GROUND = 644;
const ROUND_MS = 60_000;
const WIN_SCORE = 50;
const GRAVITY = 1050;
const JUMP_SPEED = 510;
const MOVE_SPEED = 210;
const LOT_SPEED = 235;
const SPAWN_MS = 1250;
const COFFEE_MS = 5000;
const COFFEE_SPEED_MULTIPLIER = 1.35;
const COFFEE_OBSTACLE_GAP = 6250;
const SPAWN_PATTERN = [
    'marshmallow', 'mile-marker', 'cone', 'marshmallow', 'coffee',
    'robot', 'mile-marker', 'marshmallow', 'cone', 'mile-marker',
    'spare_tire', 'robot', 'marshmallow', 'mile-marker', 'cone', 'marshmallow'
];
const OBSTACLES = new Set(['cone', 'robot']);
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

    function pickup(key, fill, draw) {
        texture(key, 44, 44, () => {
            rect(0x19232c, 0, 8, 44, 28);
            rect(0x19232c, 8, 0, 28, 44);
            rect(fill, 4, 12, 36, 20);
            rect(fill, 12, 4, 20, 36);
            draw();
        });
    }
    pickup('marshmallow', 0x65dca7, () => {
        rect(0x684d38, 24, 24, 4, 12);
        rect(0xfff6df, 12, 12, 20, 16);
        rect(0xe2ad79, 16, 24, 16, 4);
    });
    pickup('mile-marker', 0x8de5fc, () => {
        rect(0x245360, 20, 24, 4, 12);
        rect(0x245360, 12, 12, 20, 16);
        rect(0xf6f0df, 16, 16, 12, 4);
        rect(0xf6f0df, 20, 20, 4, 4);
    });
    pickup('coffee', 0xffd17a, () => {
        rect(0x80513f, 28, 16, 8, 12);
        rect(0xf6f0df, 12, 12, 20, 20);
        rect(0x80513f, 16, 16, 12, 12);
        rect(0xf6f0df, 16, 32, 12, 4);
    });
    pickup('spare_tire', 0xcbabff, () => {
        rect(0x232b3a, 12, 8, 20, 28);
        rect(0x232b3a, 8, 12, 28, 20);
        rect(0xf6f0df, 16, 16, 12, 12);
        rect(0x6752a0, 20, 20, 4, 4);
    });
    texture('cone', 48, 44, () => {
        rect(0x19232c, 0, 36, 48, 8);
        rect(0xf58343, 8, 28, 32, 8);
        rect(0xf58343, 16, 12, 16, 16);
        rect(0xf58343, 20, 0, 8, 12);
        rect(0xf6f0df, 16, 20, 16, 8);
    });
    texture('robot', 48, 44, () => {
        rect(0x19232c, 4, 8, 40, 36);
        rect(0xd54c45, 8, 12, 32, 24);
        rect(0x19232c, 12, 20, 24, 8);
        rect(0xffd17a, 16, 20, 4, 4);
        rect(0xffd17a, 28, 20, 4, 4);
        rect(0xd54c45, 20, 0, 8, 8);
    });
    texture('sky', WIDTH, HEIGHT, () => {
        rect(0x31566b, 0, 0, WIDTH, HEIGHT);
        rect(0x4e7e8f, 0, 244, WIDTH, 260);
        rect(0x75a6aa, 0, 368, WIDTH, 176);
        rect(0xffd17a, 424, 106, 68, 68);
        for (const [x, y] of [[24, 164], [242, 108], [476, 225]]) {
            rect(0xbad8d6, x, y, 112, 12);
            rect(0xbad8d6, x + 24, y - 12, 60, 12);
        }
        for (const [x, y] of [[0, 420], [76, 388], [156, 432], [292, 404], [440, 420]]) {
            rect(0x567d83, x, y, 160, 112);
            rect(0x567d83, x + 28, y - 16, 96, 16);
        }
        rect(0x345862, 0, 516, WIDTH, GROUND - 516);
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
            for (const [side, suffix] of [['right', ''], ['left', '_l']]) {
                for (const pose of ['idle', 'walk']) {
                    this.load.spritesheet('taggy-' + pose + '-' + side,
                        'game_assets/taggy/taggy_' + pose + suffix + '.png',
                        { frameWidth: 160, frameHeight: 144 });
                }
            }
            for (const key of new Set(SCENERY.map(([name]) => name))) {
                this.load.image(key, 'game_assets/simlab/' + key + '.png');
            }
        }

        create() {
            this.state = STATES.AWAITING_START;
            this.score = 0;
            this.elapsed = 0;
            this.nextSpawn = SPAWN_MS;
            this.spawnIndex = 0;
            this.store = null;
            this.held = new Map();
            this.keys = new Set();
            this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
            makeTextures(this);
            if (['idle-right', 'walk-right', 'idle-left', 'walk-left']
                .some((pose) => !this.textures.exists('taggy-' + pose))) {
                byId('status').textContent = 'Taggy could not load. Refresh to try again.';
                return;
            }
            this.lot = this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'sky').setOrigin(0);
            this.scenery = makeScenery(this);
            this.road = this.add.tileSprite(0, GROUND - 24, WIDTH, HEIGHT - GROUND + 24, 'track').setOrigin(0);
            this.scroll = 0;
            for (const side of ['left', 'right']) {
                const key = 'run-' + side;
                if (!this.anims.exists(key)) this.anims.create({
                    key,
                    frames: this.anims.generateFrameNumbers('taggy-walk-' + side, { start: 0, end: 3 }),
                    duration: 560,
                    repeat: -1
                });
            }
            const floor = this.add.zone(WIDTH / 2, GROUND + 16, WIDTH, 32);
            this.physics.add.existing(floor, true);
            this.physics.world.setBounds(0, 0, WIDTH, HEIGHT, true, true, true, false);
            this.facing = 'right';
            this.player = this.physics.add.sprite(104, GROUND - 32, 'taggy-idle-right', 0)
                .setScale(0.5).setCollideWorldBounds(true).setDepth(2);
            this.player.body.setSize(72, 120).setOffset(44, 16);
            this.muted = true;
            this.coffeeUntil = 0;
            this.shield = false;
            this.lastObstacle = -Infinity;
            this.feedbackUntil = 0;
            this.popup = this.add.text(0, 0, '', {
                fontFamily: 'monospace', fontSize: '26px', fontStyle: 'bold',
                color: '#fff6df', stroke: '#19232c', strokeThickness: 5
            }).setOrigin(0.5).setDepth(3).setVisible(false);
            this.tokens = this.physics.add.group({ allowGravity: false, maxSize: 8 });
            this.obstacles = this.physics.add.group({ allowGravity: false, maxSize: 8 });
            this.physics.add.collider(this.player, floor);
            this.physics.add.overlap(this.player, this.tokens, (_, token) => this.collectPickup(token));
            this.physics.add.overlap(this.player, this.obstacles, (_, obstacle) => this.hitObstacle(obstacle));
            this.physics.pause();
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
            const gameplayKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'];
            on(document, 'keydown', (event) => {
                if (this.state !== STATES.PLAYING || !gameplayKeys.includes(event.code)) return;
                if (event.code === 'Space' && event.target.closest?.('button, a')) return;
                event.preventDefault();
                this.keys.add(event.code);
                if (!event.repeat && (event.code === 'ArrowUp' || event.code === 'Space')) this.jump();
            });
            on(document, 'keyup', (event) => this.keys.delete(event.code));
            for (const id of ['left', 'right']) {
                const button = byId(id);
                on(button, 'pointerdown', (event) => {
                    if (event.button !== 0 || this.state !== STATES.PLAYING) return;
                    button.setPointerCapture(event.pointerId);
                    this.held.set(event.pointerId, id);
                });
                for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
                    on(button, event, (pointer) => this.held.delete(pointer.pointerId));
                }
                on(button, 'keydown', (event) => {
                    if (event.code !== 'Space' && event.code !== 'Enter') return;
                    event.preventDefault();
                    this.keys.add(id);
                });
                on(button, 'keyup', (event) => {
                    if (event.code === 'Space' || event.code === 'Enter') this.keys.delete(id);
                });
                on(button, 'blur', () => this.keys.delete(id));
            }
            on(byId('jump'), 'pointerdown', (event) => {
                if (event.button === 0) this.jump();
            });
            on(byId('jump'), 'click', (event) => {
                if (event.detail === 0) this.jump();
            });
            on(byId('playfield'), 'pointerdown', (event) => {
                if (event.button === 0) this.jump();
            });
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

        clearInput() {
            this.keys.clear();
            this.held.clear();
        }

        start() {
            if (this.state !== STATES.AWAITING_START && this.state !== STATES.GAME_OVER) return;
            this.score = 0;
            this.elapsed = 0;
            this.nextSpawn = SPAWN_MS;
            this.spawnIndex = 0;
            this.scroll = 0;
            this.coffeeUntil = 0;
            this.shield = false;
            this.lastObstacle = -Infinity;
            this.feedbackUntil = 0;
            this.popup.setVisible(false);
            this.drawScenery();
            this.tokens.clear(true, true);
            this.obstacles.clear(true, true);
            this.player.body.reset(104, GROUND - 100);
            this.facing = 'right';
            this.drawTaggy('idle');
            this.selectStore(null);
            this.updateStats();
            this.setRoundState(STATES.PLAYING);
            byId('playfield').tabIndex = -1;
            byId('playfield').focus({ preventScroll: true });
            track('game_start');
        }

        setRoundState(state) {
            this.state = state;
            this.clearInput();
            if (state === STATES.PLAYING) {
                this.physics.resume();
                this.player.anims.resume();
            } else {
                this.physics.pause();
                this.player.setVelocityX(0);
                this.player.anims.pause();
            }
            this.renderState();
        }

        renderState() {
            const { AWAITING_START, PLAYING, PAUSED, GAME_OVER } = STATES;
            const playing = this.state === PLAYING;
            byId('start').disabled = false;
            byId('start').hidden = this.state !== AWAITING_START;
            byId('pause').hidden = !playing && this.state !== PAUSED;
            byId('pause').textContent = this.state === PAUSED ? 'Resume' : 'Pause';
            byId('status').textContent = this.state === PAUSED ? 'Round paused. Select Resume to continue.' : '';
            byId('result').hidden = this.state !== GAME_OVER;
            byId('game-area').hidden = this.state === GAME_OVER;
            for (const id of ['left', 'right', 'jump']) byId(id).disabled = !playing;
        }

        jump() {
            if (this.state !== STATES.PLAYING || !this.player.body.blocked.down || this.player.body.velocity.y < 0) return;
            this.player.setVelocityY(-JUMP_SPEED);
            this.drawTaggy('jump');
        }

        updateStats() {
            byId('score').textContent = this.score;
            const seconds = Math.ceil((ROUND_MS - this.elapsed) / 1000);
            if (byId('time').textContent !== String(seconds)) byId('time').textContent = seconds;
            const remaining = Math.max(0, Math.ceil((this.coffeeUntil - this.elapsed) / 1000));
            const effects = [remaining && 'Coffee ' + remaining + 's', this.shield && 'Spare tire ready']
                .filter(Boolean).join(' · ');
            const indicator = byId('effects');
            if (indicator.textContent !== effects) indicator.textContent = effects;
            indicator.hidden = !effects || this.state === STATES.GAME_OVER;
        }

        update(_, delta) {
            if (this.state !== STATES.PLAYING) return;
            const step = Math.min(delta, 50);
            this.elapsed = Math.min(ROUND_MS, this.elapsed + step);
            this.updateStats();
            if (this.elapsed >= ROUND_MS) {
                this.finish();
                return;
            }
            if (!this.reducedMotion.matches) {
                this.scroll += LOT_SPEED * step / 1000;
                this.drawScenery();
            }
            const touch = [...this.held.values()];
            const left = this.keys.has('ArrowLeft') || this.keys.has('left') || touch.includes('left');
            const right = this.keys.has('ArrowRight') || this.keys.has('right') || touch.includes('right');
            const direction = Number(right) - Number(left);
            if (direction) this.facing = direction < 0 ? 'left' : 'right';
            const boost = this.elapsed < this.coffeeUntil ? COFFEE_SPEED_MULTIPLIER : 1;
            this.player.setVelocityX(direction * MOVE_SPEED * boost);
            if (this.elapsed >= this.feedbackUntil) this.popup.setVisible(false);
            const grounded = this.player.body.blocked.down && this.player.body.velocity.y >= 0;
            this.drawTaggy(grounded ? (this.reducedMotion.matches ? 'idle' : 'run') : 'jump');
            for (const group of [this.tokens, this.obstacles]) {
                for (const item of group.getChildren()) {
                    if (item.active && item.x < -32) item.disableBody(true, true);
                }
            }
            if (this.elapsed >= this.nextSpawn) {
                this.spawn();
                this.nextSpawn += SPAWN_MS;
            }
        }

        drawScenery() {
            this.lot.tilePositionX = this.scroll * 0.08;
            this.road.tilePositionX = this.scroll;
            for (const { image, x, speed } of this.scenery) {
                image.x = x - (this.scroll * speed) % WIDTH;
            }
        }

        drawTaggy(pose) {
            if (pose === 'run') {
                this.player.play('run-' + this.facing, true);
                return;
            }
            const key = 'taggy-' + (pose === 'jump' ? 'walk' : 'idle') + '-' + this.facing;
            const frame = pose === 'jump' ? 1 : 0;
            if (this.player.texture.key !== key || this.player.frame.name !== frame || this.player.anims.isPlaying) {
                this.player.anims.stop();
                this.player.setTexture(key, frame);
            }
        }

        spawn() {
            const key = SPAWN_PATTERN[this.spawnIndex++ % SPAWN_PATTERN.length];
            const isObstacle = OBSTACLES.has(key);
            if (isObstacle && this.elapsed < this.coffeeUntil
                && this.elapsed - this.lastObstacle < COFFEE_OBSTACLE_GAP) return;
            const group = isObstacle ? this.obstacles : this.tokens;
            const y = GROUND - (isObstacle ? 22 : 32);
            const item = group.getFirstDead(true, WIDTH + 32, y, key);
            if (!item) return;
            item.setTexture(key).enableBody(true, WIDTH + 32, y, true, true).setDepth(1);
            if (isObstacle) {
                item.body.setSize(32, 36).setOffset(8, 8);
                this.lastObstacle = this.elapsed;
            }
            item.setVelocityX(-LOT_SPEED);
        }

        collectPickup(item) {
            if (this.state !== STATES.PLAYING || !item.active) return;
            const key = item.texture.key;
            item.disableBody(true, true);
            if (key === 'coffee') {
                this.coffeeUntil = this.elapsed + COFFEE_MS;
                this.showFeedback('Coffee boost');
            } else if (key === 'spare_tire') {
                this.shield = true;
                this.showFeedback('Spare tire ready');
            } else {
                this.score += 10;
                this.showFeedback('+10');
            }
            const type = key === 'coffee' || key === 'spare_tire' ? key : 'score';
            this.playPickupSound(type);
            track('pickup_collect', { type });
            this.updateStats();
        }

        hitObstacle(item) {
            if (this.state !== STATES.PLAYING || !item.active) return;
            item.disableBody(true, true);
            if (this.shield) {
                this.shield = false;
                this.showFeedback('Shield used');
            } else {
                const penalty = Math.min(5, this.score);
                this.score -= penalty;
                this.showFeedback(penalty ? '-' + penalty : 'Hit');
            }
            this.updateStats();
        }

        showFeedback(label) {
            this.popup.setText(label)
                .setPosition(Phaser.Math.Clamp(this.player.x, 110, WIDTH - 110), this.player.y - 54)
                .setVisible(true);
            this.feedbackUntil = this.elapsed + 900;
        }

        playPickupSound(type) {
            if (this.muted || this.audio?.state !== 'running') return;
            const notes = { score: [620, 830], coffee: [420, 630, 940], spare_tire: [330, 440, 550] };
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
            const won = this.score >= WIN_SCORE;
            byId('final-score').textContent = 'Final score: ' + this.score;
            byId('outcome').textContent = won ? 'You reached the target!' : 'You fell short of 50 points. Give it another run!';
            this.setRoundState(STATES.GAME_OVER);
            byId('effects').hidden = true;
            byId('result-title').focus();
            track('game_complete', { result: won ? 'win' : 'lose', score: this.score, duration_seconds: ROUND_MS / 1000 });
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
        physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY } } },
        scene: DashScene
    });
}

const game = boot();
