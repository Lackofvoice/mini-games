# Local and deployment instructions

The Worker uses one KV namespace with separate rv-dash and lot-hero boards. Each stores the top 25 scores, and GET exposes ten. Equal scores keep arrival order. Reads expose rank, three arcade initials, score and UTC date. Use fictional initials. This arcade board validates submissions but cannot prove a browser score was earned.

## Test locally

Run `node --test leaderboard-worker/worker.test.mjs` from the repository root. To use the dependency-free mock, run `node leaderboard-worker/mock-leaderboard-server.mjs`. It runs the same Worker handler with in-memory KV. Browser reload keeps the data while the mock process is running. Serve the game through `python -m http.server 8000 --bind 127.0.0.1` or open it through file mode. In your local leaderboard-config.js, set LEADERBOARD_URL to the mock base URL for the test. Restore the empty config afterwards.

## Jay deploy steps

1. Install a supported Node.js LTS release if needed. Open a terminal inside leaderboard-worker.
2. Run `npm install` and copy wrangler.toml.example to wrangler.toml. Git ignores this local file. For local Wrangler testing only, use a dummy namespace identifier if Wrangler requires one, then run `npx wrangler dev --local`.
3. When you are ready for the real deployment, run `npx wrangler login`, then `npx wrangler kv namespace create LEADERBOARD`.
4. Paste the returned namespace ID into your local wrangler.toml. Keep the config, account identifiers and secrets out of Git.
5. Run `npx wrangler secret put IP_SALT` and enter a locally generated random secret. A missing salt uses unsalted SHA-256 and emits no log. Raw IPs are never stored.
6. Run `npx wrangler deploy` and paste the reported workers.dev base URL into leaderboard-config.js.

CORS lists both dealership origins, raw.githack.com for pinned play links, and four local origins in ORIGINS in worker.mjs. File mode can use the local mock. The live Worker does not accept the file origin.

## Limits and score caps

Cloudflare currently documents 100,000 daily KV reads, 1,000 daily KV writes, 1 GB storage and one write per second to the same key. Check [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/) and [KV limits](https://developers.cloudflare.com/kv/platform/limits/) before deploying. GET reads one key. POST reads up to five rate slots and writes one short-lived slot per counted attempt. It writes the board only for a qualifying score. Successful qualifying submissions can therefore consume two writes. No paid service is required by this design.

The limiter uses five slots per hashed IP across both games. Each slot expires ten minutes after its attempt. KV is eventually consistent, so simultaneous submissions can race on limiter slots or overwrite a board update. A burst of qualifying writes to a single board can encounter the KV same-key write limit and return unavailable. These are tradeoffs of a small KV-only board.

RV Dash runs indefinitely. At maximum speed, one hour covers at most 230 × 3,600 = 828,000 logical px, worth 41,400 distance points. With minimum pattern spacing of 590 px, at most 1,404 patterns can each grant up to 50 pickup points, 5 near-miss points and 25 ordinary enemy points. An additional conservative 56 boss bonuses at 250 points bring the loose upper bound to 167,720 points per hour. The cap of 100,000 allows substantial headroom over a 30-minute run under this generous estimate (about 84,000). It intentionally rejects sufficiently long runs, since there is no finite perfect-run maximum. Lot Hero has a provisional 100,000 cap pending a real game and tuning. To wire it later, use `RVLeaderboard.attach('lot-hero')` with the same panel and call its lifecycle methods. Its local best stays separate.
