import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../boss-arena.js', import.meta.url), 'utf8');
const { BossArena, bossStats, bossDebugLevel, BOSS_TUNING, ARENA_ATTACKS, bossPropScale } = vm.runInNewContext(
    source + '\n({ BossArena, bossStats, bossDebugLevel, BOSS_TUNING, ARENA_ATTACKS, bossPropScale })',
    { URLSearchParams, ROAD_LANES: [633, 688, 743], PLAYER_HALF_WIDTH: 21 }
);

const arenaAt = (level) => {
    const stats = bossStats(level);
    const arena = Object.create(BossArena.prototype);
    return Object.assign(arena, {
        spec: stats.definition, stats, hp: stats.hp, scene: { roadLane: 1 },
        mode: 'fight', age: 1850, phase: 0, phaseTurn: 0, hits: 0, turn: 0,
        intermissionUntil: 0, threats: [], plan: null, followUp: null, x: BOSS_TUNING.x, feet: BOSS_TUNING.y, staggerUntil: 0, poseUntil: 0, launchUntil: 0
    });
};

test('six boss identities cycle and valid debug levels match their roster slot', () => {
    const ids = ['lowballer', 'tirekicker', 'greeter', 'warranty', 'invoice', 'merger'];
    for (const [index, id] of ids.entries()) {
        assert.equal(bossStats(index + 1).definition.id, id);
        assert.equal(bossStats(index + 7).definition.id, id);
        assert.ok(bossStats(index + 7).hp > bossStats(index + 1).hp);
    }
    assert.equal(bossDebugLevel('?boss=1&level=7'), 7);
    assert.equal(bossDebugLevel('?boss=2&level=7'), 0);
    assert.equal(bossDebugLevel('?boss=0'), 0);
});

test('taunts require health loss from the current arena and use an instance cooldown', () => {
    const first = arenaAt(1);
    const second = arenaAt(1);
    const clock = { matches: false };
    const scene = {
        arena: first, hp: 3, roadDepth: 688, player: { x: 180, y: 688 }, reducedMotion: clock,
        hitObstacle() {}
    };
    first.scene = second.scene = scene;
    first.threats.push({ kind: 'coin', lane: 1, released: true, x: 180, speed: 155, at: 0, end: 9999 });
    first.moveThreats(0);
    assert.equal(first.tauntStartedAt, undefined);
    scene.hitObstacle = () => { scene.hp--; };
    first.moveThreats(0);
    assert.equal(first.tauntStartedAt, 1850);
    assert.equal(first.tauntSheet, null);
    first.age += 500;
    first.moveThreats(0);
    assert.equal(first.tauntStartedAt, 1850);
    second.beginTaunt();
    assert.equal(second.tauntStartedAt, 1850);
    first.age += 2000;
    scene.hitObstacle = () => { scene.hp--; scene.arena = null; };
    first.moveThreats(0);
    assert.equal(first.tauntStartedAt, 1850);
    clock.matches = true;
    second.age += 2000;
    second.beginTaunt();
    assert.equal(second.tauntStartedAt, 1850);
});

test('late sheet availability affects the next taunt and never replaces an active fallback', () => {
    const arena = arenaAt(1);
    arena.sprite = {};
    arena.tauntKey = 'boss-lowballer-taunt';
    arena.scene.reducedMotion = { matches: false };
    arena.scene.bossTauntLoads = new Map();
    arena.beginTaunt();
    arena.scene.bossTauntLoads.set(arena.tauntKey, true);
    assert.equal(arena.tauntSheet, null);
    arena.age += 2000;
    arena.beginTaunt();
    assert.equal(arena.tauntSheet, 'boss-lowballer-taunt');
});

test('sheet frames use the arena clock and restore the normal texture on interruption', () => {
    const arena = arenaAt(1);
    arena.normalSpriteKey = 'boss-lowballer';
    arena.tauntKey = 'boss-lowballer-taunt';
    arena.scene.reducedMotion = { matches: false };
    arena.scene.bossTauntLoads = new Map([[arena.tauntKey, true]]);
    arena.updateHud = () => {};
    arena.view = { clear() { return this; } };
    arena.sprite = {
        texture: { key: arena.normalSpriteKey },
        setTexture(key) { this.texture.key = key; return this; },
        setFrame(frame) { this.frame = frame; return this; },
        setPosition() { return this; },
        setAngle() { return this; }
    };
    arena.beginTaunt();
    arena.age += 500;
    arena.paint();
    assert.equal(arena.sprite.texture.key, arena.tauntKey);
    assert.equal(arena.sprite.frame, 4);
    arena.paint();
    assert.equal(arena.sprite.frame, 4);
    arena.mode = 'defeat';
    arena.paint();
    assert.equal(arena.sprite.texture.key, arena.normalSpriteKey);
    assert.equal(arena.sprite.frame, 3);
    assert.equal(arena.tauntStartedAt, undefined);
});

test('optional taunt sheets are requested once and validated before becoming available', () => {
    const images = [];
    const textures = new Map();
    const pixels = new Uint8ClampedArray(1536 * 256 * 4);
    for (let x = 0; x < 1536; x++) pixels[(1536 * 180 + x) * 4 + 3] = 255;
    const frames = [];
    const { loadBossTaunt } = vm.runInNewContext(source + '\n({ loadBossTaunt })', {
        Image: class { constructor() { images.push(this); } },
        document: { createElement: () => ({
            getContext: () => ({ drawImage() {}, getImageData: () => ({ data: pixels }) })
        }) }
    });
    const scene = {
        events: { once() {}, off() {} },
        textures: {
            exists: key => textures.has(key),
            get: key => textures.get(key),
            addImage: (key, image) => textures.set(key, {
                getSourceImage: () => image, add: frame => frames.push(frame)
            }),
            remove: key => textures.delete(key)
        }
    };
    const missing = loadBossTaunt(scene, 'lowballer');
    images[0].onerror();
    loadBossTaunt(scene, 'lowballer');
    assert.equal(images.length, 1);
    assert.equal(scene.bossTauntLoads.get(missing), false);

    const invalid = loadBossTaunt(scene, 'tirekicker');
    Object.assign(images[1], { naturalWidth: 512, naturalHeight: 256 });
    images[1].onload();
    assert.equal(scene.bossTauntLoads.get(invalid), false);

    const valid = loadBossTaunt(scene, 'greeter');
    const size = { naturalWidth: 1536, naturalHeight: 256, width: 1536, height: 256 };
    Object.assign(images[2], size);
    images[2].onload();
    assert.equal(scene.bossTauntLoads.get(valid), true);
    assert.deepEqual(frames, [0, 1, 2, 3, 4, 5]);

    const malformed = loadBossTaunt(scene, 'warranty');
    pixels.fill(255);
    Object.assign(images[3], size);
    images[3].onload();
    assert.equal(scene.bossTauntLoads.get(malformed), false);
    assert.equal(textures.has(malformed), false);
});

test('Tire Kicker caps escalation and staggers a double within one warned lane', () => {
    const arena = arenaAt(2);
    arena.hits = 90;
    arena.turn = 4;
    arena.warn();
    const plan = arena.plan;
    assert.equal(plan.at - arena.age, 1500);
    assert.equal(plan.repeats, 2);
    arena.age = plan.at;
    arena.launch(plan);
    assert.equal(arena.threats.length, 2);
    assert.ok(arena.threats.every(threat => threat.lane === plan.lane));
    assert.equal(arena.threats[1].at - arena.threats[0].at, 500);
    assert.equal(arena.threats[0].speed, 260 * arena.stats.speed * 1.6);
    assert.equal(arena.attackAt - arena.age, 2000 * arena.stats.pace * .7);
});

test('wind-up retains the boss pose and launches the attack without painting a lane guide', () => {
    const arena = arenaAt(2);
    const shapes = [];
    const art = {
        clear() { return this; },
        lineStyle() { return this; },
        strokeRoundedRect() { shapes.push('lane'); return this; },
        strokeTriangle() { shapes.push('arrow'); return this; },
        strokeEllipse() { shapes.push('coin marker'); return this; }
    };
    let angle;
    const sprite = {
        setFrame() { return this; },
        setPosition() { return this; },
        setAngle(value) { angle = value; return this; }
    };
    Object.assign(arena, { view: art, sprite, updateHud() {} });
    arena.scene.reducedMotion = { matches: false };
    arena.warn();
    const plan = arena.plan;
    arena.paint();
    assert.equal(angle, -4);
    assert.deepEqual(shapes, []);
    assert.equal(arena.plan, plan);
    arena.age = plan.at;
    arena.launch(plan);
    assert.ok(arena.threats.every(threat => threat.kind === plan.kind && threat.lane === plan.lane));
    assert.ok(arena.threats.length > 0);
});

test('Merger intermission clears obsolete attacks and the new pair shares its warning band', () => {
    const arena = arenaAt(6);
    arena.hp = 39;
    arena.warn();
    const { x } = BOSS_TUNING;
    const y = 670;
    assert.ok(arena.hit({ x, y }));
    assert.equal(arena.phase, 1);
    assert.equal(arena.plan, null);
    assert.equal(arena.threats.length, 0);
    assert.equal(arena.active, false);
    arena.hit({ x, y });
    assert.equal(arena.hp, 37);
    arena.age = arena.intermissionUntil;
    arena.warn();
    assert.equal(arena.plan.kind, 'minions');
    assert.equal(arena.followUp.kind, 'paper');
    assert.equal(arena.followUp.lane, arena.plan.lane);
    assert.equal(arena.followUp.at - arena.plan.at, 1200);
});


test('Lowballer takes valid shots, blocks visibly, and rewards a clean dodge', () => {
    const arena = arenaAt(1);
    const shot = { x: arena.x, y: 670 };
    assert.equal(arena.hit({ ...shot, y: 400 }), false);
    assert.equal(arena.hit(shot), true);
    assert.equal(arena.hp, 42);
    arena.warn();
    assert.equal(arena.block, 'Clipboard block');
    arena.hit(shot);
    assert.equal(arena.hp, 42);
    assert.ok(arena.blockFlashUntil > arena.age);
    arena.volleyHit = true;
    arena.completeVolley();
    assert.equal(arena.staggered, false);
    arena.volleyHit = false;
    arena.completeVolley();
    assert.equal(arena.staggered, true);
    arena.hit(shot);
    assert.equal(arena.hp, 40);
});

test('all six move deterministically and damage tracks the moving body', () => {
    for (let level = 1; level <= 6; level++) {
        const a = arenaAt(level);
        const b = arenaAt(level);
        a.scene.reducedMotion = b.scene.reducedMotion = { matches: false };
        for (let step = 0; step < 1200; step++) {
            a.age += 8;
            b.age += 8;
            a.moveBoss(8);
            b.moveBoss(8);
            assert.equal(a.x, b.x);
            assert.ok(a.x >= 463 && a.x <= 540);
        }
        a.shield = 0;
        assert.equal(a.hit({ x: a.x - 85, y: 670 }), false);
        for (const y of [590, 633, 688, 743]) assert.equal(a.hit({ x: a.x, y }), true);
        assert.equal(a.hp, a.stats.hp - 4);
        a.launch({ kind: 'coin', lane: 1, repeats: 1 });
        assert.equal(a.threats.at(-1).x, a.x - 26);
    }
});

test('trimmed boss props gain at least 1.5x visible width without resizing attacks', () => {
    const frames = [
        ['coin', 87, 104, 62, 14, 35], ['tire', 96, 104, 64, 21, 43],
        ['paper', 96, 102, 87, 28, 85], ['grid-h', 80, 104, 58],
        ['coin', 96, 84, 48, 14, 35], ['minions', 95, 104, 48, 13, 32]
    ];
    frames.forEach(([kind, width, height, expected, collisionWidth, clearance], frame) => {
        const attack = ARENA_ATTACKS[kind];
        const previous = Math.min((attack.time ? 30 : attack.width * 2 + 2) / width, (attack.clearance || 40) / height);
        const scale = bossPropScale('boss-props', frame, { width, height }, attack);
        assert.ok(scale >= previous * 1.5);
        assert.ok(Math.abs(width * scale - expected) < 1e-8);
        assert.equal(attack.width, collisionWidth);
        assert.equal(attack.clearance, clearance);
        assert.equal(bossPropScale('coin', 0, { width, height }, attack), previous * 1.5);
    });
});

test('boss steps track distance and are suppressed outside ordinary pacing', () => {
    const arena = arenaAt(1);
    arena.scene.reducedMotion = { matches: false };
    arena.velocity = .032;
    arena.walkPhase = .5;
    assert.equal(arena.stepLift, 4.2);
    for (const state of [
        { velocity: 0 }, { plan: { at: arena.age + 200 } }, { launchUntil: arena.age + 150 },
        { poseUntil: arena.age + 100 }, { staggerUntil: arena.age + 100 }, { mode: 'defeat' },
        { blockFlashUntil: arena.age + 100 }, { intermissionUntil: arena.age + 100 }
    ]) {
        const suppressed = Object.assign(Object.create(BossArena.prototype), arena, state);
        assert.equal(suppressed.stepLift, 0);
    }
    arena.scene.reducedMotion.matches = true;
    assert.equal(arena.stepLift, 0);
    const simulated = (frameSteps) => {
        const boss = arenaAt(1);
        boss.scene.reducedMotion = { matches: false };
        for (let frame = 0; frame < 240 / frameSteps; frame++) {
            for (let step = 0; step < frameSteps; step++) {
                boss.age += 8;
                boss.moveBoss(8);
            }
        }
        return [boss.x, boss.walkPhase, boss.stepLift];
    };
    assert.deepEqual(simulated(4), simulated(2));
});

test('road and boss scenery share one time-scaled advance path', () => {
    class Game { constructor(config) { this.scene = config.scene; } }
    const gameSource = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
    const { DashScene, PARALLAX, normalSpeed } = vm.runInNewContext(
        gameSource + '\n({ DashScene: game.scene, PARALLAX, normalSpeed: scrollSpeed(0) })',
        { window: { Phaser: true }, Phaser: { Game, Scene: class {}, Scale: {} },
            BOSS_TUNING, bossDebugLevel, location: { search: '' } }
    );
    const noOp = () => {};
    const run = (mode, reduced, frames, state = 'PLAYING') => {
        const scene = Object.assign(new DashScene(), {
            state, elapsed: 0, scroll: 0, level: 1, roadElapsed: 0, bonus: 0, nextPattern: Infinity,
            resumeAt: -Infinity, newBest: true, reducedMotion: { matches: reduced },
            moveHorizontally: noOp, moveRoadDepth: noOp, fly: noOp, updateHealthPickup: noOp,
            updateShots: noOp, segments: [], layerOffsets: {}, layerSpeeds: {}
        });
        if (mode !== 'road') scene.arena = { mode, age: 0, active: mode === 'fight', step(ms) { this.age += ms; } };
        for (const frame of frames) for (let ms = frame; ms > 0; ms -= 8) scene.advance(Math.min(8, ms));
        return scene;
    };
    const frames30 = Array(30).fill(1000 / 30);
    const frames60 = Array(60).fill(1000 / 60);
    const road = run('road', false, frames60);
    const fight = run('fight', false, frames60);
    assert.ok(Math.abs(road.layerOffsets.road - road.scroll) < 1e-9);
    assert.ok(Math.abs(fight.layerOffsets.road - normalSpeed * .2) < 1e-9);
    assert.equal(fight.scroll, 0);
    for (const [layer, factor] of Object.entries(PARALLAX)) {
        assert.ok(Math.abs(fight.layerOffsets[layer] - normalSpeed * .2 * factor) < 1e-9);
        assert.ok(Math.abs(fight.layerOffsets[layer] - run('fight', false, frames30).layerOffsets[layer]) < 1e-9);
    }
    assert.equal(Object.keys(run('defeat', false, frames60).layerOffsets).length, 0);
    assert.equal(Object.keys(run('fight', true, frames60).layerOffsets).length, 0);
    const reducedRoad = run('road', true, frames60);
    assert.ok(reducedRoad.scroll > 0);
    for (const [layer, factor] of Object.entries(PARALLAX)) {
        assert.ok(Math.abs(reducedRoad.layerOffsets[layer] - reducedRoad.scroll * factor) < 1e-9);
        assert.ok(Math.abs(reducedRoad.layerOffsets[layer] - road.layerOffsets[layer]) < 1e-9);
    }
    const paused = run('road', true, frames60, 'PAUSED');
    assert.equal(paused.scroll, 0);
    assert.deepEqual(paused.layerOffsets, {});
    assert.equal(run('intro', true, frames60).layerOffsets.road, 0);
    const intro = run('intro', false, Array(125).fill(8));
    const coastSeconds = Array.from({ length: 63 }, (_, i) => Math.max(0, 1 - i * 8 / BOSS_TUNING.stop) * .008).reduce((a, b) => a + b);
    assert.ok(Math.abs(intro.layerOffsets.road - normalSpeed * coastSeconds) < 1e-9);
    intro.arena.mode = 'fight';
    intro.arena.active = true;
    const previous = intro.layerOffsets.road;
    intro.advance(8);
    assert.ok(Math.abs(intro.layerOffsets.road - previous - normalSpeed * .2 * .008) < 1e-9);
});

test('normal start, exact road boundaries, arena exits and replay keep the roster and theme in order', () => {
    class Game { constructor(config) { this.scene = config.scene; } }
    class Arena {
        constructor(scene, level) {
            this.level = level;
            this.spec = bossStats(level).definition;
            this.mode = 'defeat';
        }
        step() { return this.won; }
        destroy() { this.destroyed = true; }
    }
    const noOp = () => {};
    const nodes = new Map();
    const document = {
        body: { classList: { toggle: noOp } },
        getElementById(id) {
            if (!nodes.has(id)) nodes.set(id, { focus: noOp, querySelector: () => ({}) });
            return nodes.get(id);
        }
    };
    const localStorage = { getItem: () => '1', setItem: noOp };
    const gameSource = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
    const { DashScene, STATES, LEVEL_DISTANCE, scrollSpeed, themeForLevel } = vm.runInNewContext(
        gameSource + '\n({ DashScene: game.scene, STATES, LEVEL_DISTANCE, scrollSpeed, themeForLevel })',
        { window: { Phaser: true }, Phaser: { Game, Scene: class {}, Scale: {} },
            BOSS_TUNING, BossArena: Arena, bossDebugLevel, location: { search: '' }, document, localStorage }
    );
    const player = { anims: { stop: noOp, resume: noOp, pause: noOp }, clearTint() { return this; },
        setAlpha() { return this; }, setAngle() { return this; }, setPosition(x, y) { this.x = x; this.y = y; } };
    const banner = { setText() { return this; }, setAlpha() { return this; }, setVisible: noOp };
    const scene = Object.assign(new DashScene(), {
        state: STATES.AWAITING_START, player, banner, trailPoints: [], segments: [], shots: [], effects: [], layerSpeeds: {},
        roadKeys: new Set(), moveKeys: new Set(), pointerId: null, best: { score: 50000, level: 9 }, finishedRuns: 0,
        textures: { exists: () => false }, themeBackdrop: { setVisible: noOp }, reducedMotion: { matches: false },
        drawTaggy: noOp, resetSky: noOp, drawScenery: noOp, drawSpeedFX: noOp, drawRoadPosition: noOp, selectStore: noOp,
        speak: noOp, updateStats: noOp, moveHorizontally: noOp, moveRoadDepth: noOp, fly: noOp,
        updateHealthPickup: noOp, updateShots: noOp
    });
    scene.start();
    assert.equal(scene.state, STATES.PLAYING);
    assert.equal(scene.scroll, 0);
    assert.equal(scene.level, 1);
    assert.equal(scene.arena, null);
    assert.equal(scene.theme, 'nostalgiawave');
    scene.nextPattern = Infinity;
    scene.scroll = LEVEL_DISTANCE - 1.5;
    scene.advance(8);
    assert.ok(scene.scroll < LEVEL_DISTANCE);
    assert.equal(scene.arena, null);
    scene.advance((LEVEL_DISTANCE - scene.scroll) / scrollSpeed(scene.scroll) * 1000);
    assert.equal(scene.scroll, LEVEL_DISTANCE);
    for (let level = 1; level <= 7; level++) {
        const arena = scene.arena;
        assert.equal(scene.level, level);
        assert.equal(scene.theme, themeForLevel(level));
        assert.equal(arena.spec.id, bossStats(level).definition.id);
        assert.equal(scene.scroll, LEVEL_DISTANCE * level);
        scene.advance(8);
        assert.equal(scene.arena, arena);
        arena.won = true;
        scene.advance(8);
        assert.ok(arena.destroyed);
        assert.equal(scene.arena, null);
        assert.equal(scene.level, level + 1);
        assert.equal(scene.theme, themeForLevel(level + 1));
        assert.ok(scene.nextPattern > scene.scroll);
        if (level < 7) {
            scene.scroll = scene.level * LEVEL_DISTANCE - 0.001;
            scene.advance(8);
        }
    }
    const checkpoint = scene.scroll;
    scene.setRoundState(STATES.PAUSED);
    scene.start();
    scene.advance(8);
    assert.equal(scene.scroll, checkpoint);
    scene.setRoundState(STATES.PLAYING);
    assert.equal(scene.scroll, checkpoint);
    scene.crashAt = scene.elapsed;
    scene.crashUntil = scene.elapsed + 8;
    scene.advance(8);
    assert.equal(scene.state, STATES.GAME_OVER);
    scene.start();
    assert.equal(scene.arena, null);
    assert.equal(scene.scroll, 0);
    assert.equal(scene.level, 1);
    assert.equal(scene.theme, 'nostalgiawave');
    assert.equal(scene.best.score, 50000);
});

test('ambient road patterns start their registered animations only in standard motion', () => {
    class Game { constructor(config) { this.scene = config.scene; } }
    const gameSource = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
    const { DashScene, ENEMIES } = vm.runInNewContext(
        gameSource + '\n({ DashScene: game.scene, ENEMIES })',
        { window: { Phaser: true }, Phaser: { Game, Scene: class {}, Scale: {} },
            bossDebugLevel, location: { search: '' } }
    );
    const keys = new Set(['bird', 'drone', 'cart', 'coin']);
    for (const reduced of [false, true]) {
        const scene = Object.assign(new DashScene(), {
            reducedMotion: { matches: reduced }, segments: [],
            textures: { exists: () => false, get: () => ({ has: (frame) => frame === 0 }) },
            anims: { exists: key => keys.has(key) },
            add: {
                container(x) { return { x, setDepth() { return this; }, add() {} }; },
                sprite(x, y, key, frame) {
                    return { x, y, texture: { key }, frame, setScale() { return this; },
                        setDisplaySize() { return this; }, play(animation) { this.animation = animation; } };
                }
            }
        });
        for (const pattern of ENEMIES) {
            scene.spawnPattern(pattern, 0);
            const { hazard, coins } = scene.segments.at(-1);
            assert.equal(hazard.texture.key, pattern.key);
            assert.equal(hazard.frame, 0);
            assert.equal(hazard.animation, reduced ? undefined : pattern.key);
            assert.equal(coins.length, 5);
            for (const coin of coins) {
                assert.equal(coin.frame, 0);
                assert.equal(coin.animation, reduced ? undefined : 'coin');
            }
        }
    }
});
