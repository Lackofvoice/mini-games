(() => {
    'use strict';
    const byId = (id) => document.getElementById(id);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const main = document.querySelector('main');
    const PANEL_CONTROLS_ENABLED = true;
    const games = [
        { id: 'rv-dash', title: 'RV Dash', status: 'active', target: '#start',
            artSet: { pageTheme: 'rv-dash', initialTheme: 'nostalgiawave', cabinet: 'rv-dash', panel: 'rv-dash' } },
        { id: 'lot-hero', title: 'Lot Hero', status: 'locked', target: null, artSet: {} },
        { id: 'coming-soon', title: 'Coming soon', status: 'locked', target: null, artSet: {} }
    ];

    for (const entry of games) {
        const slot = document.createElement('li');
        slot.dataset.game = entry.id;
        const locked = entry.status === 'locked';
        const item = document.createElement(locked ? 'span' : 'a');
        item.className = 'slot ' + entry.status;
        if (locked) item.setAttribute('aria-disabled', 'true');
        else {
            item.href = entry.target;
            item.setAttribute('aria-current', 'true');
            item.addEventListener('click', (event) => {
                event.preventDefault();
                selectArt(entry);
                const target = ['start', 'pause', 'replay'].map(byId)
                    .find((button) => !button.disabled && button.getClientRects().length);
                target?.focus();
            });
        }
        const title = document.createElement('span');
        title.className = 'slot-label';
        title.textContent = entry.title;
        title.dataset.text = entry.title;
        const state = document.createElement('small');
        state.textContent = locked ? 'Locked' : 'Selected';
        item.append(title, state);
        slot.append(item);
        byId('game-slots').append(slot);
    }

    const screen = byId('cabinet-screen');
    const cabinetImage = byId('cabinet-image');
    const marqueeLabel = byId('marquee-label');
    const deck = byId('arcade-deck');
    const deckImage = byId('deck-image');
    const sceneLayers = [...byId('page-scene').children];
    const bundle = window.RV_DASH_CABINET_ART || {};
    const themes = window.RV_DASH_TOW_THEMES || {};
    const imageData = source => typeof source === 'string' && /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(source);
    const isArt = entry => imageData(entry?.src) && Number.isFinite(entry.width) && entry.width > 0
        && Number.isFinite(entry.height) && entry.height > 0;
    const isFrame = entry => {
        if (!isArt(entry) || entry.window?.length !== 4) return false;
        const [x, y, w, h] = entry.window;
        return entry.window.every(v => Number.isFinite(v) && v >= 0 && v <= 100)
            && w > 0 && h > 0 && x + w <= 100 && y + h <= 100
            && Math.abs(entry.width * w / (entry.height * h) - .75) < .003;
    };
    const currentThemes = new Map();
    let activeGame, cabinetArt, sceneSource, sceneIndex = 0;
    function showMarquee() {
        const active = cabinetArt?.window[1] > 0 && cabinetImage.complete && cabinetImage.naturalWidth;
        screen.classList.toggle('has-marquee', Boolean(active));
        cabinetImage.hidden = !active;
    }
    cabinetImage.addEventListener('load', showMarquee);
    cabinetImage.addEventListener('error', showMarquee);
    deckImage.addEventListener('load', () => deck.classList.add('has-print'));
    deckImage.addEventListener('error', () => deck.classList.remove('has-print'));
    function showTheme(source) {
        const next = imageData(source) ? source : null;
        if (next === sceneSource) return;
        sceneSource = next;
        sceneLayers[sceneIndex].classList.remove('scene-active');
        if (!next) return;
        sceneIndex = 1 - sceneIndex;
        sceneLayers[sceneIndex].style.backgroundImage = `url("${next}")`;
        sceneLayers[sceneIndex].classList.add('scene-active');
    }
    function selectArt(entry) {
        if (!entry || entry.status === 'locked') return;
        activeGame = entry;
        screen.dataset.game = entry.id;
        marqueeLabel.textContent = entry.title;
        const { pageTheme, initialTheme, cabinet, panel } = entry.artSet;
        const theme = currentThemes.get(pageTheme) || initialTheme || pageTheme;
        showTheme(themes[theme]);
        const frame = bundle.cabinets?.[cabinet];
        cabinetArt = isFrame(frame) ? frame : null;
        if (cabinetArt) {
            cabinetImage.src = cabinetArt.src;
            screen.style.setProperty('--marquee-source-width', Math.min(280, cabinetArt.width) + 'px');
            screen.style.setProperty('--marquee-source-crop', (100 - cabinetArt.window[1]) + '%');
            if (cabinetArt.window[1] > 0) {
                screen.style.setProperty('--marquee-ratio', cabinetArt.width / (cabinetArt.height * cabinetArt.window[1] / 100));
            }
        } else cabinetImage.removeAttribute('src');
        showMarquee();
        const print = bundle.panels?.[panel];
        deck.classList.remove('has-print');
        if (isArt(print)) {
            if (deckImage.getAttribute('src') !== print.src) deckImage.src = print.src;
            else if (deckImage.complete && deckImage.naturalWidth) deck.classList.add('has-print');
            deck.style.setProperty('--deck-source-width', print.width + 'px');
            deck.style.setProperty('--deck-source-height', print.height + 'px');
        } else deckImage.removeAttribute('src');
    }
    window.addEventListener('rvdash:themechange', ({ detail }) => {
        if (!detail) return;
        currentThemes.set(detail.gameId, detail.themeKey);
        if (activeGame?.artSet.pageTheme === detail.gameId) showTheme(themes[detail.themeKey]);
    });
    selectArt(games.find(entry => entry.status === 'active'));

    function pressFeedback(node, now = performance.now.bind(performance), schedule = setTimeout, cancel = clearTimeout) {
        let since = 0;
        let timer;
        return (pressed, immediate = false) => {
            cancel(timer);
            timer = undefined;
            if (pressed) since = now();
            const remaining = pressed || immediate ? 0 : 90 - (now() - since);
            if (remaining > 0) timer = schedule(() => node.removeAttribute('data-depressed'), remaining);
            else node.toggleAttribute('data-depressed', pressed);
        };
    }

    function fullscreenInvitation(storage = () => window.sessionStorage) {
        const key = 'rv-dash:fullscreen-invitation';
        let shown = false;
        return () => {
            if (shown) return false;
            shown = true;
            try {
                const session = storage();
                if (session?.getItem(key)) return false;
                session?.setItem(key, '1');
            } catch {
                // The in-memory flag also works when file storage is unavailable.
            }
            return true;
        };
    }

    if (PANEL_CONTROLS_ENABLED) {
        const controls = ['stick', 'fly', 'fire', 'start'].map(source => ({ source, node: byId('deck-' + source) }));
        const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        const emit = (source, values) => window.dispatchEvent(new CustomEvent('rvdash:panelinput', { detail: { source, ...values } }));
        const primary = () => document.querySelector('dialog[open], [aria-modal="true"]:not([hidden])')
            ? undefined : ['start', 'replay'].map(byId).find(node => !node.disabled && node.getClientRects().length);
        const start = controls.at(-1).node;
        const replay = byId('replay');
        const syncStart = () => {
            start.disabled = !primary();
            start.querySelector('.btn-label').textContent = replay.hidden ? 'START' : 'PLAY AGAIN';
            start.setAttribute('aria-label', replay.hidden ? 'Start game' : 'Play again');
        };
        const startObserver = new MutationObserver(syncStart);
        for (const node of [byId('start'), byId('replay'), byId('controls-dialog')]) {
            startObserver.observe(node, { attributes: true, attributeFilter: ['disabled', 'hidden', 'open'] });
        }
        autoPanelState(false);
        syncStart();
        function autoPanelState(active) {
            for (const { source, node } of controls) if (source !== 'start') node.disabled = !active;
        }
        const releases = [];
        for (const { source, node } of controls) {
            let pointer = null;
            const keys = new Set();
            const feedback = source === 'fire' ? pressFeedback(node) : undefined;
            const stickAt = (x, y) => {
                emit(source, { x, y });
            };
            const held = (value, immediate) => {
                node.toggleAttribute('data-held', value);
                feedback?.(value, immediate);
                if (source !== 'stick' && source !== 'start') emit(source, { held: value });
            };
            const reset = (immediate = true) => {
                const id = pointer;
                pointer = null;
                keys.clear();
                held(false, immediate);
                if (source === 'stick') stickAt(0, 0);
                if (id != null && node.hasPointerCapture(id)) node.releasePointerCapture(id);
            };
            releases.push(reset);
            const moveStick = event => {
                const rect = node.getBoundingClientRect();
                const axis = value => Math.abs(value) < .22 ? 0 : Math.sign(value);
                stickAt(axis((event.clientX - rect.left) / rect.width * 2 - 1),
                    axis((event.clientY - rect.top) / rect.height * 2 - 1));
            };
            node.addEventListener('pointerdown', event => {
                if (event.button !== 0 || node.disabled || pointer != null || keys.size) return;
                event.preventDefault();
                pointer = event.pointerId;
                node.setPointerCapture(pointer);
                held(true);
                if (source === 'stick') moveStick(event);
            });
            node.addEventListener('pointermove', event => {
                if (source === 'stick' && event.pointerId === pointer) moveStick(event);
            });
            for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
                node.addEventListener(type, event => {
                    if (event.pointerId !== pointer) return;
                    const rect = node.getBoundingClientRect();
                    const inside = event.clientX >= rect.left && event.clientX <= rect.right
                        && event.clientY >= rect.top && event.clientY <= rect.bottom;
                    reset(type !== 'pointerup');
                    if (source === 'start' && type === 'pointerup' && inside) primary()?.click();
                });
            }
            const fromKeys = () => {
                const directions = [...keys].map(key => arrows[key]);
                stickAt(Math.sign(directions.reduce((sum, pair) => sum + pair[0], 0)),
                    Math.sign(directions.reduce((sum, pair) => sum + pair[1], 0)));
            };
            node.addEventListener('keydown', event => {
                const used = source === 'stick' ? Object.hasOwn(arrows, event.key) : [' ', 'Enter'].includes(event.key);
                if (!used || node.disabled) return;
                event.preventDefault();
                event.stopPropagation();
                if (event.repeat || pointer != null || source !== 'stick' && keys.size) return;
                keys.add(event.key);
                held(true);
                if (source === 'stick') fromKeys();
            });
            node.addEventListener('keyup', event => {
                if (!keys.has(event.key)) return;
                event.preventDefault();
                event.stopPropagation();
                keys.delete(event.key);
                if (source === 'stick') fromKeys();
                if (!keys.size) held(false);
                if (source === 'start') primary()?.click();
            });
            node.addEventListener('click', event => {
                if (event.detail !== 0 || node.disabled || pointer != null || keys.size) return;
                if (source === 'start') primary()?.click();
                else if (source !== 'stick') {
                    held(true);
                    held(false);
                }
            });
            node.addEventListener('blur', () => {
                if (keys.size) reset();
                else if (pointer == null) feedback?.(false, true);
            });
        }
        const resetDeck = () => releases.forEach(release => release());
        window.addEventListener('rvdash:panelreset', resetDeck);
        window.addEventListener('rvdash:panelstate', ({ detail }) => {
            if (!detail) resetDeck();
            autoPanelState(detail);
            syncStart();
        });
        window.addEventListener('blur', resetDeck);
        window.addEventListener('pagehide', resetDeck);
        document.addEventListener('visibilitychange', () => { if (document.hidden) resetDeck(); });
        const removalObserver = new MutationObserver(() => {
            if (!deck.isConnected || controls.some(({ node }) => !node.isConnected)) resetDeck();
        });
        removalObserver.observe(deck.parentElement, { childList: true });
        removalObserver.observe(deck.querySelector('.deck-controls'), { childList: true });
    } else {
        deck.querySelector('.deck-controls').replaceChildren();
        deck.setAttribute('aria-hidden', 'true');
    }

    const status = byId('cabinet-status');
    const syncState = () => {
        const label = !byId('result').hidden ? 'Game over'
            : document.body.classList.contains('is-paused') ? 'Paused'
                : document.body.classList.contains('in-flight') ? 'Playing'
                    : byId('start').disabled ? 'Loading' : 'Ready';
        if (status.textContent !== label) {
            status.textContent = label;
            status.parentElement.dataset.state = label.toLowerCase();
        }
    };
    const observer = new MutationObserver(syncState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(byId('start'), { attributes: true, attributeFilter: ['disabled'] });
    observer.observe(byId('result'), { attributes: true, attributeFilter: ['hidden'] });
    syncState();

    const help = byId('controls-dialog');
    const guide = document.querySelector('.track-guide summary');
    for (const eventName of ['keydown', 'keyup']) {
        guide.addEventListener(eventName, event => {
            if (event.code === 'Space') event.stopPropagation();
        });
    }
    byId('show-help').addEventListener('click', () => {
        if (document.body.classList.contains('in-flight')) byId('pause').click();
        help.showModal();
    });

    const fullscreen = byId('fullscreen');
    const utilityStatus = byId('utility-status');
    const attract = byId('fullscreen-attract');
    const start = byId('start');
    const mayShowAttract = fullscreenInvitation();
    const maybeShowAttract = () => {
        if (!start.disabled && !start.hidden && !document.fullscreenElement
            && document.fullscreenEnabled !== false && mayShowAttract()) attract.hidden = false;
    };
    new MutationObserver(maybeShowAttract).observe(start, { attributes: true, attributeFilter: ['disabled', 'hidden'] });
    maybeShowAttract();
    byId('dismiss-fullscreen').addEventListener('click', () => {
        attract.hidden = true;
        fullscreen.focus({ preventScroll: true });
    });
    for (const id of ['accept-fullscreen', 'fullscreen-nudge']) {
        byId(id).addEventListener('click', () => fullscreen.click());
    }
    let fullscreenPending = false;
    fullscreen.addEventListener('click', async () => {
        if (fullscreenPending) return;
        fullscreenPending = true;
        try {
            if (document.fullscreenElement === main) await document.exitFullscreen();
            else await main.requestFullscreen();
            utilityStatus.hidden = true;
        } catch {
            utilityStatus.textContent = 'Fullscreen is unavailable here.';
            utilityStatus.hidden = false;
        } finally {
            fullscreenPending = false;
        }
    });
    document.addEventListener('fullscreenchange', () => {
        const expanded = document.fullscreenElement === main;
        fullscreen.setAttribute('aria-pressed', String(expanded));
        fullscreen.querySelector('.btn-label').textContent = expanded ? 'Exit fullscreen' : 'Fullscreen';
        if (expanded) {
            mayShowAttract();
            attract.hidden = true;
            fullscreen.focus({ preventScroll: true });
        }
    });

    const intro = byId('mascot-intro');
    const skip = byId('skip-intro');
    let introTimer;
    const closeIntro = () => {
        clearTimeout(introTimer);
        if (intro.hidden) return;
        if (document.activeElement === skip) {
            const start = byId('start');
            (start.disabled ? byId('show-help') : start).focus({ preventScroll: true });
        }
        intro.hidden = true;
    };
    skip.addEventListener('click', closeIntro);
    skip.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeIntro();
    });
    new MutationObserver(() => {
        if (document.body.classList.contains('in-flight')) {
            attract.hidden = true;
            closeIntro();
        }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    motion.addEventListener('change', () => {
        if (!motion.matches) return;
        closeIntro();
    });

    const art = window.RV_DASH_EMBEDDED || {};
    if (!motion.matches && art['taggy-idle-right']) {
        byId('intro-taggy').src = art['taggy-idle-right'];
        const spray = intro.querySelector('.coin-spray');
        for (let i = 0; i < 5; i++) {
            const coin = document.createElement('i');
            coin.style.setProperty('--dx', ((i - 2) * 39) + 'px');
            coin.style.setProperty('--dy', (-26 - i % 3 * 17) + 'px');
            coin.style.setProperty('--delay', (1.18 + i * 0.105) + 's');
            if (art.coin) coin.style.backgroundImage = 'url(' + art.coin + ')';
            else coin.classList.add('fallback');
            spray.append(coin);
        }
        intro.hidden = false;
        introTimer = setTimeout(closeIntro, 3200);
    }
})();
