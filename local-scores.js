(() => {
    'use strict';

    const LOCAL_SCORE_KEY = 'rv-dash-local-scores-v1';
    const LIMIT = 10;
    const MAX_SCORE = 100000;

    function validScore(entry) {
        if (!entry || typeof entry !== 'object') return false;
        const { initials, score, level } = entry;
        return typeof initials === 'string' && /^[A-Z]{3}$/.test(initials)
            && Number.isInteger(score) && score >= 1 && score <= MAX_SCORE
            && Number.isSafeInteger(level) && level >= 1;
    }

    // Equal scores retain arrival order, including when a record is reloaded.
    function insert(rows, entry) {
        const rank = rows.findIndex(row => row.score < entry.score);
        rows.splice(rank < 0 ? rows.length : rank, 0, entry);
        if (rows.length > LIMIT) rows.pop();
    }

    function read(storage) {
        let raw;
        try {
            raw = storage().getItem(LOCAL_SCORE_KEY);
        } catch {
            return { rows: [], accessible: false };
        }
        const rows = [];
        try {
            const decoded = raw && raw.length <= 32768 ? JSON.parse(raw) : [];
            if (Array.isArray(decoded)) {
                for (const entry of decoded) {
                    if (!entry || !validScore(entry) || typeof entry.date !== 'string') continue;
                    const time = Date.parse(entry.date);
                    if (!Number.isFinite(time) || new Date(time).toISOString() !== entry.date) continue;
                    const { initials, score, level, date } = entry;
                    insert(rows, { initials, score, level, date });
                }
            }
        } catch {
            // Ignore corrupted data. A later verified save can replace it.
        }
        return { rows, accessible: true };
    }

    function save(storage, data, now = new Date()) {
        if (!validScore(data)) return { kind: 'invalid' };
        const { rows, accessible } = read(storage);
        if (!accessible) return { kind: 'storage' };
        const { initials, score, level } = data;
        const entry = { initials, score, level, date: now.toISOString() };
        insert(rows, entry);
        const rank = rows.indexOf(entry) + 1;
        if (!rank) return { kind: 'outside-top' };
        try {
            const value = JSON.stringify(rows);
            storage().setItem(LOCAL_SCORE_KEY, value);
            if (storage().getItem(LOCAL_SCORE_KEY) !== value) return { kind: 'storage' };
        } catch {
            return { kind: 'storage' };
        }
        return { kind: 'saved', rank, rows };
    }

    const api = { LOCAL_SCORE_KEY, LIMIT, MAX_SCORE, read, save };
    if (typeof module === 'object' && module.exports) module.exports = api;
    else window.RVDashLocalScores = api;
})();
