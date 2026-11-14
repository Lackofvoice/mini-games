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

    for (const id of ['start', 'replay']) {
        const button = byId(id);
        const label = document.createElement('span');
        label.className = 'primary-label';
        label.textContent = button.textContent;
        label.dataset.text = label.textContent;
        button.replaceChildren(label);
    }

    const glyphs = '0123456789+#/!';
    const stopDecoders = [];
    for (const id of ['sound', 'fullscreen', 'show-help']) {
        const button = byId(id);
        let timer = null;
        const stop = () => {
            clearInterval(timer);
            timer = null;
            delete button.dataset.decode;
        };
        const decode = () => {
            stop();
            if (motion.matches || button.disabled) return;
            const label = button.textContent;
            let tick = 0;
            timer = setInterval(() => {
                const settled = Math.floor(tick++ * label.length / 9);
                if (settled >= label.length || button.textContent !== label) return stop();
                button.dataset.decode = [...label].map((char, index) =>
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
