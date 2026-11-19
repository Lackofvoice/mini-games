import assert from 'node:assert/strict';
import { test } from 'node:test';
import demo from '../demo-mode.js';

const { AttractMode, DEMO_IDLE_MS, DEMO_BOARD_DELAY_MS, DEMO_BOARD_HOLD_MS, driveDemo } = demo;

test('a claimed board uses only demo simulation time, shows once and clears at expiry', () => {
    const mode = new AttractMode();
    const presentation = { rank: 2, initials: 'TAG', score: 150, ready: true };
    const shown = [];
    const board = {
        showDemoBoard(data) { shown.push(data); return true; },
        hideDemoBoard() { shown.push('hidden'); }
    };
    mode.claimBoard(presentation);
    mode.updateBoard(DEMO_BOARD_DELAY_MS - 1, board);
    assert.deepEqual(shown, []);
    mode.updateBoard(DEMO_BOARD_DELAY_MS, board);
    mode.updateBoard(DEMO_BOARD_DELAY_MS, board); // simulation clock frozen
    mode.updateBoard(DEMO_BOARD_DELAY_MS + DEMO_BOARD_HOLD_MS - 1, board);
    assert.deepEqual(shown, [presentation]);
    mode.updateBoard(DEMO_BOARD_DELAY_MS + DEMO_BOARD_HOLD_MS, board);
    mode.updateBoard(100000, board);
    assert.deepEqual(shown, [presentation, 'hidden']);
});

test('an early exit or unavailable ranking consumes the presentation without retry', () => {
    const mode = new AttractMode();
    let attempts = 0;
    const board = {
        showDemoBoard() { attempts++; return false; },
        hideDemoBoard() { assert.fail('an unavailable ranking was never displayed'); }
    };
    mode.claimBoard({});
    mode.clearBoard(board);
    mode.updateBoard(500, board);
    assert.equal(attempts, 0);
    mode.claimBoard({});
    mode.updateBoard(500, board);
    mode.updateBoard(501, board);
    mode.clearBoard(board);
    assert.equal(attempts, 1);
});

test('attract scenes rotate through two roads and the Tire Kicker arena across deaths and exits', () => {
    const mode = new AttractMode();
    const next = () => {
        mode.gameOver();
        assert.equal(mode.wait(0, false), false);
        assert.equal(mode.wait(DEMO_IDLE_MS, false), true);
        return mode.nextScene();
    };
    assert.deepEqual(next(), { level: 1, arena: false });
    assert.deepEqual(next(), { level: 3, arena: false });
    mode.reset();
    assert.deepEqual(next(), { level: 2, arena: true });
    assert.deepEqual(next(), { level: 1, arena: false });
});

test('open score flow, activity and visibility each require a fresh eight seconds', () => {
    const mode = new AttractMode();
    mode.gameOver();
    assert.equal(mode.wait(0, true), false);
    assert.equal(mode.wait(20000, true), false);
    assert.equal(mode.wait(20001, false), false);
    assert.equal(mode.wait(20000 + DEMO_IDLE_MS, false), false);
    mode.activity();
    assert.equal(mode.wait(29000, false), false);
    mode.visibilityChanged();
    assert.equal(mode.wait(80000, false), false);
    assert.equal(mode.wait(80000 + DEMO_IDLE_MS, false), true);
    assert.equal(mode.wait(90000, false), false);
    mode.visibilityChanged();
    assert.equal(mode.canAdvance(true), false);
    mode.visibilityChanged();
    assert.equal(mode.canAdvance(false), false);
    assert.equal(mode.canAdvance(false), true);
    mode.gameOver();
    assert.equal(mode.wait(91000, false), false);
    assert.equal(mode.wait(99000, false), true);
    mode.reset();
    assert.equal(mode.wait(120000, false), false);
});

test('trusted input consumes exit and its follow-up while a fresh interaction passes', () => {
    for (const type of ['keydown', 'pointerdown', 'click']) {
        const mode = new AttractMode();
        let exits = 0;
        const capture = (type, demoContext, { isTrusted = true, repeat = false } = {}) => {
            const event = { type, isTrusted, repeat, code: 'Space',
                preventDefault() { this.prevented = true; },
                stopImmediatePropagation() { this.stopped = true; } };
            mode.capture(event, demoContext, () => { exits++; mode.reset(); });
            assert.equal(event.stopped, event.prevented);
            return Boolean(event.stopped);
        };
        assert.equal(capture(type, true, { isTrusted: false }), true);
        assert.equal(exits, 0);
        assert.equal(capture(type, true), true);
        assert.equal(exits, 1);
        if (type === 'keydown') {
            assert.equal(capture('keydown', false, { repeat: true }), true);
            assert.equal(capture('keyup', false), true);
        } else if (type === 'pointerdown') {
            assert.equal(capture('click', false), true);
        }
        assert.equal(capture(type, false), false);
        assert.equal(exits, 1);
    }
});

test('autopilot holds the normal flight and fire inputs and releases flight after clearance', () => {
    const inputs = [];
    const scene = {
        player: { x: 120, y: 600 }, roadDepth: 600, verticalSpeed: 0,
        panelFlight: new Set(), panelFire: false,
        segments: [{ view: { x: 215 }, pattern: { depth: 600 } }],
        panelInput(input) {
            inputs.push(input);
            if (input.source === 'fire') this.panelFire = input.held;
            else if (input.held) this.panelFlight.add(input.source);
            else this.panelFlight.delete(input.source);
        }
    };
    driveDemo(scene);
    driveDemo(scene);
    scene.segments[0].view.x = 40;
    driveDemo(scene);
    assert.deepEqual(inputs, [
        { source: 'fly', held: true },
        { source: 'fire', held: true },
        { source: 'fly', held: false }
    ]);
});
