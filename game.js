'use strict';

const WIDTH = 600;
const HEIGHT = 800;
const GROUND = 644;
const GRAVITY = 690;
const THRUST = 1370;
const RISE_CAP = 330; // logical px/s, unchanged
const FALL_CAP = 330; // natural logical px/s
const ASSISTED_FALL_CAP = 346; // logical px/s, about 5% above natural
const DESCENT_BONUS = GRAVITY * 0.08; // logical px/s², added to gravity
const CEILING_Y = 36;
const FLOOR_Y = GROUND - 32;
const START_X = 150;
const EDGE_MARGIN = 54;
const MOVE_SPEED = 245;
const STEER_RESPONSE = 25; // per second, active steering
const STEER_BRAKE = 38; // per second, release and opposed inputs
const TOUCH_STEER_GAIN = 13; // per second, drag error to target velocity
const STOP_SPEED = 2; // logical px/s, zero residual drift below this speed
const MAX_HP = 5;
const START_HP = 2;
const IMMUNITY_MS = 1500;
const HEALTH_MS = 52000;
const CRASH_MS = 520;
const BRAND_RED = 0xdc2626;
const IDLE_LINES = ['Nice day for a cruise.', 'Taking the scenic route.', 'Still with me?'];
const COFFEE_MS = 5000;
const LEVEL_DISTANCE = 3000;
const SHOT_MS = 350;
const SHOT_SPEED = 690;
const ENEMIES = [
    { key: 'drone', y: 395, width: 66, height: 39, lane: 'high', hp: 1 },
    { key: 'bird', y: 300, width: 60, height: 35, lane: 'high', hp: 1 },
    { key: 'cart', y: 609, width: 85, height: 52, lane: 'low', hp: 2 }
];
const BOSS = { key: 'boss-sold', y: 290, width: 204, height: 214, lane: 'high', hp: 10 };
const SPRITES = {
    'taggy-idle-right': ['game_assets/taggy/taggy_idle.png', 160, 144, 1, 0],
    'taggy-walk-right': ['game_assets/taggy/taggy_walk.png', 160, 144, 4, 7.14],
    'prop_tree_pine': ['game_assets/simlab/prop_tree_pine.png', 0, 0, 1, 0],
    'prop_fence_segment': ['game_assets/simlab/prop_fence_segment.png', 0, 0, 1, 0],
    'lite_tt_v2': ['game_assets/simlab/lite_tt_v2.png', 0, 0, 1, 0],
    'generic_bunkhouse_fifth_wheel_teal': ['game_assets/simlab/generic_bunkhouse_fifth_wheel_teal.png', 0, 0, 1, 0],
    'taggy-fly': ['assets/sprites/taggy-fly.png', 144, 128, 4, 10],
    'taggy-shoot': ['assets/sprites/taggy-shoot.png', 144, 128, 3, 14],
    'taggy-hit': ['assets/sprites/taggy-hit.png', 144, 128, 2, 8],
    'drone': ['assets/sprites/drone.png', 96, 96, 4, 12],
    'bird': ['assets/sprites/bird.png', 96, 96, 4, 10],
    'cart': ['assets/sprites/cart.png', 120, 100, 4, 12],
    'boss-sold': ['assets/sprites/boss-sold.png', 272, 272, 4, 6],
    'bill-projectile': ['assets/sprites/bill-projectile.png', 52, 52, 4, 16],
    'coin': ['assets/sprites/coin.png', 48, 48, 6, 10],
    'pop-fx': ['assets/sprites/pop-fx.png', 96, 96, 5, 18]
};
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

const SKY_PALETTES = [
    ['dawn', '#403564', '#a06585', '#f1ad85', '#ffe1b3'],
    ['midday', '#255e93', '#568fb3', '#aed0d3', '#fff0bf'],
    ['sunset', '#473461', '#a25570', '#ee946e', '#ffd19a'],
    ['dusk', '#242b51', '#474974', '#a76d82', '#e5c9cf'],
    ['night', '#111a35', '#253454', '#495574', '#e5eaf8']
];

function cacheSkies(scene) {
    for (const [name, top, middle, horizon, light] of SKY_PALETTES) {
        const key = 'sky-' + name;
        if (scene.textures.exists(key)) continue;
        const texture = scene.textures.createCanvas(key, WIDTH, GROUND);
        const ctx = texture.context;
        const gradient = ctx.createLinearGradient(0, 0, 0, 530);
        gradient.addColorStop(0, top);
        gradient.addColorStop(0.59, middle);
        gradient.addColorStop(1, horizon);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, GROUND);
        if (name === 'night' || name === 'dusk') {
            for (let i = 0; i < (name === 'night' ? 65 : 19); i++) {
                const x = (i * 137 + 27) % WIDTH;
                const y = (i * i * 71 + 19) % 330;
                const size = i % 7 === 0 ? 3 : 1;
                ctx.fillStyle = i % 3 === 0 ? '#d8e7ff' : '#9aabc9';
                ctx.fillRect(x, y, size, size);
            }
        }
        const glow = ctx.createRadialGradient(470, 132, 12, 470, 132, 110);
        glow.addColorStop(0, light + '77');
        glow.addColorStop(1, light + '00');
        ctx.fillStyle = glow;
        ctx.fillRect(360, 22, 220, 220);
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.arc(470, 132, name === 'night' ? 32 : 43, 0, Math.PI * 2);
        ctx.fill();
        texture.refresh();
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
    texture('health', 48, 48, () => {
        box(BRAND_RED, 4, 4, 40, 40, 11);
        rect(0xffffff, 20, 12, 8, 24);
        rect(0xffffff, 12, 20, 24, 8);
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
    texture('drone', 96, 64, () => {
        box(0x89878d, 12, 24, 72, 32);
        box(0xbcbabe, 2, 12, 34, 12);
        box(0xbcbabe, 60, 12, 34, 12);
        circle(BRAND_RED, 48, 39, 12);
    });
    texture('bird', 96, 64, () => {
        graphics.fillStyle(ink).fillTriangle(13, 17, 78, 26, 54, 59);
        graphics.fillStyle(0xa86e49).fillTriangle(23, 22, 69, 30, 53, 53);
        circle(0xd8a97b, 29, 34, 15);
        graphics.fillStyle(0xffd27d).fillTriangle(2, 38, 19, 32, 19, 43);
    });
    texture('cart', 112, 80, () => {
        box(BRAND_RED, 17, 11, 86, 45, 11);
        for (const x of [31, 48, 65, 82]) box(0xbfb9b4, x, 19, 10, 29, 3);
        circle(0xa6a1a0, 33, 62, 12);
        circle(0xa6a1a0, 86, 62, 12);
    });
    texture('boss-sold', 160, 120, () => {
        box(0xa11d1d, 10, 31, 140, 84, 15);
        box(0x6b3d3c, 60, 4, 40, 37, 12);
        box(0xfff4de, 19, 53, 122, 43, 9);
        const letters = [
            ['111','100','111','001','111'], ['111','101','101','101','111'],
            ['100','100','100','100','111'], ['110','101','101','101','110']
        ];
        letters.forEach((letter, i) => letter.forEach((row, y) => [...row].forEach((pixel, x) => {
            if (pixel === '1') rect(BRAND_RED, 35 + i * 24 + x * 5, 61 + y * 5, 5, 5);
        })));
    });
    texture('bill-projectile', 48, 32, () => {
        box(0xfff4de, 2, 4, 44, 24, 6);
        box(BRAND_RED, 14, 7, 20, 18, 5);
        rect(0xfff4de, 21, 12, 6, 7);
    });
    texture('pop-fx', 64, 64, () => {
        for (const [x, y] of [[32, 12], [15, 28], [49, 33], [28, 49]]) circle(0xffc5a0, x, y, 9);
    });
    cacheSkies(scene);
    texture('clouds', WIDTH, 220, () => {
        for (const [x, y] of [[72, 124], [294, 172], [501, 61]]) {
            graphics.fillStyle(0xffe8dc, 0.26).fillRoundedRect(x - 43, y, 114, 16, 8);
            graphics.fillRoundedRect(x - 19, y - 11, 62, 19, 8);
        }
    });
    texture('hills', WIDTH, 180, () => {
        for (const [x, rise, span] of [[0, 116, 130], [151, 80, 98], [261, 136, 116], [408, 93, 110], [522, 122, 99], [600, 116, 130]]) {
            graphics.fillStyle(0x343950, 0.89).fillTriangle(x - span, 174, x, 170 - rise, x + span, 174);
            graphics.fillStyle(0x646079, 0.7).fillTriangle(x - span * 0.59, 174, x, 170 - rise, x + 21, 174);
        }
        rect(0x33374a, 0, 168, WIDTH, 12);
    });
    texture('tree-line', WIDTH, 85, () => {
        const random = seeded(121);
        for (let x = 15; x < WIDTH - 12; x += 14 + random() * 11) {
            const height = 21 + random() * 42;
            graphics.fillStyle(0x55536b).fillTriangle(x - 11, 79, x, 79 - height, x + 11, 79);
        }
        rect(0x55536b, 0, 77, WIDTH, 8);
    });
    texture('lot', WIDTH, 150, () => {
        rect(0x444550, 0, 0, WIDTH, 150);
        rect(0x66616a, 0, 14, WIDTH, 4);
        rect(0x565460, 0, 65, WIDTH, 2);
        for (let x = 0; x < WIDTH; x += 150) {
            graphics.fillStyle(0xb4a9a5, 0.23).fillTriangle(x + 18, 70, x + 44, 136, x + 49, 136);
            rect(0x393b47, x + 72, 110, 27, 2);
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

const PARALLAX = { clouds: .03, mountains: .10, treeLine: .22, trees: .45, fencing: .75, lot: .36, road: 1, foreground: 1 };
const wrap = (x, period) => ((x % period) + period) % period;
function seeded(seed) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

// Trees and fences share a distant band. RVs sit in a separate foreground band.
const SCENERY = [
    ['prop_tree_pine', 68, 521, 72, 91, 0xb5aaa1, 'trees', 0],
    ['prop_fence_segment', 220, 521, 158, 54, 0xb5aaa1, 'fencing', 0],
    ['prop_tree_pine', 377, 521, 70, 88, 0xb5aaa1, 'trees', 0],
    ['prop_fence_segment', 519, 521, 144, 54, 0xb5aaa1, 'fencing', 0],
    ['lite_tt_v2', 152, 611, 181, 87, 0xd4c8be, 'lot', 1],
    ['generic_bunkhouse_fifth_wheel_teal', 447, 611, 200, 87, 0xd4c8be, 'lot', 1]
];

function makeScenery(scene) {
    return SCENERY.flatMap(([key, x, y, maxWidth, maxHeight, tint, speed, depth]) => {
        if (!scene.textures.exists(key)) return [];
        const frame = scene.textures.getFrame(key);
        const scale = Math.min(maxWidth / frame.width, maxHeight / frame.height);
        return [-1, 0, 1].map((copy) => ({
            image: scene.add.image(x + copy * WIDTH, y, key).setOrigin(0.5, 1).setScale(scale).setTint(tint).setDepth(depth),
            x: x + copy * WIDTH, scale,
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
            for (const art of window.RV_OBSTACLES || []) this.load.image('obstacle-' + art.key, art.data);
            const assets = window.RV_DASH_EMBEDDED || {};
            this.loadFailures = new Set();
            const fail = (key) => {
                this.loadFailures.add(key);
                byId('status').textContent = 'Could not load: ' + [...this.loadFailures].join(', ');
            };
            this.load.on('loaderror', ({ key }) => {
                if (!SPRITES[key]?.[0].startsWith('assets/sprites/')) fail(key);
            });
            for (const [key, [path, width, height]] of Object.entries(SPRITES)) {
                if (!assets[key]) {
                    if (!path.startsWith('assets/sprites/')) fail(key);
                    continue;
                }
                if (width && height) this.load.spritesheet(key, assets[key], { frameWidth: width, frameHeight: height });
                else this.load.image(key, assets[key]);
            }
        }

        create() {
            this.state = STATES.AWAITING_START;
            this.score = 0;
            this.elapsed = 0;
            this.store = null;
            this.flightKeys = new Set();
            this.moveKeys = new Set();
            this.hp = START_HP;
            this.spaceHeld = false;
            this.pointerId = null;
            this.shots = [];
            this.finishedRuns = 0;
            this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
            makeTextures(this);
            if (this.loadFailures.size) return;
            this.sky = this.add.image(0, 0, 'sky-dawn').setOrigin(0).setDepth(-6);
            this.skyOverlay = this.add.image(0, 0, 'sky-dawn').setOrigin(0).setDepth(-5).setAlpha(0);
            this.skyStage = 'dawn';
            this.skyTarget = 'dawn';
            this.skyBlendStart = 0;
            this.clouds = this.add.tileSprite(0, 0, WIDTH, 220, 'clouds').setOrigin(0).setDepth(-4);
            this.hills = this.add.tileSprite(0, 327, WIDTH, 180, 'hills').setOrigin(0).setDepth(-3);
            this.lot = this.add.tileSprite(0, 503, WIDTH, 150, 'lot').setOrigin(0).setDepth(-2);
            this.streaks = this.add.graphics().setDepth(2.5);
            this.trail = this.add.graphics().setDepth(4.5);
            this.trailPoints = [];
            this.nextTrail = 0;
            this.treeLine = this.add.tileSprite(0, 421, WIDTH, 85, 'tree-line').setOrigin(0).setDepth(-2.5);
            this.layerOffsets = {};
            this.layerSpeeds = {};
            this.debugLayers = false;
            this.layerReadout = this.add.text(8, 8, '', { fontFamily: 'monospace', fontSize: '17px',
                backgroundColor: '#14151b', color: '#ffffff', padding: { x: 6, y: 5 } }).setDepth(20).setVisible(false);
            this.scenery = makeScenery(this);
            this.road = this.add.tileSprite(0, GROUND - 24, WIDTH, HEIGHT - GROUND + 24, 'track').setOrigin(0).setDepth(2);
            for (const [key, [, , , count, fps]] of Object.entries(SPRITES)) {
                if (fps && this.textures.get(key).getFrameNames().length >= count && !this.anims.exists(key)) {
                    this.anims.create({
                        key, frames: this.anims.generateFrameNumbers(key, { start: 0, end: count - 1 }),
                        frameRate: fps, repeat: ['pop-fx', 'taggy-hit', 'taggy-shoot'].includes(key) ? 0 : -1
                    });
                }
            }
            this.player = this.add.sprite(START_X, FLOOR_Y, 'taggy-idle-right', 0).setScale(0.5).setDepth(5);
            this.muted = true;
            this.leaderboard = window.RVLeaderboard.attach('rv-dash');
            this.leaderboard.ready();
            this.best = readBest();
            byId('page-best').textContent = this.best.score;
            this.segments = [];
            this.effects = [];
            this.banner = this.add.text(WIDTH / 2, 100, '', {
                fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '35px',
                color: '#ffffff', backgroundColor: '#171922', padding: { x: 24, y: 9 }
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
                const { code } = event;
                if (event.ctrlKey || event.metaKey || event.altKey || this.loadFailures.size) return;
                if (event.target.closest('input, select, textarea, [contenteditable], dialog')) return;
                if (code === 'ArrowDown') {
                    if (this.state !== STATES.PLAYING || this.crashUntil || event.target !== byId('playfield')) return;
                    event.preventDefault();
                    if (!event.repeat) this.downHeld = true;
                    return;
                }
                if (code === 'KeyP' && event.shiftKey) {
                    if (!event.repeat) this.debugLayers = !this.debugLayers;
                    this.layerReadout.setVisible(this.debugLayers);
                    this.drawScenery();
                    return;
                }
                if (code === 'KeyP' || code === 'Escape') {
                    if (!event.repeat && (this.state === STATES.PLAYING || this.state === STATES.PAUSED)) {
                        event.preventDefault();
                        byId('pause').click();
                    }
                    return;
                }
                const fly = code === 'ArrowUp' || code === 'KeyW';
                const move = ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(code);
                if (move && this.state !== STATES.PLAYING) return;
                if ((!fly && !move && code !== 'Space') || event.target.closest('button, a') || this.state === STATES.PAUSED) return;
                event.preventDefault();
                if (event.repeat || this.crashUntil && this.state === STATES.PLAYING) return;
                if (this.state !== STATES.PLAYING) this.start();
                if (move) this.moveKeys.add(code);
                else if (fly) this.flightKeys.add(code);
                else {
                    this.spaceHeld = true;
                    this.fire();
                }
            });
            on(document, 'keyup', (event) => {
                if (event.code === 'ArrowDown') this.downHeld = false;
                this.flightKeys.delete(event.code);
                this.moveKeys.delete(event.code);
                if (event.code === 'Space') this.spaceHeld = false;
            });
            const field = byId('playfield');
            on(field, 'blur', () => { this.downHeld = false; });
            on(field, 'pointerdown', (event) => {
                if (event.button !== 0 || this.crashUntil || this.state === STATES.PAUSED || this.loadFailures.size) return;
                if (this.state === STATES.AWAITING_START) this.start();
                if (this.state !== STATES.PLAYING) return;
                field.focus({ preventScroll: true });
                const rect = field.getBoundingClientRect();
                if (event.pointerType === 'touch' && event.clientX >= rect.left + rect.width / 2) {
                    this.fire();
                } else if (this.pointerId === null) {
                    field.setPointerCapture(event.pointerId);
                    this.pointerId = event.pointerId;
                    if (event.pointerType === 'touch') {
                        this.touchStartX = event.clientX;
                        this.touchPlayerX = this.player.x;
                        this.touchTargetX = this.player.x;
                    }
                }
            });
            on(field, 'pointermove', (event) => {
                if (event.pointerId !== this.pointerId || this.touchTargetX == null) return;
                this.touchTargetX = Phaser.Math.Clamp(this.touchPlayerX + (event.clientX - this.touchStartX)
                    * WIDTH / field.clientWidth, EDGE_MARGIN, WIDTH - EDGE_MARGIN);
            });
            for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
                on(field, event, (pointer) => {
                    if (this.pointerId === pointer.pointerId) {
                        this.pointerId = null;
                        this.touchTargetX = null;
                    }
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
                ['cone', 'Avoid cones'], ['tire', 'Avoid tires'], ['health', '+1 health']
            ]) {
                const item = document.createElement('li');
                const texture = this.textures.get(key);
                const frame = texture.get(this.firstFrame(key));
                const icon = document.createElement('canvas');
                icon.width = frame.cutWidth;
                icon.height = frame.cutHeight;
                const context = icon.getContext('2d');
                context.imageSmoothingEnabled = false;
                context.drawImage(texture.getSourceImage(), frame.cutX, frame.cutY,
                    frame.cutWidth, frame.cutHeight, 0, 0, icon.width, icon.height);
                const image = document.createElement('img');
                image.src = icon.toDataURL();
                image.alt = '';
                item.append(image, label);
                byId('legend').append(item);
            }
        }

        clearInput() {
            this.downHeld = false;
            this.flightKeys.clear();
            this.moveKeys.clear();
            this.touchTargetX = null;
            this.spaceHeld = false;
            const field = byId('playfield');
            if (this.pointerId !== null && field.hasPointerCapture(this.pointerId)) field.releasePointerCapture(this.pointerId);
            this.pointerId = null;
        }

        start() {
            if (this.state !== STATES.AWAITING_START && this.state !== STATES.GAME_OVER) return;
            this.leaderboard.start();
            for (const segment of this.segments) {
                segment.view.destroy();
                for (const drop of segment.drops) drop.destroy();
            }
            for (const effect of this.effects) effect.object.destroy();
            this.segments = [];
            this.effects = [];
            for (const shot of this.shots) shot.destroy();
            this.shots = [];
            this.healthPickup?.destroy();
            this.healthPickup = null;
            this.nextHealth = HEALTH_MS;
            this.hp = START_HP;
            this.immuneUntil = 0;
            this.hitPoseUntil = 0;
            this.horizontalSpeed = 0;
            this.nextShot = 0;
            this.shotPoseUntil = 0;
            this.bossQueued = false;
            this.enemyIndex = 0;
            this.hazardIndex = 0;
            this.acceleration = GRAVITY;
            this.landedAt = -1000;
            this.score = 0;
            this.level = 1;
            this.bonus = 0;
            this.coinStreak = 0;
            this.newBest = false;
            this.elapsed = 0;
            this.scroll = 0;
            this.layerOffsets = {};
            this.layerLevel = 0;
            this.nextPattern = 385;
            this.patternIndex = 0;
            this.coffeeUntil = 0;
            this.crashUntil = 0;
            this.flashUntil = 0;
            this.bannerUntil = 0;
            this.verticalSpeed = 0;
            this.nextExhaust = 0;
            this.idleLine = 0;
            this.player.anims.stop();
            this.player.clearTint().setAlpha(1).setScale(0.5).setAngle(0).setPosition(START_X, FLOOR_Y);
            this.drawTaggy(false);
            this.banner.setVisible(false);
            this.resetSky();
            this.trailPoints.length = 0;
            this.nextTrail = 0;
            this.drawScenery();
            this.drawSpeedFX();
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
            const sprites = [this.player, ...this.shots,
                ...this.segments.flatMap(({ hazard, coins }) => [hazard, ...coins]),
                ...this.effects.map(({ object }) => object)];
            for (const sprite of sprites) {
                if (state === STATES.PLAYING) sprite.anims?.resume();
                else sprite.anims?.pause();
            }
            this.renderState();
        }

        renderState() {
            const { AWAITING_START, PLAYING, PAUSED, GAME_OVER } = STATES;
            const intro = this.state === AWAITING_START;
            byId('start').disabled = false;
            byId('start').hidden = !intro;
            byId('intro').hidden = !intro;
            byId('shot-status').hidden = intro || this.state === GAME_OVER;
            byId('pause').hidden = this.state !== PLAYING && this.state !== PAUSED;
            byId('pause').textContent = this.state === PAUSED ? 'Resume' : 'Pause';
            document.body.classList.toggle('in-flight', this.state === PLAYING);
            document.body.classList.toggle('is-paused', this.state === PAUSED);
            byId('status').textContent = this.state === PAUSED ? 'Run paused. Select Resume to continue.' : '';
            byId('result').hidden = this.state !== GAME_OVER;
            byId('game-area').hidden = this.state === GAME_OVER;
        }

        updateStats() {
            const score = byId('score');
            const level = byId('level');
            const health = byId('health');
            const label = 'Health ' + this.hp + ' of ' + MAX_HP;
            if (health.getAttribute('aria-label') !== label) {
                health.setAttribute('aria-label', label);
                health.textContent = '♥'.repeat(this.hp) + '♡'.repeat(MAX_HP - this.hp);
            }
            if (score.textContent !== String(this.score)) score.textContent = this.score;
            if (level.textContent !== String(this.level)) level.textContent = this.level;
            byId('shot-meter').value = Math.max(0, 1 - (this.nextShot - this.elapsed) / SHOT_MS);
            const remaining = Math.max(0, Math.ceil((this.coffeeUntil - this.elapsed) / 1000));
            const coffee = remaining ? 'Coffee ' + remaining + 's x2' : '';
            const protectedMotion = this.reducedMotion.matches && this.hp > 0 && this.elapsed < this.immuneUntil;
            const effects = [coffee, protectedMotion ? 'Protected' : ''].filter(Boolean).join(' · ');
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
            this.drawSpeedFX();
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
            this.moveHorizontally(dt);
            this.fly(dt);
            const distance = scrollSpeed(this.scroll) * dt;
            this.scroll += distance;
            this.advanceScenery(distance, dt);
            this.score = Math.floor(this.scroll / 20) + this.bonus;
            const level = 1 + Math.floor(this.scroll / LEVEL_DISTANCE);
            if (level > this.level) {
                this.level = level;
                if (level % 5 === 0) this.bossQueued = true;
                this.banner.setText('LEVEL ' + level).setAlpha(1).setVisible(true);
                this.bannerUntil = this.elapsed + 1100;
                this.speak('Level ' + level + '. Faster now.');
            }
            if (!this.newBest && this.best.score > 0 && this.score > this.best.score) {
                this.newBest = true;
                this.speak('New best. Nice flying.');
            }
            if (this.scroll >= this.nextPattern) {
                const index = this.patternIndex++;
                let pattern;
                if (this.bossQueued) {
                    pattern = BOSS;
                    this.bossQueued = false;
                } else if (this.level > 1 && this.elapsed >= 20000 && index % 2 === 1) {
                    pattern = ENEMIES[this.enemyIndex++ % ENEMIES.length];
                } else {
                    pattern = PATTERNS[this.hazardIndex++ % PATTERNS.length];
                }
                this.spawnPattern(pattern, index);
                this.nextPattern += pattern === BOSS ? 750 : 590;
            }
            this.updateHealthPickup(distance);
            if (this.spaceHeld) this.fire();
            for (const segment of this.segments) {
                segment.age += step;
                segment.view.x -= distance * (segment.pattern === BOSS ? 0.78 : 1);
                const key = segment.pattern.key;
                const wave = key === 'bird' ? Math.sin(segment.age / 530) * 52
                    : key === 'boss-sold' ? Math.sin(segment.age / 1100) * 86 : 0;
                segment.hazard.y = segment.hanging ? 0 : segment.pattern.y + wave;
                if (segment.hanging && !this.reducedMotion.matches) {
                    segment.hazard.rotation = Math.sin(segment.age / 570) * .055;
                }
                if (segment.hp > 0 && segment.pattern === BOSS && segment.age >= segment.nextDrop
                    && segment.view.x > START_X + 115) {
                    segment.nextDrop += 1550;
                    const drop = this.add.image(segment.view.x, 592, 'tire').setDisplaySize(58, 58).setDepth(3);
                    segment.drops.push(drop);
                }
                for (const drop of segment.drops) drop.x -= distance * 0.64;
            }
            this.updateShots(dt);
            for (const segment of this.segments) {
                this.checkPattern(segment);
                if (this.crashUntil) break;
            }
            this.segments = this.segments.filter(({ view, drops }) => {
                if (view.x >= -200 || drops.some((drop) => drop.x > -40)) return true;
                view.destroy();
                for (const drop of drops) drop.destroy();
                return false;
            });
        }

        fly(dt) {
            const thrusting = this.flightKeys.size > 0 || this.pointerId !== null;
            const assist = this.downHeld && !thrusting;
            const target = GRAVITY - (thrusting ? THRUST : 0) + (assist ? DESCENT_BONUS : 0);
            if (!assist) this.acceleration = Math.min(this.acceleration, GRAVITY);
            this.acceleration += (target - this.acceleration) * (1 - Math.exp(-22 * dt));
            this.verticalSpeed = Phaser.Math.Clamp((this.verticalSpeed + this.acceleration * dt) * Math.exp(-0.65 * dt),
                -RISE_CAP, assist ? ASSISTED_FALL_CAP : FALL_CAP);
            const previousY = this.player.y;
            const y = previousY + this.verticalSpeed * dt;
            this.player.y = Phaser.Math.Clamp(y, CEILING_Y, FLOOR_Y);
            if (y !== this.player.y) {
                if (y > FLOOR_Y && previousY < FLOOR_Y) this.landedAt = this.elapsed;
                this.verticalSpeed = 0;
            }
            const reduced = this.reducedMotion.matches;
            if (thrusting && !reduced && this.elapsed >= this.nextExhaust) {
                this.addEffect(this.add.circle(this.player.x - 22, this.player.y + 32, 7, BRAND_RED), 180, -19);
                this.nextExhaust = this.elapsed + 65;
            }
            const tilt = this.verticalSpeed / RISE_CAP * 9;
            this.player.setAngle(reduced ? 0 : this.player.angle + (tilt - this.player.angle) * (1 - Math.exp(-13 * dt)));
            const squash = reduced || this.player.y < FLOOR_Y ? 0 : Math.max(0, 1 - (this.elapsed - this.landedAt) / 145) * 0.13;
            this.drawTaggy(thrusting);
            const scale = ['taggy-fly', 'taggy-shoot', 'taggy-hit'].includes(this.player.texture.key) ? 1 : 0.5;
            const landing = scale === 1 ? 0 : squash;
            this.player.setScale(scale * (1 + landing), scale * (1 - landing));
        }

        resetSky() {
            this.skyStage = 'dawn';
            this.skyTarget = 'dawn';
            this.sky.setTexture('sky-dawn');
            this.skyOverlay.setAlpha(0);
        }

        drawScenery() {
            const reduced = this.reducedMotion.matches;
            const stage = SKY_PALETTES[Math.min(4, Math.floor((this.level - 1) / 2))][0];
            if (stage !== this.skyTarget) {
                this.skyTarget = stage;
                this.skyBlendStart = this.elapsed;
                this.skyOverlay.setTexture('sky-' + stage);
            }
            if (this.skyStage !== this.skyTarget) {
                const blend = reduced ? 1 : Math.min(1, (this.elapsed - this.skyBlendStart) / 2000);
                if (blend >= 1) {
                    this.skyStage = this.skyTarget;
                    this.sky.setTexture('sky-' + this.skyStage);
                    this.skyOverlay.setAlpha(0);
                } else {
                    this.skyOverlay.setAlpha(blend * blend * (3 - 2 * blend));
                }
            }
            this.clouds.setAlpha(stage === 'night' ? 0.38 : 0.85);
            const offset = (name) => this.layerOffsets[name] || 0;
            this.clouds.tilePositionX = offset('clouds');
            this.hills.tilePositionX = offset('mountains');
            this.treeLine.tilePositionX = offset('treeLine');
            this.lot.tilePositionX = offset('lot');
            this.road.tilePositionX = offset('road');
            if (this.layerLevel !== this.level) {
                this.layerLevel = this.level;
                for (const layer of ['trees', 'fencing']) {
                    const random = seeded(this.level * 17 + (layer === 'trees' ? 1 : 2));
                    const variants = Array.from({ length: 2 }, () => [random() * 62 - 31, .86 + random() * .23]);
                    let index = 0;
                    for (const item of this.scenery.filter(({ speed }) => speed === layer)) {
                        [item.shift, item.factor] = variants[Math.floor(index++ / 3)];
                        item.image.setScale(item.scale * item.factor);
                    }
                }
            }
            for (const { image, x, speed, shift = 0 } of this.scenery) {
                image.x = wrap(x + shift - offset(speed), WIDTH) + Math.floor(x / WIDTH) * WIDTH;
            }
            if (this.debugLayers) this.layerReadout.setText(Object.keys(PARALLAX).map(name =>
                name + ' ' + (reduced ? 0 : this.layerSpeeds[name] || 0).toFixed(1) + ' px/s'));
        }

        advanceScenery(distance, dt) {
            if (this.reducedMotion.matches) return;
            for (const [name, factor] of Object.entries(PARALLAX)) {
                const motion = name === 'lot' ? 0 : this.horizontalSpeed * factor * factor * .46;
                const speed = Math.max(2, distance / dt * factor + motion + (name === 'clouds' ? 4 : 0));
                this.layerSpeeds[name] = speed;
                this.layerOffsets[name] = (this.layerOffsets[name] || 0) + speed * dt;
            }
        }

        drawSpeedFX() {
            this.streaks.clear();
            this.trail.clear();
            if (this.reducedMotion.matches || this.crashUntil) {
                this.trailPoints.length = 0;
                return;
            }
            const strength = Math.min(1, (scrollSpeed(this.scroll) - MIN_SPEED) / (MAX_SPEED - MIN_SPEED));
            if (strength <= 0) return;
            for (let i = 0; i < 8; i++) {
                const x = ((i * 83 - this.scroll * 1.27) % WIDTH + WIDTH) % WIDTH;
                const y = i < 4 ? 41 + i * 19 : GROUND + 45 + (i - 4) * 24;
                this.streaks.fillStyle(0xe7edff, strength * (0.10 + i % 3 * 0.025))
                    .fillRect(x, y, 22 + strength * (18 + i * 4), 2);
            }
            if (this.elapsed >= this.nextTrail) {
                if (this.trailPoints.length === 6) this.trailPoints.shift();
                this.trailPoints.push({ x: this.player.x, y: this.player.y, at: this.elapsed });
                this.nextTrail = this.elapsed + 22;
            }
            for (const point of this.trailPoints) {
                const age = this.elapsed - point.at;
                if (age >= 132) continue;
                this.trail.fillStyle(0xff8b72, strength * 0.23 * (1 - age / 132))
                    .fillRoundedRect(point.x - 48 - age * 0.44, point.y - 3, 25, 6, 3);
            }
        }

        drawTaggy(thrusting) {
            if (this.elapsed < this.hitPoseUntil) return;
            const airborne = this.player.y < FLOOR_Y;
            let key = airborne ? 'taggy-fly' : 'taggy-walk-right';
            if (this.elapsed < this.shotPoseUntil) key = 'taggy-shoot';
            if ((thrusting || airborne || key === 'taggy-shoot' || this.state === STATES.PLAYING)
                && !this.reducedMotion.matches && this.anims.exists(key)) {
                if (key !== 'taggy-shoot') this.player.play(key, true);
            } else {
                const pose = this.reducedMotion.matches && this.anims.exists(key) && key !== 'taggy-walk-right'
                    ? key : 'taggy-idle-right';
                if (this.player.texture.key !== pose) {
                    this.player.anims.stop();
                    this.player.setTexture(pose, 0);
                }
            }
        }

        fire() {
            if (this.elapsed < this.nextShot || this.crashUntil) return;
            this.nextShot = this.elapsed + SHOT_MS;
            this.shotPoseUntil = this.elapsed + 3 * 1000 / 14;
            if (this.elapsed >= this.hitPoseUntil && this.anims.exists('taggy-shoot') && !this.reducedMotion.matches) {
                this.player.play('taggy-shoot').setScale(1);
            }
            const shot = this.add.sprite(this.player.x + 29, this.player.y, 'bill-projectile', this.firstFrame('bill-projectile')).setDepth(4);
            if (!this.anims.exists('bill-projectile')) shot.setDisplaySize(40, 27);
            if (this.anims.exists('bill-projectile') && !this.reducedMotion.matches) shot.play('bill-projectile');
            this.shots.push(shot);
            this.playPickupSound('shot');
        }

        updateShots(dt) {
            this.shots = this.shots.filter((shot) => {
                shot.x += SHOT_SPEED * dt;
                if (!this.reducedMotion.matches) shot.rotation += 6 * dt;
                const enemy = this.segments.find(({ view, hazard, pattern, hp }) => hp > 0
                    && Math.abs(shot.x - view.x) < pattern.width * 0.42 + 9
                    && Math.abs(shot.y - hazard.y) < pattern.height * 0.42 + 6);
                if (!enemy && shot.x < WIDTH + 35) return true;
                shot.destroy();
                if (!enemy) return false;
                enemy.hp -= 1;
                if (enemy.hp > 0) {
                    enemy.hazard.setAlpha(0.78);
                    if (!this.reducedMotion.matches) {
                        enemy.hazard.setTintFill(0xffffff);
                        enemy.flashUntil = this.elapsed + 80;
                    }
                    return false;
                }
                enemy.hazard.setVisible(false);
                if (!this.reducedMotion.matches) {
                    const sprite = enemy.hazard;
                    const flash = this.add.image(enemy.view.x, sprite.y, sprite.texture.key, sprite.frame.name)
                        .setDisplaySize(sprite.displayWidth, sprite.displayHeight).setTintFill(0xffffff);
                    this.addEffect(flash, 55, 0);
                }
                const boss = enemy.pattern === BOSS;
                if (boss && !this.reducedMotion.matches) this.cameras.main.shake(180, 0.0028);
                const points = boss ? 250 : 25;
                this.addBonus(points);
                const pop = this.add.sprite(enemy.view.x, enemy.hazard.y, 'pop-fx', this.firstFrame('pop-fx'));
                if (this.anims.exists('pop-fx') && !this.reducedMotion.matches) pop.play('pop-fx');
                this.addEffect(pop, 5 * 1000 / 18, 0);
                this.showFeedback('+' + points, enemy.view.x, enemy.hazard.y);
                this.speak(boss ? 'Stamp returned to sender.' : 'That clears the lane.');
                this.playPickupSound('score');
                return false;
            });
        }

        firstFrame(key) {
            return this.textures.get(key).has(0) ? 0 : undefined;
        }

        spawnPattern(pattern, index) {
            const view = this.add.container(WIDTH + 80, 0).setDepth(3);
            const family = { cone: 'cone', fence: 'barrier', stump: 'pile', tire: 'tires' }[pattern.key];
            const choices = (window.RV_OBSTACLES || []).filter((entry) => pattern.lane === 'high'
                && !pattern.hp ? entry.type === 'overhead' : entry.family === family);
            const art = choices.length ? choices[index % choices.length] : null;
            const texture = art && this.textures.exists('obstacle-' + art.key) ? 'obstacle-' + art.key : pattern.key;
            const hazard = this.add.sprite(0, pattern.y, texture, this.firstFrame(texture));
            if (!this.anims.exists(pattern.key)) hazard.setDisplaySize(pattern.width, pattern.height);
            if (this.anims.exists(pattern.key) && !this.reducedMotion.matches) hazard.play(pattern.key);
            const hanging = art?.type === 'overhead';
            if (hanging) hazard.setOrigin(.5, 0).setDisplaySize(pattern.width * 1.45, pattern.y + pattern.height / 2);
            view.add(hazard);
            const routeY = pattern.lane === 'high' ? 530 : 455;
            const coins = Array.from({ length: 5 }, (_, i) => {
                const y = routeY - (pattern.coins === 'arc' ? Math.sin(i / 4 * Math.PI) * 65 : 0);
                return this.add.sprite((i - 2) * 46, y, 'coin', this.firstFrame('coin')).setScale(this.anims.exists('coin') ? 1 : 0.55);
            });
            if (index % 5 === 3) coins[2].setTexture('coffee').setDisplaySize(35, 35);
            if (this.anims.exists('coin') && !this.reducedMotion.matches) {
                for (const coin of coins) if (coin.texture.key === 'coin') coin.play('coin');
            }
            view.add(coins);
            this.segments.push({ view, hazard, coins, pattern, hanging: hanging ? art : null, hp: pattern.hp, age: 0, drops: [], nextDrop: 900, near: false, passed: false });
        }

        checkPattern(segment) {
            const { view, hazard, pattern, coins } = segment;
            const y = this.player.y;
            const playerX = this.player.x;
            const hanging = segment.hanging;
            const tip = hanging ? hazard.displayHeight * (hanging.hit[1] + hanging.hit[3] / 2) : 0;
            const dx = Math.abs(view.x - Math.sin(hazard.rotation) * tip - playerX);
            const dy = Math.abs((hanging ? Math.cos(hazard.rotation) * tip : hazard.y) - y);
            // Use the opaque cap or base, with a small forgiving inset on each side.
            const halfWidth = hanging ? hazard.displayWidth * hanging.hit[2] / 2 : pattern.width * (pattern.key === 'tire' ? 0.36 : 0.42);
            const halfHeight = hanging ? hazard.displayHeight * hanging.hit[3] / 2 : pattern.height * (pattern.key === 'tire' ? 0.36 : 0.44);
            if (pattern.key === 'tire' && !this.reducedMotion.matches) hazard.rotation = this.scroll / 48;
            const alive = segment.hp !== 0;
            if (this.elapsed >= this.immuneUntil && (segment.drops.some((drop) => Math.abs(drop.x - playerX) < PLAYER_HALF_WIDTH + 22
                && Math.abs(drop.y - y) < PLAYER_HALF_HEIGHT + 22)
                || alive && dx < halfWidth + PLAYER_HALF_WIDTH && dy < halfHeight + PLAYER_HALF_HEIGHT)) {
                this.hitObstacle();
                return;
            }
            if (alive && dx < halfWidth && dy < halfHeight + PLAYER_HALF_HEIGHT + 20) segment.near = true;
            if (!segment.passed && view.x + halfWidth + PLAYER_HALF_WIDTH < playerX) {
                segment.passed = true;
                if (alive && segment.near) {
                    this.addBonus(5);
                    this.showFeedback('CLOSE! +5', playerX, y);
                    this.speak('Whoa, tight one!');
                }
            }
            for (const coin of coins) {
                if (!coin.visible) continue;
                const x = view.x + coin.x;
                if (Math.abs(x - playerX) < PLAYER_HALF_WIDTH + 15 && Math.abs(coin.y - y) < PLAYER_HALF_HEIGHT + 15) {
                    this.collectCoin(coin, x);
                } else if (x < EDGE_MARGIN - PLAYER_HALF_WIDTH - 15) {
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
                if (!this.reducedMotion.matches) {
                    for (const [dx, dy] of [[-14, -8], [10, -14], [16, 8]]) {
                        this.addEffect(this.add.star(x + dx, coin.y + dy, 4, 2, 6, 0xffe39d), 260, 14);
                    }
                }
                this.coinStreak += 1;
                if (this.coinStreak % 5 === 0) this.speak(this.coinStreak + ' tags in a row.');
                else if (this.coinStreak === 1) this.speak('One for the road.');
            }
            this.playPickupSound(coffee ? 'coffee' : 'score');
            track('pickup_collect', { type: coffee ? 'coffee' : 'score' });
        }

        moveHorizontally(dt) {
            const left = this.moveKeys.has('ArrowLeft') || this.moveKeys.has('KeyA');
            const right = this.moveKeys.has('ArrowRight') || this.moveKeys.has('KeyD');
            const touchError = this.touchTargetX == null ? null : this.touchTargetX - this.player.x;
            const target = touchError == null ? (Number(right) - Number(left)) * MOVE_SPEED
                : Phaser.Math.Clamp(touchError * TOUCH_STEER_GAIN, -MOVE_SPEED, MOVE_SPEED);
            const response = target === 0 ? STEER_BRAKE : STEER_RESPONSE;
            this.horizontalSpeed += (target - this.horizontalSpeed) * (1 - Math.exp(-response * dt));
            if (target === 0 && Math.abs(this.horizontalSpeed) < STOP_SPEED) this.horizontalSpeed = 0;
            let travel = this.horizontalSpeed * dt;
            if (touchError != null && (touchError === 0 || travel / touchError >= 1)) {
                travel = touchError;
                this.horizontalSpeed = 0;
            }
            const x = this.player.x + travel;
            this.player.x = Phaser.Math.Clamp(x, EDGE_MARGIN, WIDTH - EDGE_MARGIN);
            if (x !== this.player.x) this.horizontalSpeed = 0;
        }

        updateHealthPickup(distance) {
            const bossPresent = this.bossQueued
                || this.segments.some(({ pattern, hp, view }) => pattern === BOSS && hp > 0
                    && view.x + pattern.width / 2 > EDGE_MARGIN);
            if (bossPresent && this.healthPickup) {
                this.healthPickup.destroy();
                this.healthPickup = null;
                this.nextHealth = this.elapsed;
            }
            if (!bossPresent && !this.healthPickup && this.elapsed >= this.nextHealth) {
                this.healthPickup = this.add.image(WIDTH + 25, 445, 'health').setDepth(4);
                this.nextHealth = this.elapsed + HEALTH_MS;
            }
            const pickup = this.healthPickup;
            if (!pickup) return;
            pickup.x -= distance;
            const collected = Math.abs(pickup.x - this.player.x) < PLAYER_HALF_WIDTH + 17
                && Math.abs(pickup.y - this.player.y) < PLAYER_HALF_HEIGHT + 17;
            if (collected) {
                const healed = this.hp < MAX_HP;
                this.hp = Math.min(MAX_HP, this.hp + 1);
                this.showFeedback(healed ? '+1 HP' : 'FULL HP', pickup.x, pickup.y);
                this.playPickupSound('score');
            }
            if (collected || pickup.x < -30) {
                pickup.destroy();
                this.healthPickup = null;
            }
        }

        hitObstacle() {
            if (this.crashUntil || this.elapsed < this.immuneUntil) return;
            this.hp -= 1;
            this.updateStats();
            this.playPickupSound('crash');
            this.hitPoseUntil = this.elapsed + 250;
            this.flashUntil = this.elapsed + 180;
            this.immuneUntil = this.elapsed + IMMUNITY_MS;
            this.shotPoseUntil = 0;
            if (this.anims.exists('taggy-hit')) {
                this.player.anims.stop();
                this.player.setScale(1);
                if (this.reducedMotion.matches) this.player.setTexture('taggy-hit', 0);
                else this.player.play('taggy-hit');
            }
            if (!this.reducedMotion.matches) this.player.setTint(0xff8267);
            if (this.hp > 0) {
                this.speak('Still rolling.');
                return;
            }
            this.crashAt = this.elapsed;
            this.crashUntil = this.elapsed + CRASH_MS;
            this.clearInput();
            if (!this.reducedMotion.matches) this.cameras.main.shake(145, 0.003);
            this.speak("Ouch... that's a tag!");
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
            if (this.effects.length >= 28) this.effects.shift().object.destroy();
            this.effects.push({ object, start: this.elapsed, duration, rise, y: object.y });
        }

        updateEffects() {
            if (this.elapsed >= this.bannerUntil) this.banner.setVisible(false);
            else if (!this.reducedMotion.matches) this.banner.setAlpha(Math.min(1, (this.bannerUntil - this.elapsed) / 230));
            for (const segment of this.segments) {
                if (segment.flashUntil && (this.elapsed >= segment.flashUntil || this.reducedMotion.matches)) {
                    segment.hazard.clearTint();
                    segment.flashUntil = 0;
                }
            }
            if (this.elapsed >= this.flashUntil) this.player.clearTint();
            const blinking = !this.crashUntil && this.elapsed < this.immuneUntil && !this.reducedMotion.matches;
            this.player.setAlpha(blinking && Math.floor((this.elapsed - (this.immuneUntil - IMMUNITY_MS)) / 170) % 2 === 0 ? 0.4 : 1);
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
            const notes = { score: [620, 830], coffee: [420, 630, 940], crash: [145, 80], shot: [285] };
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
            this.finishedRuns += 1;
            const record = this.score > this.best.score;
            this.best = { score: Math.max(this.best.score, this.score), level: Math.max(this.best.level, this.level) };
            try {
                localStorage.setItem(BEST_KEY, JSON.stringify(this.best));
            } catch {
                // Keep the session best even when storage is blocked.
            }
            byId('final-score').textContent = 'Score ' + this.score + ' · Level ' + this.level;
            byId('page-best').textContent = this.best.score;
            byId('new-best').hidden = !record;
            byId('outcome').textContent = 'Best score ' + this.best.score + ' · Best level ' + this.best.level;
            this.setRoundState(STATES.GAME_OVER);
            byId('effects').hidden = true;
            byId('speech').hidden = true;
            byId('result-title').focus();
            this.leaderboard.finish(this.score);
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
