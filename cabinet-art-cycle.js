(() => {
    'use strict';

    const DWELL_MS = 15000;
    const DISSOLVE_MS = 1200;
    const REQUIRED = ['marquee', 'left', 'right'];
    const SIZES = { marquee: [1824, 112], left: [690, 1980], right: [690, 1980], deck: [1267, 175] };
    const localPng = path => typeof path === 'string' && /^assets\/cabinet\/[a-z0-9-]+\.png$/.test(path);

    function readSets(manifest) {
        if (!manifest?.enabled || !Array.isArray(manifest.artSets)) return [];
        const ids = new Set();
        const sets = manifest.artSets.filter(set => {
            if (!set || typeof set.id !== 'string' || !/^(default|set-[0-9]{2})$/.test(set.id)
                || typeof set.label !== 'string' || ids.has(set.id)) return false;
            ids.add(set.id);
            return set.enabled !== false && (!set.seasonal || set.enabled === true)
                && REQUIRED.every(slot => localPng(set.slots?.[slot]));
        });
        return sets[0]?.id === 'default' ? sets : [];
    }

    async function prepareSet(set, defaultSet, outgoing, decode) {
        const decoded = await Promise.allSettled(REQUIRED.map(async slot => [slot, await decode(set.slots[slot], slot)]));
        const failure = decoded.find(result => result.status === 'rejected');
        if (failure) throw failure.reason;
        const entries = decoded.map(result => result.value);
        let sharedDeck = false;
        let deck;
        if (set.id !== 'default' && localPng(set.slots.deck)) {
            try { deck = await decode(set.slots.deck, 'deck'); } catch { /* Use the shared deck. */ }
        }
        if (!deck && outgoing?.deck) {
            deck = await decode(defaultSet.slots.deck, 'deck');
            sharedDeck = true;
        }
        if (deck) entries.push(['deck', deck]);
        return { id: set.id, images: Object.fromEntries(entries), deck: Boolean(deck && !sharedDeck), sharedDeck };
    }

    function createCycle(sets, view, timers = globalThis) {
        const failed = new Set();
        let current = 0;
        let shown;
        let candidate;
        let loading = false;
        let timer;
        let allowed = false;
        let due = false;
        let moving = false;

        function prepare() {
            if (!allowed || candidate || loading || moving) return;
            const index = sets.findIndex((_, i) => i !== current && !failed.has(i) && i > current);
            const next = index < 0 ? sets.findIndex((_, i) => i !== current && !failed.has(i)) : index;
            if (next < 0) return;
            const request = candidate = { index: next };
            loading = true;
            view.prepare(sets[next], shown).then(art => {
                request.art = art;
            }, () => {
                failed.add(next);
                if (candidate === request) candidate = null;
            }).finally(() => {
                loading = false;
                prepare();
                // If decode finished after the deadline, separate it from the first dissolve frame.
                if (allowed && due && candidate?.art && !moving && timer == null) {
                    timer = timers.setTimeout(begin, 32);
                }
            });
        }

        function dwell() {
            due = false;
            if (!allowed || sets.length < 2) return;
            timer = timers.setTimeout(() => {
                timer = null;
                due = true;
                begin();
            }, DWELL_MS);
            prepare();
        }

        function begin() {
            timer = null;
            if (!allowed || !candidate?.art || moving) return;
            due = false;
            moving = true;
            view.dissolve(candidate.art);
            timer = timers.setTimeout(() => {
                timer = null;
                current = candidate.index;
                shown = candidate.art.id === 'default' ? undefined : candidate.art;
                candidate = null;
                moving = false;
                view.settle(true);
                dwell();
            }, DISSOLVE_MS);
        }

        return {
            sync(eligible, reduced) {
                const nextAllowed = eligible && !reduced;
                if (allowed === nextAllowed && !reduced) return;
                allowed = nextAllowed;
                timers.clearTimeout(timer);
                timer = null;
                due = false;
                if (moving) view.settle(false);
                moving = false;
                if (reduced) {
                    current = 0;
                    shown = undefined;
                    candidate = null;
                    view.reset();
                }
                dwell();
            }
        };
    }

    function mount() {
        const config = document.getElementById('cabinet-art-manifest');
        let sets;
        try { sets = readSets(JSON.parse(config?.textContent ?? 'null')); } catch { return; }
        if (sets.length < 2 || new URLSearchParams(location.search).get('cabinetArt') === 'off') return;

        const screen = document.getElementById('cabinet-screen');
        const start = document.getElementById('start');
        const result = document.getElementById('result');
        const demo = document.getElementById('demo-banner');
        const help = document.getElementById('controls-dialog');
        const board = document.getElementById('leaderboard');
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const slots = {
            marquee: screen.querySelector('.cabinet-marquee'),
            left: screen.querySelector('.side-illustration.left'),
            right: screen.querySelector('.side-illustration.right'),
            deck: document.querySelector('#arcade-deck .painted-deck')
        };
        let visible = [];
        let incoming = [];

        async function decode(path, slot) {
            if (!localPng(path)) throw Error('Invalid cabinet art path');
            const image = new Image();
            image.alt = '';
            image.className = 'cabinet-cycle-image';
            image.src = path;
            await image.decode();
            const [w, h] = SIZES[slot];
            if (image.naturalWidth !== w || image.naturalHeight !== h) throw Error('Unexpected cabinet art size');
            return image;
        }

        const cycle = createCycle(sets, {
            prepare: (set, current) => prepareSet(set, sets[0], current, decode),
            dissolve(art) {
                screen.dataset.cabinetArtNext = art.id;
                incoming = Object.entries(art.images).map(([slot, image]) => {
                    slots[slot].append(image);
                    const animation = image.animate([{ opacity: 0 }, { opacity: 1 }], {
                        duration: DISSOLVE_MS, easing: 'ease-in-out', fill: 'both'
                    });
                    return { image, animation, keep: art.id !== 'default' && !(slot === 'deck' && art.sharedDeck) };
                });
            },
            settle(commit) {
                if (commit) {
                    visible.forEach(image => image.remove());
                    visible = incoming.filter(layer => layer.keep).map(layer => layer.image);
                    screen.dataset.cabinetArtSet = screen.dataset.cabinetArtNext;
                }
                for (const layer of incoming) {
                    if (!commit || !layer.keep) layer.image.remove();
                    layer.animation.cancel();
                }
                incoming = [];
                delete screen.dataset.cabinetArtNext;
            },
            reset() {
                visible.forEach(image => image.remove());
                visible = [];
                screen.dataset.cabinetArtSet = 'default';
            }
        });

        screen.dataset.cabinetArtSet = 'default';
        const sync = () => cycle.sync(!document.hidden && !start.disabled
            && screen.dataset.game === 'rv-dash' && !help.open && !board.open
            && (!start.hidden || !result.hidden || !demo.hidden), reduced.matches);
        const observer = new MutationObserver(sync);
        observer.observe(screen, { attributes: true, attributeFilter: ['data-game'] });
        observer.observe(start, { attributes: true, attributeFilter: ['disabled', 'hidden'] });
        for (const node of [result, demo, help, board]) {
            observer.observe(node, { attributes: true, attributeFilter: ['hidden', 'open'] });
        }
        document.addEventListener('visibilitychange', sync);
        reduced.addEventListener('change', sync);
        sync();
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = { DWELL_MS, DISSOLVE_MS, readSets, prepareSet, createCycle };
    } else mount();
})();
