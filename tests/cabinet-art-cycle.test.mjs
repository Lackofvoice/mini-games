import assert from 'node:assert/strict';
import { test } from 'node:test';
import artCycle from '../cabinet-art-cycle.js';

const { DWELL_MS, DISSOLVE_MS, readSets, prepareSet, createCycle } = artCycle;
const set = (id, extra = {}) => ({
    id, label: id, slots: Object.fromEntries(['marquee', 'left', 'right'].map(slot =>
        [slot, 'assets/cabinet/' + id + '-' + slot + '.png'])),
    ...extra
});
const defaults = set('default');
defaults.slots.deck = 'assets/cabinet/default-deck.png';

test('art manifest keeps fallback compatibility, order, explicit seasonal enablement and unique IDs', () => {
    assert.deepEqual(readSets({ windowLeft: 26.1 }), []);
    assert.deepEqual(readSets({ enabled: false, artSets: [defaults] }), []);
    const ordered = readSets({ enabled: true, artSets: [
        defaults, set('set-02'), set('set-01'), set('set-02'), set('UPPER'),
        set('set-10', { slots: { marquee: 'https://example.test/marquee.png' } }),
        set('set-11', { seasonal: true })
    ] });
    assert.deepEqual(ordered.map(value => value.id), ['default', 'set-02', 'set-01']);
    assert.equal(readSets({ enabled: true, artSets: [defaults, set('set-11', { seasonal: true, enabled: true })] }).length, 2);
    assert.deepEqual(readSets({ enabled: true, artSets: [set('set-01'), defaults] }), []);
});

test('image failure invalidates a required set, while bad optional deck falls back to shared', async () => {
    const alternate = set('set-01');
    alternate.slots.deck = 'assets/cabinet/optional-deck.png';
    const decode = async (path, slot) => {
        if (path.includes('optional')) throw Error('bad deck');
        return { path, slot };
    };
    const art = await prepareSet(alternate, defaults, { deck: true }, decode);
    assert.equal(art.images.deck.path, defaults.slots.deck);
    assert.equal(art.deck, false);
    assert.equal(art.sharedDeck, true);
    assert.equal((await prepareSet(alternate, defaults, null, decode)).images.deck, undefined);
    await assert.rejects(prepareSet(alternate, defaults, null, async (path, slot) => {
        if (slot === 'left') throw Error('missing or undecodable required image');
        return { path };
    }), /missing or undecodable/);
});

function clock() {
    let now = 0, sequence = 0;
    const pending = new Map();
    return {
        setTimeout(fn, delay) { pending.set(++sequence, { fn, at: now + delay }); return sequence; },
        clearTimeout(id) { pending.delete(id); },
        advance(ms) {
            const end = now + ms;
            for (;;) {
                const next = [...pending.entries()].sort((a, b) => a[1].at - b[1].at)[0];
                if (!next || next[1].at > end) break;
                now = next[1].at;
                pending.delete(next[0]);
                next[1].fn();
            }
            now = end;
        }
    };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('a default-only manifest stays static without scheduling or preloading', () => {
    const controller = createCycle([defaults], {
        prepare: () => assert.fail('preload'),
        dissolve: () => assert.fail('dissolve')
    }, {
        setTimeout: () => assert.fail('timer'),
        clearTimeout() {}
    });
    controller.sync(true, false);
});

test('art cycle dwells, dissolves atomically, freezes real or hidden state, then starts a new dwell', async () => {
    const actions = [];
    const timers = clock();
    const view = {
        async prepare(next) { actions.push('decode ' + next.id); return next; },
        dissolve(next) { actions.push('fade ' + next.id); },
        settle(commit) { actions.push(commit ? 'commit' : 'cancel'); },
        reset() { actions.push('default'); }
    };
    const controller = createCycle([defaults, set('set-01')], view, timers);
    controller.sync(true, false);
    await flush();
    timers.advance(DWELL_MS - 1);
    assert.deepEqual(actions, ['decode set-01']);
    timers.advance(1);
    controller.sync(false, false);
    timers.advance(60000);
    assert.deepEqual(actions, ['decode set-01', 'fade set-01', 'cancel']);
    controller.sync(true, false);
    timers.advance(DWELL_MS - 1);
    assert.equal(actions.at(-1), 'cancel');
    timers.advance(DISSOLVE_MS);
    assert.equal(actions.at(-1), 'fade set-01');
    timers.advance(1);
    await flush();
    assert.deepEqual(actions.slice(-2), ['commit', 'decode default']);
    timers.advance(DWELL_MS);
    assert.equal(actions.at(-1), 'fade default');
    controller.sync(true, true);
    timers.advance(60000);
    assert.deepEqual(actions.slice(-2), ['cancel', 'default']);
});

test('slow decode holds the current art and a broken set is skipped for the session', async () => {
    const timers = clock();
    const events = [];
    let complete;
    const controller = createCycle([defaults, set('set-01'), set('set-02')], {
        async prepare(next) {
            events.push(next.id);
            if (next.id === 'set-01') throw Error('missing');
            return new Promise(resolve => { complete = () => resolve(next); });
        },
        dissolve(next) { events.push('fade ' + next.id); },
        settle() {},
        reset() {}
    }, timers);
    controller.sync(true, false);
    await flush();
    timers.advance(DWELL_MS + 2000);
    assert.deepEqual(events, ['set-01', 'set-02']);
    complete();
    await flush();
    timers.advance(31);
    assert.deepEqual(events, ['set-01', 'set-02']);
    timers.advance(1);
    assert.equal(events.at(-1), 'fade set-02');
});
