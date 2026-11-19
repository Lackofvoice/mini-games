(() => {
    'use strict';

    // One shared light-change clock. Even simultaneous changes count as one
    // event, and missed ticks never catch up in a burst.
    const STEP_MS = 400;
    const PATTERN_STEPS = 15;
    const PATTERNS = ['flicker', 'chase', 'pulse', 'alternate', 'fan', 'strobe'];

    function beamFrame(pattern, step, beam, order, random) {
        const dim = 0.08;
        const lit = 0.62;
        let opacity = 0;
        let angle = 0;
        if (step < PATTERN_STEPS) {
            switch (pattern) {
            case 'flicker':
                opacity = random() < 0.45 ? dim : lit;
                break;
            case 'chase':
                opacity = beam === order[step % order.length] ? lit : dim;
                break;
            case 'pulse':
                opacity = 0.36 - 0.26 * Math.cos(step * Math.PI / 3);
                break;
            case 'alternate':
                opacity = (order.indexOf(beam) + Math.floor(step / 2)) % 2 === 0 ? lit : dim;
                break;
            case 'fan':
                opacity = 0.46;
                angle = (beam % 2 === 0 ? 1 : -1) * 16 * Math.sin(step * Math.PI / 7);
                break;
            case 'strobe':
                opacity = [4, 6, 8].includes(step) ? 0.48 : dim;
                break;
            }
        }
        return { opacity, angle };
    }

    function createClock() {
        let nextTick = 0;
        let lastChange = -Infinity;
        return now => {
            if (now - lastChange < STEP_MS) return null;
            lastChange = now;
            const step = nextTick % (PATTERN_STEPS + 1);
            const pattern = PATTERNS[Math.floor(nextTick / (PATTERN_STEPS + 1))];
            nextTick = (nextTick + 1) % (PATTERNS.length * (PATTERN_STEPS + 1));
            return { pattern, step };
        };
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = { beamFrame, createClock };
        return;
    }

    const atmosphere = document.querySelector('.arcade-atmosphere');
    if (!atmosphere) return;

    const beams = [...atmosphere.querySelectorAll('.laser')].slice(0, 4);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const small = matchMedia('(max-width: 819px)');
    const clock = createClock();
    let request = null;

    function animate(now) {
        const frame = clock(now);
        if (frame) {
            const order = small.matches ? [0, 1] : [0, 2, 3, 1];
            for (const index of order) {
                const { opacity, angle } = beamFrame(frame.pattern, frame.step, index, order, Math.random);
                beams[index].style.opacity = opacity;
                beams[index].style.transform = 'rotate(' + angle + 'deg)';
            }
        }
        request = requestAnimationFrame(animate);
    }

    function syncMotion() {
        atmosphere.toggleAttribute('data-effects-hidden', document.hidden);
        if (document.hidden || reduced.matches) {
            if (request !== null) cancelAnimationFrame(request);
            request = null;
        } else if (request === null) {
            request = requestAnimationFrame(animate);
        }
    }

    document.addEventListener('visibilitychange', syncMotion);
    reduced.addEventListener('change', syncMotion);
    syncMotion();
})();
