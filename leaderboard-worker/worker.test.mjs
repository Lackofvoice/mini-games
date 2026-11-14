import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from './worker.mjs';
import { memoryKV } from './memory-kv.mjs';

function setup() {
    const env = { LEADERBOARD: memoryKV() };
    let tick = 0;
    return async (game = 'rv-dash', body, ip = 'fixture', headers = {}) => {
        const request = new Request('http://localhost/api/leaderboard/' + game, body === undefined ? { headers } :
            { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
        const response = await handle(request, env, { ip, now: 1200000 + tick++ });
        return [response.status, await response.json()];
    };
}

test('initials uppercase and reject malformed, blocked and look-alike entries', async () => {
    const call = setup();
    for (const initials of ['A', 'ABCD', 'A B', 'ÄBC', 'ABC\n']) assert.equal((await call('rv-dash', { initials, score: 5 }, initials))[0], 400);
    for (const initials of ['fuk', '5ex']) assert.deepEqual(await call('rv-dash', { initials, score: 5 }), [400, { message: 'Pick different initials' }]);
    assert.equal((await call('rv-dash', { initials: 'abc', score: 5, ignored: true }))[0], 201);
    assert.equal((await call())[1][0].initials, 'ABC');
});

test('score caps and integer input', async () => {
    const call = setup();
    for (const score of [0, 1.2, '30', 100001]) assert.equal((await call('rv-dash', { initials: 'ABC', score }))[0], 400);
    assert.equal((await call('rv-dash', { initials: 'ABC', score: 100000 }))[0], 201);
});

test('sixth submit is rate limited across both boards', async () => {
    const call = setup();
    for (let i = 0; i < 5; i++) assert.equal((await call('rv-dash', { initials: 'ABC', score: i + 1 }))[0], 201);
    assert.equal((await call('lot-hero', { initials: 'ABC', score: 6 }))[0], 429);
});

test('route, oversized body, content type and origin', async () => {
    const call = setup();
    assert.equal((await call('unknown'))[0], 404);
    assert.equal((await call('rv-dash', { x: 'x'.repeat(1024) }))[0], 413);
    assert.equal((await call('rv-dash', {}, 'fixture', { 'Content-Type': 'text/plain' }))[0], 400);
    assert.equal((await call('rv-dash', undefined, 'fixture', { Origin: 'null' }))[0], 403);
});

test('boards are separate; ties keep arrival order and storage caps at 25', async () => {
    const call = setup();
    assert.deepEqual(await call(), [200, []]);
    assert.equal((await call('rv-dash', { initials: 'DEF', score: 50 }))[1].rank, 1);
    assert.equal((await call('rv-dash', { initials: 'ABC', score: 50 }))[1].rank, 2);
    assert.deepEqual(await call('lot-hero'), [200, []]);
    for (let i = 1; i <= 23; i++) await call('rv-dash', { initials: 'ZIP', score: i + 50 }, String(i));
    assert.deepEqual(await call('rv-dash', { initials: 'QYZ', score: 50 }), [200, { rank: null }]);
    assert.deepEqual(await call('rv-dash', { initials: 'QYZ', score: 51 }), [201, { rank: 24 }]);
    assert.deepEqual((await call())[1].map((row) => row.score), [73,72,71,70,69,68,67,66,65,64]);
    assert.equal((await call('lot-hero', { initials: 'XYZ', score: 10 }))[0], 201);
    assert.equal((await call('lot-hero'))[1][0].score, 10);
});

test('preview origin can read both boards and preflight a submission', async () => {
    const env = { LEADERBOARD: memoryKV() };
    const origin = 'https://raw.githack.com';
    for (const game of ['rv-dash', 'lot-hero']) {
        const url = 'https://worker.example/api/leaderboard/' + game;
        const read = await handle(new Request(url, { headers: { Origin: origin } }), env);
        assert.equal(read.status, 200);
        assert.equal(read.headers.get('Access-Control-Allow-Origin'), origin);
        assert.deepEqual(await read.json(), []);
        const preflight = await handle(new Request(url, {
            method: 'OPTIONS',
            headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' }
        }), env);
        assert.equal(preflight.status, 200);
        assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
        assert.match(preflight.headers.get('Access-Control-Allow-Methods'), /\bPOST\b/);
        assert.equal(preflight.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
        const denied = await handle(new Request(url, { headers: { Origin: 'https://other.example' } }), env);
        assert.equal(denied.status, 403);
        assert.equal(denied.headers.get('Access-Control-Allow-Origin'), null);
    }
});
