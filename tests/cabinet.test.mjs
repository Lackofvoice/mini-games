import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../cabinet.js', import.meta.url), 'utf8');
const artSource = source.slice(0, source.indexOf('    if (PANEL_CONTROLS_ENABLED)'))
    + '    Object.assign(globalThis, { selectArt, fullscreenInvitation });\n})();';
const art = data => ({ src: 'data:image/png;base64,' + data, width: 500, height: 500 });

test('arcade effects are decorative and visible button text has its own element', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.match(html, /<html\b[^>]*data-art="(?:pixel|realistic)"/);
    for (const layer of ['smoke', 'lasers']) {
        assert.match(html, new RegExp('<div class="' + layer + '" aria-hidden="true">'));
    }
    for (const [, , content] of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
        assert.match(content, /<span class="btn-label">[^<]+<\/span>/);
    }
});

test('arcade deck exposes exactly four labeled controls in play order', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const deck = html.match(/<section id="arcade-deck"[\s\S]*?<\/section>/)[0];
    const buttons = [...deck.matchAll(/<button\b[^>]*\bid="([^"]+)"[^>]*\baria-label="([^"]+)"/g)];
    assert.deepEqual(buttons.map(([, id]) => id), ['deck-stick', 'deck-fly', 'deck-fire', 'deck-start']);
    assert.equal((deck.match(/<button\b/g) || []).length, buttons.length);
    assert.match(deck, /class="painted-deck" aria-hidden="true"/);
});

function element() {
    const classes = new Set();
    return {
        children: [], dataset: {}, clientWidth: 800, complete: true, naturalWidth: 500,
        style: { setProperty(key, value) { this[key] = value; } },
        classList: { add: name => classes.add(name), remove: name => classes.delete(name),
            contains: name => classes.has(name), toggle: (name, on) => on ? classes.add(name) : classes.delete(name) },
        addEventListener() {},
        append(...children) { this.children.push(...children); },
        setAttribute(key, value) { this[key] = value; },
        getAttribute(key) { return this[key]; },
        removeAttribute(key) { delete this[key]; }
    };
}

test('per-game selection updates all art layers and missing art returns to fallbacks', () => {
    const ids = new Map();
    const byId = id => {
        if (!ids.has(id)) ids.set(id, element());
        return ids.get(id);
    };
    const room = byId('page-scene');
    room.append(element(), element());
    const first = art('AAAA');
    const second = { ...art('BBBB'), width: 200, height: 200 };
    const events = new Map();
    const context = {
        document: { getElementById: byId, querySelector: element, createElement: element },
        matchMedia: element,
        ResizeObserver: class { observe() {} },
        window: {
            RV_DASH_TOW_THEMES: { nostalgiawave: first.src, second: second.src },
            RV_DASH_CABINET_ART: {
                cabinets: {
                    'rv-dash': { ...first, window: [10, 10, 60, 80] },
                    second: { ...second, window: [20, 10, 60, 80] },
                    invalid: { ...second, window: [10, 10, 60, 40] }
                },
                panels: { 'rv-dash': first, second }
            },
            addEventListener: (event, listener) => events.set(event, listener)
        }
    };
    vm.runInNewContext(artSource, context);
    const screen = byId('cabinet-screen');
    const frame = byId('cabinet-image');
    const panel = byId('deck-image');
    const shown = () => room.children.find(layer => layer.classList.contains('scene-active'))?.style.backgroundImage;
    assert.match(shown(), /AAAA/);
    assert.equal(frame.src, first.src);
    assert.equal(panel.src, first.src);
    context.selectArt({ status: 'active', title: 'Second game',
        artSet: { pageTheme: 'second', cabinet: 'second', panel: 'second' } });
    assert.match(shown(), /BBBB/);
    assert.equal(frame.src, second.src);
    assert.equal(panel.src, second.src);
    assert.equal(byId('marquee-label').textContent, 'Second game');
    assert.equal(screen.style['--marquee-source-width'], '200px');
    assert.equal(screen.style['--marquee-source-crop'], '90%');
    assert.equal(screen.classList.contains('has-marquee'), true);
    assert.equal(byId('arcade-deck').style['--deck-source-width'], '200px');
    assert.equal(frame.hidden, false);
    events.get('rvdash:themechange')({ detail: { gameId: 'rv-dash', themeKey: 'nostalgiawave' } });
    context.selectArt({ status: 'locked' });
    assert.match(shown(), /BBBB/);
    context.selectArt({ status: 'active', title: 'Fallback game', artSet: { pageTheme: 'missing', cabinet: 'invalid' } });
    assert.equal(shown(), undefined);
    assert.equal(frame.hidden, true);
    assert.equal(screen.classList.contains('has-marquee'), false);
    assert.equal(byId('marquee-label').textContent, 'Fallback game');
    assert.equal(frame.src, undefined);
    assert.equal(panel.src, undefined);
});

test('quick releases remain visible and cancellation or a new press clears the old timer', () => {
    const context = vm.runInNewContext('(' + source.slice(source.indexOf('function pressFeedback('),
        source.indexOf('\n    function fullscreenInvitation(')).trim() + ')');
    const pressed = new Set();
    const pending = new Map();
    const button = {
        toggleAttribute: (key, on) => on ? pressed.add(key) : pressed.delete(key),
        removeAttribute: key => pressed.delete(key)
    };
    let now = 500;
    let nextTimer = 0;
    const advance = ms => {
        now += ms;
        for (const [id, { deadline, callback }] of pending) {
            if (deadline > now) continue;
            pending.delete(id);
            callback();
        }
    };
    const feedback = context(button, () => now, (callback, delay) => {
        pending.set(++nextTimer, { callback, deadline: now + delay });
        return nextTimer;
    }, id => pending.delete(id));
    feedback(true);
    assert.ok(pressed.has('data-depressed'));
    advance(10);
    feedback(false);
    advance(79);
    assert.ok(pressed.has('data-depressed'));
    advance(1);
    assert.ok(!pressed.has('data-depressed'));
    feedback(true);
    feedback(false);
    advance(30);
    feedback(true);
    advance(100);
    assert.ok(pressed.has('data-depressed'));
    feedback(false);
    assert.ok(!pressed.has('data-depressed'));
    feedback(true);
    feedback(false);
    feedback(false, true);
    assert.ok(!pressed.has('data-depressed'));
    assert.equal(pending.size, 0);
});

test('the fullscreen invitation appears once per tab session, even if storage is blocked', () => {
    const invitation = vm.runInNewContext('(' + source.slice(source.indexOf('function fullscreenInvitation('),
        source.indexOf('\n    if (PANEL_CONTROLS_ENABLED)')).trim() + ')');
    const values = new Map();
    const session = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
    const page = invitation(() => session);
    assert.equal(page(), true);
    assert.equal(page(), false);
    assert.equal(invitation(() => session)(), false);
    const blocked = invitation(() => { throw new Error('storage denied'); });
    assert.equal(blocked(), true);
    assert.equal(blocked(), false);
});
