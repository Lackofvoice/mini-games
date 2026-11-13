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

    // Replace this block and its frame map when the approved Taggy sheet is available.
    const poses = [[0, 0, 0], [0, 0, 4], [-4, 4, 0], [4, -4, 0], [4, -4, 4]];
    poses.forEach(([left, right, rise], index) => {
        texture('taggy-' + index, 56, 64, () => {
            rect(0x19232c, 4, 8 - rise, 40, 40);
            rect(0x19232c, 44, 16 - rise, 8, 24);
            rect(0xda393f, 8, 12 - rise, 36, 32);
            rect(0xda393f, 44, 20 - rise, 4, 16);
            rect(0xff6e65, 12, 12 - rise, 28, 4);
            rect(0xf6f0df, 40, 24 - rise, 4, 4);
            rect(0x19232c, 16, 24 - rise, 4, 8);
            rect(0x19232c, 28, 24 - rise, 4, 8);
            rect(0x19232c, 20, 36 - rise, 8, 4);
            rect(0x19232c, 12 + left, 44 - rise, 8, 12);
            rect(0x19232c, 32 + right, 44 - rise, 8, 12);
            rect(0xf6f0df, 12 + left, 56 - rise, 12, 8);
            rect(0xf6f0df, 32 + right, 56 - rise, 12, 8);
        });
    });
    for (const [key, color] of [['token-gold', 0xffd17a], ['token-blue', 0x8de5fc]]) {
        texture(key, 32, 32, () => {
            rect(0x19232c, 0, 4, 32, 24);
            rect(0x19232c, 4, 0, 24, 32);
            rect(color, 4, 8, 24, 16);
            rect(color, 8, 4, 16, 24);
            rect(0xf6f0df, 12, 12, 8, 8);
        });
    }
    texture('cone', 48, 44, () => {
        rect(0x19232c, 0, 36, 48, 8);
        rect(0xf58343, 8, 28, 32, 8);
        rect(0xf58343, 16, 12, 16, 16);
        rect(0xf58343, 20, 0, 8, 12);
        rect(0xf6f0df, 16, 20, 16, 8);
    });
    texture('robot', 48, 44, () => {
        rect(0x19232c, 4, 8, 40, 36);
        rect(0xa58aff, 8, 12, 32, 24);
        rect(0x19232c, 12, 20, 24, 8);
        rect(0x8de5fc, 16, 20, 4, 4);
        rect(0x8de5fc, 28, 20, 4, 4);
        rect(0xa58aff, 20, 0, 8, 8);
    });
    texture('lot', 600, HEIGHT, () => {
        rect(0x294956, 0, 0, WIDTH, HEIGHT);
        rect(0xffd17a, 420, 100, 76, 76);
        rect(0x355c65, 0, 300, WIDTH, 208);
        rect(0x41636a, 0, 508, WIDTH, GROUND - 508);
        for (const x of [28, 300]) {
            rect(0x19232c, x, 456, 192, 104);
            rect(0xe2dbca, x + 4, 460, 184, 88);
            rect(0x8fabb4, x + 16, 472, 52, 28);
            rect(0x8fabb4, x + 112, 472, 60, 28);
            rect(0x9e5952, x + 4, 516, 184, 8);
            rect(0x294956, x + 76, 472, 28, 72);
            rect(0x19232c, x + 28, 544, 32, 28);
            rect(0x19232c, x + 140, 544, 32, 28);
        }
        rect(0x718691, 0, GROUND, WIDTH, 8);
        rect(0x263640, 0, GROUND + 8, WIDTH, HEIGHT - GROUND - 8);
        for (const x of [0, 200, 400]) rect(0xffd17a, x, GROUND + 72, 96, 8);
    });
    graphics.destroy();

    for (const [key, frames, rate] of [
        ['idle', [0, 1], 2], ['run', [2, 0, 3, 0], 9], ['jump', [4], 1]
    ]) {
        if (!scene.anims.exists(key)) {
            scene.anims.create({
                key, frames: frames.map((index) => ({ key: 'taggy-' + index })),
                frameRate: rate, repeat: key === 'jump' ? 0 : -1
            });
        }
    }
}

function boot() {
    if (!window.Phaser) {
        byId('status').textContent = 'RV Dash could not load. Check your connection and refresh to try again.';
        return;
    }

    class DashScene extends Phaser.Scene {
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
            this.lot = this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'lot').setOrigin(0);
            const floor = this.add.zone(WIDTH / 2, GROUND + 16, WIDTH, 32);
            this.physics.add.existing(floor, true);
            this.physics.world.setBounds(0, 0, WIDTH, HEIGHT, true, true, true, false);
            this.player = this.physics.add.sprite(104, GROUND - 32, 'taggy-0')
                .setCollideWorldBounds(true);
            this.player.body.setSize(36, 60).setOffset(10, 4);
            this.tokens = this.physics.add.group({ allowGravity: false, maxSize: 8 });
            this.obstacles = this.physics.add.group({ allowGravity: false, maxSize: 8 });
            this.physics.add.collider(this.player, floor);
            this.physics.add.overlap(this.player, this.tokens, (_, token) => this.contact(token, 10));
            this.physics.add.overlap(this.player, this.obstacles, (_, obstacle) => this.contact(obstacle, -5));
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
            on(byId('start'), 'click', () => this.start());
            on(byId('replay'), 'click', () => this.start());
            on(byId('pause'), 'click', () => {
                this.setRoundState(this.state === STATES.PLAYING ? STATES.PAUSED : STATES.PLAYING);
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
            this.lot.tilePositionX = 0;
            this.tokens.clear(true, true);
            this.obstacles.clear(true, true);
            this.player.body.reset(104, GROUND - 100);
            this.player.play('idle');
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
            this.player.setVelocityY(-JUMP_SPEED).play('jump', true);
        }

        updateStats() {
            byId('score').textContent = this.score;
            const seconds = Math.ceil((ROUND_MS - this.elapsed) / 1000);
            if (byId('time').textContent !== String(seconds)) byId('time').textContent = seconds;
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
            if (!this.reducedMotion.matches) this.lot.tilePositionX += LOT_SPEED * step / 1000;
            const touch = [...this.held.values()];
            const left = this.keys.has('ArrowLeft') || this.keys.has('left') || touch.includes('left');
            const right = this.keys.has('ArrowRight') || this.keys.has('right') || touch.includes('right');
            this.player.setVelocityX((Number(right) - Number(left)) * MOVE_SPEED);
            if (this.player.body.blocked.down && this.player.body.velocity.y >= 0) {
                this.player.play(this.reducedMotion.matches ? 'idle' : 'run', true);
            }
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

        spawn() {
            const slot = this.spawnIndex++ % 6;
            const isObstacle = slot === 2 || slot === 5;
            const group = isObstacle ? this.obstacles : this.tokens;
            const key = ['token-gold', 'token-blue', 'cone', 'token-gold', 'token-blue', 'robot'][slot];
            const y = GROUND - (isObstacle ? 22 : slot === 4 ? 117 : 32);
            const item = group.getFirstDead(true, WIDTH + 32, y, key);
            if (!item) return;
            item.setTexture(key).enableBody(true, WIDTH + 32, y, true, true);
            if (isObstacle) item.body.setSize(32, 36).setOffset(8, 8);
            item.setVelocityX(-LOT_SPEED);
        }

        contact(item, points) {
            if (this.state !== STATES.PLAYING || !item.active) return;
            item.disableBody(true, true);
            this.score = Math.max(0, this.score + points);
            this.updateStats();
        }

        finish() {
            const won = this.score >= WIN_SCORE;
            byId('final-score').textContent = 'Final score: ' + this.score;
            byId('outcome').textContent = won ? 'You reached the target!' : 'You fell short of 50 points. Give it another run!';
            this.setRoundState(STATES.GAME_OVER);
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

    new Phaser.Game({
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

boot();
