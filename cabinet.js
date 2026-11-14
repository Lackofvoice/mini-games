(() => {
    'use strict';
    const byId = (id) => document.getElementById(id);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const main = document.querySelector('main');
    const games = [
        { id: 'rv-dash', title: 'RV Dash', status: 'active', target: '#start' },
        { id: 'lot-hero', title: 'Lot Hero', status: 'locked', target: null },
        { id: 'coming-soon', title: 'Coming soon', status: 'locked', target: null }
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
    byId('show-help').addEventListener('click', () => {
        if (document.body.classList.contains('in-flight')) byId('pause').click();
        help.showModal();
    });

    const fullscreen = byId('fullscreen');
    const utilityStatus = byId('utility-status');
    fullscreen.addEventListener('click', async () => {
        try {
            if (document.fullscreenElement === main) await document.exitFullscreen();
            else await main.requestFullscreen();
            utilityStatus.hidden = true;
        } catch {
            utilityStatus.textContent = 'Fullscreen is unavailable here.';
            utilityStatus.hidden = false;
        }
    });
    document.addEventListener('fullscreenchange', () => {
        const expanded = document.fullscreenElement === main;
        fullscreen.setAttribute('aria-pressed', String(expanded));
        fullscreen.textContent = expanded ? 'Exit fullscreen' : 'Fullscreen';
    });

    const pushButtons = ['start', 'replay', 'pause', 'sound', 'fullscreen', 'show-help'].map(byId);
    for (const button of pushButtons) {
        const primary = button.id === 'start' || button.id === 'replay';
        const face = document.createElement('span');
        const label = document.createElement('span');
        face.className = 'key-face';
        if (primary) label.className = 'primary-label';
        face.append(label);
        const syncFace = () => {
            if (button.firstElementChild === face) return;
            label.textContent = button.textContent;
            if (primary) label.dataset.text = label.textContent;
            button.replaceChildren(face);
        };
        button.classList.add('cabinet-press');
        syncFace();
        let timer;
        const release = () => {
            clearTimeout(timer);
            delete button.dataset.press;
        };
        const labelObserver = new MutationObserver(() => {
            syncFace();
            if (button.disabled || !button.getClientRects().length) release();
        });
        labelObserver.observe(button, { childList: true, attributes: true, attributeFilter: ['disabled', 'hidden'] });
        button.addEventListener('keydown', (event) => {
            if (event.repeat || button.disabled || !['Enter', ' '].includes(event.key)) return;
            release();
            button.dataset.press = '';
            if (event.key === 'Enter') timer = setTimeout(release, 80);
        });
        button.addEventListener('keyup', (event) => {
            if (event.key === ' ') release();
        });
        for (const event of ['blur', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, release);
        window.addEventListener('blur', release);
    }

    const glyphs = '0123456789+#/!';
    const stopDecoders = [];
    for (const id of ['sound', 'fullscreen', 'show-help']) {
        const button = byId(id);
        const face = button.querySelector('.key-face');
        let timer = null;
        const stop = () => {
            clearInterval(timer);
            timer = null;
            delete face.dataset.decode;
        };
        const decode = () => {
            stop();
            if (motion.matches || button.disabled) return;
            const label = button.textContent;
            let tick = 0;
            timer = setInterval(() => {
                const settled = Math.floor(tick++ * label.length / 9);
                if (settled >= label.length || button.textContent !== label) return stop();
                face.dataset.decode = [...label].map((char, index) =>
                    index < settled || char === ' ' ? char : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
            }, 32);
        };
        button.addEventListener('pointerenter', decode);
        button.addEventListener('pointerleave', stop);
        button.addEventListener('focus', decode);
        button.addEventListener('blur', stop);
        button.addEventListener('click', stop);
        stopDecoders.push(stop);
    }

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
        if (document.body.classList.contains('in-flight')) closeIntro();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    motion.addEventListener('change', () => {
        if (!motion.matches) return;
        closeIntro();
        stopDecoders.forEach((stop) => stop());
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
