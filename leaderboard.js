(() => {
    'use strict';
    const endpoint = () => String(window.LEADERBOARD_URL || '').trim().replace(/\/+$/, '');

    async function request(game, body) {
        const base = endpoint();
        if (!base) return { ok: false, kind: 'unavailable', message: 'Online board not set up yet' };
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const unknown = { ok: false, kind: 'ambiguous', message: 'Online result unknown. This run will not be sent again.' };
        try {
            const response = await fetch(base + '/api/leaderboard/' + encodeURIComponent(game), {
                method: body ? 'POST' : 'GET',
                credentials: 'omit', signal: controller.signal, redirect: 'error',
                ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
            });
            if (!response.ok) {
                if (body && response.status === 400) {
                    return { ok: false, kind: 'rejected', message: 'Online board rejected the initials or score.' };
                }
                if (body && response.status === 429) {
                    return { ok: false, kind: 'rejected', message: 'Online board rejected the attempt due to its rate limit.' };
                }
                if (body && ![401, 403, 404, 405, 413, 415, 422].includes(response.status)) return unknown;
                return { ok: false, kind: 'unavailable', message: 'Online board returned HTTP ' + response.status + '.' };
            }
            const data = await response.json();
            const valid = body ? data && (data.rank === null || Number.isInteger(data.rank) && data.rank >= 1 && data.rank <= 25)
                : Array.isArray(data) && data.length <= 10 && data.every((row, index) => row?.rank === index + 1
                    && /^[A-Z]{3}$/.test(row.initials) && Number.isInteger(row.score) && row.score > 0
                    && typeof row.date === 'string');
            if (valid) return { ok: true, data };
            return body ? unknown : { ok: false, kind: 'unavailable', message: 'Online rankings were invalid.' };
        } catch {
            return body ? unknown : { ok: false, kind: 'unavailable', message: 'Could not read the online board.' };
        } finally {
            clearTimeout(timeout);
        }
    }

    const getBoard = (game) => request(game);
    const submitScore = (game, initials, score) => request(game, { initials, score });
    const COMPACT_BOARD_LIMIT = 5;

    function attach(game, onVisibilityChange = () => {}) {
        const byId = (id) => document.getElementById(id);
        const panel = byId('leaderboard');
        const form = byId('initials-form');
        const initials = byId('initials');
        const submit = byId('submit-score');
        const status = byId('board-status');
        const closeButton = byId('close-board');
        const submitLabel = submit.querySelector('.btn-label');
        const sideBoard = byId('side-board');
        const demoBoard = byId('demo-board');
        const viewport = window.visualViewport;
        let active = true;
        let score = 0;
        let level = 1;
        let run = { submitted: false, pending: false };
        let version = 0;
        let opener;
        let positionListeners;
        let snapshot;
        let boardLoad;
        let highlight;

        const storage = () => window.localStorage;
        const local = window.RVDashLocalScores;

        function localSnapshot(message = '', records) {
            const data = records ? { rows: records, accessible: true } : local.read(storage);
            const rows = data.rows.map((row, index) => ({ ...row, rank: index + 1 }));
            const detail = data.accessible ? (rows.length ? '' : 'No local scores yet.') : 'Device storage is unavailable.';
            return { source: 'local', rows, message: [message, detail].filter(Boolean).join(' ') };
        }

        function publish(board) {
            snapshot = board;
            const rows = board.rows.slice(0, COMPACT_BOARD_LIMIT);
            byId('side-board-title').textContent = board.source === 'local' ? 'Local scores' : 'Leaderboard';
            renderRows(byId('side-board-rows'), rows, highlight?.source === board.source ? highlight : null);
            byId('side-board-table').hidden = !rows.length;
            byId('side-board-status').textContent = board.message;
            byId('side-board-status').hidden = Boolean(rows.length);
        }

        function renderRows(target, entries, emphasis = null) {
            const rows = entries.map(({ rank, initials: name, score: points }) => {
                const row = document.createElement('tr');
                if (rank === emphasis?.rank && name === emphasis.initials && points === emphasis.score) {
                    row.classList.add('board-new-entry');
                }
                for (const value of [rank, name, points]) {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.append(cell);
                }
                return row;
            });
            target.replaceChildren(...rows);
        }

        function loadBoard() {
            boardLoad ??= getBoard(game).then(result => {
                return result.ok
                    ? { source: 'official', rows: result.data, message: result.data.length ? '' : 'No scores yet, be first' }
                    : localSnapshot(result.message);
            }).finally(() => { boardLoad = null; });
            return boardLoad;
        }

        function position() {
            const field = byId('playfield').getBoundingClientRect();
            const left = viewport?.offsetLeft ?? 0;
            const top = viewport?.offsetTop ?? 0;
            const width = viewport?.width ?? window.innerWidth;
            const height = viewport?.height ?? window.innerHeight;
            const boxWidth = Math.min(420, Math.max(300, field.width), width - 24);
            const centerX = Math.max(left + 12 + boxWidth / 2,
                Math.min(field.left + field.width / 2, left + width - 12 - boxWidth / 2));
            const visibleTop = Math.max(top, field.top);
            const visibleBottom = Math.min(top + height, field.bottom);
            const useField = visibleBottom - visibleTop >= 240;
            const available = useField ? visibleBottom - visibleTop : height;
            const centerY = useField ? (visibleTop + visibleBottom) / 2 : top + height / 2;
            panel.style.setProperty('--board-left', centerX + 'px');
            panel.style.setProperty('--board-top', centerY + 'px');
            panel.style.setProperty('--board-width', boxWidth + 'px');
            panel.style.setProperty('--board-height', available - 24 + 'px');
        }

        function close(restoreFocus) {
            if (!panel.open) return;
            if (!form.hidden) run.draft = initials.value;
            if (restoreFocus) run.dismissed = true;
            version++;
            positionListeners?.abort();
            panel.close();
            form.hidden = true;
            submit.disabled = false;
            onVisibilityChange(false);
            if (restoreFocus && opener?.getClientRects().length) opener.focus({ preventScroll: true });
        }

        async function refresh(current, offerScore, confirmation, presentation) {
            form.hidden = true;
            byId('board-rows').replaceChildren();
            status.textContent = endpoint() ? 'Loading scores…' : 'Online board not set up yet';
            const board = await loadBoard();
            if (presentation) {
                // A confirmed official submission must not blend with device rankings.
                if (board.source !== 'official') {
                    if (current === version && !active && panel.open) {
                        const feedback = confirmation + ' Official rankings could not be refreshed.';
                        if (snapshot?.source === 'official') present(snapshot, feedback, false);
                        else status.textContent = feedback;
                    }
                    return;
                }
                if (run.presentation === presentation) {
                    publish(board);
                    presentation.ready = true;
                }
            }
            if (current !== version || active || !panel.open) return;
            if (!presentation) publish(board);
            present(board, confirmation, offerScore);
        }

        function present(board, feedback, offerScore) {
            byId('board-title').textContent = board.source === 'local' ? 'Local scores' : 'Leaderboard';
            renderRows(byId('board-rows'), board.rows);
            status.textContent = feedback ?? board.message;
            if (!offerScore) return;
            run.source = board.source;
            if (board.source === 'local') run.localBoard = board;
            submitLabel.textContent = board.source === 'local' ? 'Save locally' : 'Submit';
            if (!run.submitted && !run.pending && score > 0
                && (board.source === 'official' || score <= local.MAX_SCORE)
                && (board.rows.length < 10 || score > board.rows.at(-1).score)) {
                initials.value = run.draft ?? '';
                if (run.draft == null) {
                    try { initials.value = localStorage.getItem('arcade-initials:' + game) || ''; } catch {}
                }
                form.hidden = false;
            }
        }

        function open(button, offerScore) {
            if (active || panel.open) return;
            opener = button;
            position();
            panel.showModal();
            byId('board-title').focus({ preventScroll: true });
            onVisibilityChange(true);
            positionListeners = new AbortController();
            for (const target of [window, viewport]) {
                target?.addEventListener('resize', position, { signal: positionListeners.signal });
                target?.addEventListener('scroll', position, { signal: positionListeners.signal });
            }
            const current = ++version;
            if (offerScore && run.remoteUnknown && !run.localBoard) {
                run.localBoard = localSnapshot();
                run.localFeedback = 'Online result unknown. You can save a separate local copy.';
                publish(run.localBoard);
                present(run.localBoard, run.localFeedback, true);
            } else if (offerScore && run.source === 'local') {
                present(run.localBoard, run.localFeedback, true);
            } else {
                byId('board-title').textContent = 'Leaderboard';
                void refresh(current, offerScore);
            }
        }

        for (const id of ['view-scores-start', 'view-scores-result']) {
            const button = byId(id);
            button.addEventListener('click', () => void open(button, id === 'view-scores-result'));
        }
        closeButton.addEventListener('click', () => close(true));
        byId('skip-score').addEventListener('click', () => close(true));
        panel.addEventListener('cancel', event => {
            event.preventDefault();
            close(true);
        });
        panel.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                close(true);
            } else if (event.key === 'Tab') {
                const buttons = [...panel.querySelectorAll('button:not(:disabled), input:not(:disabled)')]
                    .filter(node => node.getClientRects().length);
                const index = buttons.indexOf(document.activeElement);
                const next = event.shiftKey ? (index <= 0 ? buttons.length - 1 : index - 1) : (index + 1) % buttons.length;
                event.preventDefault();
                buttons[next].focus();
            }
        });
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (active || !panel.open || form.hidden || run.submitted || run.pending || submit.disabled) return;
            const name = initials.value.toUpperCase();
            if (!/^[A-Z]{3}$/.test(name)) {
                status.textContent = 'Enter three letters';
                initials.focus();
                return;
            }
            const current = version;
            const attempt = run;
            if (attempt.source === 'local') {
                const result = local.save(storage, { initials: name, score, level });
                if (result.kind !== 'saved') {
                    attempt.localFeedback = result.kind === 'outside-top' ? 'This score is outside the local Top 10.'
                        : 'Score ' + score + ' was not saved. Check device storage and try Save locally again.';
                    status.textContent = attempt.localFeedback;
                    return;
                }
                attempt.submitted = true;
                const presentation = { source: 'local', rank: result.rank, initials: name, score, ready: true };
                attempt.presentation = presentation;
                highlight = presentation;
                attempt.localBoard = localSnapshot('', result.rows);
                attempt.localFeedback = 'Saved on this device. Local rank: ' + result.rank + '.'
                    + (attempt.remoteUnknown ? ' Online result unknown.' : '');
                publish(attempt.localBoard);
                present(attempt.localBoard, attempt.localFeedback, false);
                closeButton.focus({ preventScroll: true });
                form.hidden = true;
                return;
            }
            attempt.pending = true;
            submit.disabled = true;
            status.textContent = 'Sending score…';
            const result = await submitScore(game, name, score);
            attempt.pending = false;
            if (result.ok) attempt.submitted = true;
            if (result.kind === 'ambiguous') attempt.remoteUnknown = true;
            if (attempt !== run || active || !panel.open || current !== version) return;
            submit.disabled = false;
            if (!result.ok) {
                attempt.draft = name;
                attempt.localFeedback = result.message + ' You can save a separate local copy.';
                attempt.localBoard = localSnapshot();
                publish(attempt.localBoard);
                form.hidden = true;
                present(attempt.localBoard, attempt.localFeedback, true);
                return;
            }
            try { localStorage.setItem('arcade-initials:' + game, name); } catch {}
            const presentation = { source: 'official', rank: result.data.rank, initials: name, score, ready: false };
            attempt.presentation = presentation;
            highlight = presentation;
            closeButton.focus({ preventScroll: true });
            const confirmation = result.data.rank === null ? 'Not on the board this time' : 'Your rank: ' + result.data.rank;
            await refresh(current, false, confirmation, presentation);
        });
        return {
            ready() {
                active = false;
                sideBoard.hidden = false;
                if (!snapshot) {
                    const initialVersion = version;
                    void loadBoard().then(board => {
                        if (version === initialVersion) publish(board);
                    });
                }
            },
            start(mode) {
                const presentation = mode === 'demo' && run.dismissed && !panel.open ? run.presentation : null;
                run.presentation = null;
                active = true;
                close(false);
                if (mode !== 'demo') run = { submitted: false, pending: false };
                return presentation ?? null;
            },
            showDemoBoard(presentation) {
                if (!presentation.ready || snapshot?.source !== presentation.source || !snapshot.rows.length) {
                    demoBoard.dataset.lastPresentation = 'no-ranked-data';
                    return false;
                }
                delete demoBoard.dataset.lastPresentation;
                byId('demo-board-title').textContent = presentation.source === 'local' ? 'Local scores' : 'Leaderboard';
                renderRows(byId('demo-board-rows'), snapshot.rows.slice(0, COMPACT_BOARD_LIMIT), presentation);
                demoBoard.hidden = false;
                return true;
            },
            hideDemoBoard() { demoBoard.hidden = true; },
            finish(points, reachedLevel = 1) {
                active = false;
                score = points;
                level = reachedLevel;
                run = { submitted: false, pending: false };
                open(byId('replay'), true);
            }
        };
    }

    window.RVLeaderboard = { getBoard, submitScore, attach };
})();
