(() => {
    'use strict';
    const endpoint = () => String(window.LEADERBOARD_URL || '').trim().replace(/\/+$/, '');

    async function request(game, body) {
        const base = endpoint();
        if (!base) return { ok: false, message: 'Online board not set up yet' };
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        try {
            const response = await fetch(base + '/api/leaderboard/' + encodeURIComponent(game), {
                method: body ? 'POST' : 'GET',
                credentials: 'omit', signal: controller.signal, redirect: 'error',
                ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
            });
            if (response.status === 429) return { ok: false, message: 'Too many attempts. Try again later.' };
            if (response.status === 400 && body) return { ok: false, message: 'Pick different initials or try a different score.' };
            const data = await response.json();
            const valid = body ? data && (data.rank === null || Number.isInteger(data.rank) && data.rank >= 1 && data.rank <= 25)
                : Array.isArray(data) && data.length <= 10 && data.every((row, index) => row?.rank === index + 1
                    && /^[A-Z]{3}$/.test(row.initials) && Number.isInteger(row.score) && row.score > 0
                    && typeof row.date === 'string');
            if (response.ok && valid) return { ok: true, data };
        } catch {
            // Loading scores is optional.
        } finally {
            clearTimeout(timeout);
        }
        return { ok: false, message: 'Board offline, score saved on this device' };
    }

    const getBoard = (game) => request(game);
    const submitScore = (game, initials, score) => request(game, { initials, score });

    function attach(game) {
        const byId = (id) => document.getElementById(id);
        const panel = byId('leaderboard');
        const form = byId('initials-form');
        const initials = byId('initials');
        const submit = byId('submit-score');
        const status = byId('board-status');
        let active = true;
        let score = 0;
        let run = { submitted: false, pending: false };
        let version = 0;
        let opener;

        function close(restoreFocus) {
            version++;
            panel.hidden = true;
            form.hidden = true;
            submit.disabled = false;
            if (restoreFocus && opener?.getClientRects().length) opener.focus();
        }

        async function open(button, offerScore) {
            if (active) return;
            opener = button;
            const current = ++version;
            panel.hidden = false;
            form.hidden = true;
            byId('board-rows').replaceChildren();
            status.textContent = endpoint() ? 'Loading scores…' : 'Online board not set up yet';
            if (!offerScore) byId('board-title').focus();
            const result = await getBoard(game);
            if (current !== version || active) return;
            status.textContent = result.ok ? (result.data.length ? '' : 'No scores yet, be first') : result.message;
            if (result.ok) {
                for (const { rank, initials: name, score: points } of result.data) {
                    const row = document.createElement('tr');
                    for (const value of [rank, name, points]) {
                        const cell = document.createElement('td');
                        cell.textContent = value;
                        row.append(cell);
                    }
                    byId('board-rows').append(row);
                }
            }
            if (offerScore && !run.submitted && !run.pending && endpoint() && score > 0
                && (!result.ok || result.data.length < 10 || score > result.data.at(-1).score)) {
                try { initials.value = localStorage.getItem('arcade-initials:' + game) || ''; } catch {}
                form.hidden = false;
            }
        }

        for (const id of ['view-scores-start', 'view-scores-result']) {
            const button = byId(id);
            button.addEventListener('click', () => void open(button, id === 'view-scores-result'));
        }
        byId('close-board').addEventListener('click', () => close(true));
        byId('skip-score').addEventListener('click', () => close(true));
        document.addEventListener('keydown', (event) => {
            if (!active && !panel.hidden && event.key === 'Escape') {
                event.preventDefault();
                close(true);
            }
        });
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (active || run.submitted || run.pending || submit.disabled) return;
            const name = initials.value.toUpperCase();
            if (!/^[A-Z]{3}$/.test(name)) {
                status.textContent = 'Enter three letters';
                initials.focus();
                return;
            }
            const current = version;
            const attempt = run;
            attempt.pending = true;
            submit.disabled = true;
            status.textContent = 'Sending score…';
            const result = await submitScore(game, name, score);
            attempt.pending = false;
            if (result.ok) attempt.submitted = true;
            if (attempt !== run || active || panel.hidden) return;
            if (current !== version) {
                await open(opener, !attempt.submitted);
                return;
            }
            submit.disabled = false;
            if (!result.ok) {
                status.textContent = result.message;
                return;
            }
            try { localStorage.setItem('arcade-initials:' + game, name); } catch {}
            const expected = version + 1;
            await open(opener, false);
            if (version === expected && !active && !panel.hidden) {
                status.textContent = result.data.rank === null ? 'Not on the board this time'
                    : 'Your rank: ' + result.data.rank;
            }
        });
        return {
            ready() { active = false; },
            start() { active = true; close(false); },
            finish(points) {
                active = false;
                score = points;
                run = { submitted: false, pending: false };
                if (endpoint() && points > 0) void open(byId('view-scores-result'), true);
            }
        };
    }

    window.RVLeaderboard = { getBoard, submitScore, attach };
})();
