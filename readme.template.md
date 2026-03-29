# @cyguin/package-name

> one sentence. what it does, not what it is. no marketing.

drop-in [description of the thing] for Next.js. self-hosted. no vendor lock. ships as an npm package.

---

## the deal

[2–4 sentences of honest framing. what problem it solves. who it's for. what it does NOT do.
no bullet lists here. just talk to the reader like they're an engineer.]

example:
> Most snippet libraries either phone home or require you to run a separate service.
> This one drops into your existing Next.js API routes and writes to SQLite or Postgres —
> whatever you already have. If you pull the package, you own the data.

---

## install

```bash
npm install @cyguin/package-name
```

if you're running sqlite:

```bash
npm install better-sqlite3
```

---

## usage

```ts
// one real, working code example that covers 80% of use cases
// no placeholder data if you can avoid it
// make it copy-pasteable

import { createSnipletHandler } from '@cyguin/package-name'

export const { GET, POST } = createSnipletHandler({
  db: 'sqlite',
  dbPath: './data/snips.db',
})
```

that's the quick path. see [configuration](#configuration) for adapters and options.

---

## configuration

```ts
createPackageHandler({
  db: 'sqlite' | 'postgres',       // adapter selection
  dbPath: './data/snips.db',       // sqlite only
  connectionString: process.env.DATABASE_URL, // postgres only
  maxBodySize: 16_000,             // bytes, default 16kb
  allowedOrigins: ['https://yourapp.com'],    // optional CORS whitelist
})
```

| option | type | default | notes |
|---|---|---|---|
| `db` | `sqlite \| postgres` | required | pick one |
| `dbPath` | string | `./data/snips.db` | sqlite path, relative to cwd |
| `connectionString` | string | — | postgres DSN |
| `maxBodySize` | number | `16000` | request body cap in bytes |
| `allowedOrigins` | string[] | `['*']` | CORS origins |

---

## requirements

- Next.js 14+ (App Router)
- Node 18+
- `better-sqlite3` if using SQLite adapter
- `postgres` if using Postgres adapter

---

## adapters

**sqlite** — recommended for single-server deployments and local dev. runs WAL mode by default. no setup beyond a writable path.

**postgres** — for multi-instance or cloud deployments. requires a Postgres DSN. migrations run automatically on first boot via `CREATE TABLE IF NOT EXISTS`.

adding your own: [adapter interface docs](./docs/adapters.md)

---

## self-hosted first

no Cyguin cloud required. this package is the whole product — the API routes, the schema, the read/write logic. you can run it forever without touching our servers.

if you want the hosted dashboard at [changelog.cyguin.com](https://changelog.cyguin.com), that's a separate thing with a separate price. the package is MIT regardless.

---

## hosted tier

| | self-hosted | hosted |
|---|---|---|
| npm package | ✓ | ✓ |
| data ownership | your infra | cyguin cloud |
| dashboard UI | bring your own | included |
| price | free | $[X]/mo |

[changelog.cyguin.com →](https://changelog.cyguin.com)

---

## development

```bash
git clone https://github.com/cyguin-mirror/package-name
cd package-name
npm install
npm run dev       # starts next.js example app
npm test          # vitest
```

PRs are welcome. open an issue first if it's a big change. we don't move fast enough to review speculative refactors.

---

## status

`v0.x` — working but not stable. breaking changes land without ceremony. pin your version.

---

## license

MIT. see [LICENSE](./LICENSE).

---

```
  ______   ______ _   _ ___ _   _ 
 / ___\ \ / / ___| | | |_ _| \ | |
| |    \ V / |  _| | | || ||  \| |
| |___  | || |_| | |_| || || |\  |
 \____| |_| \____|\___/|___|_| \_|

drop-in tools for developers · cyguin.com
```