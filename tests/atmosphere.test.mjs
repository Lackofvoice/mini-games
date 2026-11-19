import assert from 'node:assert/strict';
import { test } from 'node:test';
import atmosphere from '../atmosphere.js';

const { beamFrame, createClock } = atmosphere;
const order = [0, 2, 3, 1];

test('laser clock spaces changes, cycles all six patterns and does not catch up after a pause', () => {
    const tick = createClock();
    const patternNames = new Set();
    const changes = [];
    for (let timestamp = 0; timestamp < 39_000; timestamp += 5) {
        const frame = tick(timestamp);
        if (!frame) continue;
        changes.push(timestamp);
        patternNames.add(frame.pattern);
        if (frame.step === 15) {
            for (const beam of order) {
                assert.equal(beamFrame(frame.pattern, frame.step, beam, order, () => 0.5).opacity, 0);
            }
        }
    }
    assert.deepEqual([...patternNames], ['flicker', 'chase', 'pulse', 'alternate', 'fan', 'strobe']);
    assert.ok(changes.every((timestamp, index) => index === 0 || timestamp - changes[index - 1] >= 400));
    const resumed = tick(100_000);
    assert.equal(tick(100_016), null);
    assert.equal(tick(100_400).step, resumed.step + 1);
});

test('chase follows spatial order and the gentle strobe has just three spaced peaks', () => {
    for (let step = 0; step < order.length; step++) {
        const lit = order.filter(beam => beamFrame('chase', step, beam, order).opacity > 0.5);
        assert.deepEqual(lit, [order[step]]);
    }
    const peaks = Array.from({ length: 15 }, (_, step) => step)
        .filter(step => beamFrame('strobe', step, 0, order).opacity > 0.4);
    assert.deepEqual(peaks, [4, 6, 8]);
});
