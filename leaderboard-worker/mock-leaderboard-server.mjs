import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { handle } from './worker.mjs';
import { memoryKV } from './memory-kv.mjs';

const env = { LEADERBOARD: memoryKV() };
const port = Number(process.env.PORT || 8787);
createServer(async (incoming, outgoing) => {
    try {
        const init = { method: incoming.method, headers: incoming.headers };
        if (!['GET', 'HEAD'].includes(incoming.method)) {
            init.body = Readable.toWeb(incoming);
            init.duplex = 'half';
        }
        const request = new Request('http://localhost:' + port + incoming.url, init);
        const response = await handle(request, env, { ip: incoming.socket.remoteAddress, allowFile: true });
        outgoing.writeHead(response.status, Object.fromEntries(response.headers));
        outgoing.end(await response.text());
    } catch {
        outgoing.writeHead(400, { 'Content-Type': 'application/json' });
        outgoing.end(JSON.stringify({ message: 'Invalid request' }));
    }
}).listen(port, '127.0.0.1', () => console.log('Local leaderboard mock ready'));
