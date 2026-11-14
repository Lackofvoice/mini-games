import { blockedInitials } from './initials-filter.mjs';

const CAPS = new Map([['rv-dash', 100000], ['lot-hero', 100000]]);
const ORIGINS = new Set([
    'https://www.pricerightrv.com', 'https://pricerightrv.com',
    'https://raw.githack.com',
    'http://localhost:8787', 'http://127.0.0.1:8787',
    'http://localhost:8000', 'http://127.0.0.1:8000'
]);
const WINDOW_SECONDS = 600;
const BODY_LIMIT = 1024;

async function readBody(request) {
    if (Number(request.headers.get('Content-Length')) > BODY_LIMIT) return { status: 413 };
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return { status: 400 };
    const reader = request.body?.getReader();
    if (!reader) return { status: 400 };
    const decoder = new TextDecoder();
    let bytes = 0;
    let body = '';
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > BODY_LIMIT) {
            void reader.cancel().catch(() => {});
            return { status: 413 };
        }
        body += decoder.decode(value, { stream: true });
    }
    try {
        return { data: JSON.parse(body + decoder.decode()) };
    } catch {
        return { status: 400 };
    }
}

async function rateKey(ip, salt) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode((salt || '') + '\0' + ip));
    return 'rate:' + Array.from(new Uint8Array(hash), (n) => n.toString(16).padStart(2, '0')).join('');
}

export async function handle(request, env, { ip = request.headers.get('CF-Connecting-IP') || 'unknown', now = Date.now(), allowFile = false } = {}) {
    const origin = request.headers.get('Origin');
    const allowed = ORIGINS.has(origin) || allowFile && origin === 'null';
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' };
    if (allowed) headers['Access-Control-Allow-Origin'] = origin;
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });

    try {
        const game = new URL(request.url).pathname.match(/^\/api\/leaderboard\/([^/]+)$/)?.[1];
        if (!CAPS.has(game)) return json({ message: 'Board not found' }, 404);
        if (origin !== null && !allowed) return json({ message: 'Origin not allowed' }, 403);
        if (request.method === 'OPTIONS') {
            headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
            headers['Access-Control-Allow-Headers'] = 'Content-Type';
            return json({});
        }
        const kv = env.LEADERBOARD;
        const boardKey = 'board:' + game;
        if (request.method === 'GET') {
            const board = await kv.get(boardKey, 'json') || [];
            return json(board.slice(0, 10).map((entry, index) => ({ rank: index + 1, ...entry })));
        }
        if (request.method !== 'POST') return json({ message: 'Method not allowed' }, 405);

        const { status, data } = await readBody(request);
        if (status === 413) return json({ message: 'Submission too large' }, 413);
        const key = await rateKey(ip, env.IP_SALT);
        const slots = Array.from({ length: 5 }, (_, index) => key + ':' + index);
        const taken = await Promise.all(slots.map((slot) => kv.get(slot)));
        const available = taken.indexOf(null);
        if (available === -1) return json({ message: 'Too many attempts. Try again later.' }, 429);
        const initials = typeof data?.initials === 'string' && /^[A-Za-z]{3}$/.test(data.initials)
            ? data.initials.toUpperCase() : '';
        // Count small POST attempts including rejected initials and non-qualifying scores.
        await kv.put(slots[available], '1', { expirationTtl: WINDOW_SECONDS });
        if (typeof data?.initials === 'string' && blockedInitials(data.initials)) return json({ message: 'Pick different initials' }, 400);
        if (!initials) return json({ message: 'Enter three letters' }, 400);
        const score = data?.score;
        if (!Number.isInteger(score) || score < 1 || score > CAPS.get(game)) return json({ message: 'Score out of range' }, 400);

        const board = await kv.get(boardKey, 'json') || [];
        const index = board.findIndex((entry) => entry.score < score);
        const position = index === -1 ? board.length : index;
        if (position >= 25) return json({ rank: null });
        board.splice(position, 0, { initials, score, date: new Date(now).toISOString() });
        await kv.put(boardKey, JSON.stringify(board.slice(0, 25)));
        return json({ rank: position + 1 }, 201);
    } catch {
        return json({ message: 'Board unavailable' }, 503);
    }
}

export default { fetch(request, env) { return handle(request, env); } };
