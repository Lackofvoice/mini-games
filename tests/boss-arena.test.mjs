import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../boss-arena.js', import.meta.url), 'utf8');
const { BossArena, bossStats, bossDebugLevel, BOSS_TUNING } = vm.runInNewContext(
    source + '\n({ BossArena, bossStats, bossDebugLevel, BOSS_TUNING })',
    { URLSearchParams, ROAD_LANES: [633, 688, 743], PLAYER_HALF_WIDTH: 21 }
);

const arenaAt = (level) => {
    const stats = bossStats(level);
    const arena = Object.create(BossArena.prototype);
    return Object.assign(arena, {
        spec: stats.definition, stats, hp: stats.hp, scene: { roadLane: 1 },
        mode: 'fight', age: 1850, phase: 0, phaseTurn: 0, hits: 0, turn: 0,
        intermissionUntil: 0, threats: [], plan: null, followUp: null, clipboardUntil: 0
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

test('Merger intermission clears obsolete attacks and the new pair shares its warning band', () => {
    const arena = arenaAt(6);
    arena.hp = 28;
    arena.warn();
    const { x, y } = BOSS_TUNING;
    assert.ok(arena.hit({ x, y }));
    assert.equal(arena.phase, 1);
    assert.equal(arena.plan, null);
    assert.equal(arena.threats.length, 0);
    assert.equal(arena.active, false);
    arena.hit({ x, y });
    assert.equal(arena.hp, 27);
    arena.age = arena.intermissionUntil;
    arena.warn();
    assert.equal(arena.plan.kind, 'minions');
    assert.equal(arena.followUp.kind, 'paper');
    assert.equal(arena.followUp.lane, arena.plan.lane);
    assert.equal(arena.followUp.at - arena.plan.at, 1200);
});
