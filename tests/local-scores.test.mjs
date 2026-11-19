import assert from 'node:assert/strict';
import { test } from 'node:test';
import scores from '../local-scores.js';

const record = (initials, score, level = 2) => ({ initials, score, level });
const date = new Date('2026-11-19T17:01:00.000Z');
function memory() {
    const data = new Map();
    return () => ({ getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) });
}

test('local Top 10 survives a fresh read and keeps earlier ties ahead', () => {
    const storage = memory();
    for (let n = 1; n <= 9; n++) scores.save(storage, record('RVA', n), date);
    assert.equal(scores.save(storage, record('TAG', 9), date).rank, 2);
    assert.equal(scores.save(storage, record('OLD', 1), date).kind, 'outside-top');
    assert.equal(scores.save(storage, record('NEW', 20, 3), date).rank, 1);
    const { rows } = scores.read(storage);
    assert.equal(rows.length, 10);
    assert.deepEqual(rows[0], { ...record('NEW', 20, 3), date: date.toISOString() });
    assert.deepEqual(rows.slice(1, 3).map(row => row.initials), ['RVA', 'TAG']);
    assert.deepEqual(rows.map(row => row.score), [20, 9, 9, 8, 7, 6, 5, 4, 3, 2]);
});

test('invalid JSON and malformed scores are ignored, and saves are accepted only after readback', () => {
    const storage = memory();
    storage().setItem(scores.LOCAL_SCORE_KEY, '{');
    assert.deepEqual(scores.read(storage).rows, []);
    storage().setItem(scores.LOCAL_SCORE_KEY, JSON.stringify([
        { ...record('TAG', 9), date: date.toISOString() }, null,
        { ...record('<A>', 10), date: date.toISOString() },
        { ...record('BAD', 0), date: date.toISOString() },
        { ...record('BAD', 10, 1.5), date: date.toISOString() },
        { ...record('BAD', 10), date: 'today' }
    ]));
    assert.equal(scores.read(storage).rows.length, 1);
    assert.equal(scores.save(storage, record('RVA', 100001), date).kind, 'invalid');
    const blocked = () => { throw new Error('blocked'); };
    const silent = () => ({ getItem: () => null, setItem() {} });
    const quota = () => ({ getItem: () => null, setItem() { throw new Error('quota'); } });
    for (const provider of [blocked, silent, quota]) {
        assert.equal(scores.save(provider, record('TAG', 30), date).kind, 'storage');
    }
    assert.equal(scores.read(blocked).accessible, false);
});
