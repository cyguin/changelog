# @cyguin/changelog


drop-in changelog feed for Next.js. self-hosted. no vendor lock. ships as npm packages.

---

## the deal

Most changelog implementations either require a separate hosted service, lock you into a vendor's data model, or give you nothing but a raw feed and a database table.

This monorepo gives you: TypeScript types, a storage adapter interface (SQLite or Postgres), a CLI that scaffolds your API routes, and React components — so you can ship a changelog feed in an afternoon and own the data forever.

---

## packages

| package | description |
|---|---|
| `@cyguin/changelog-core` | TypeScript types and the `ChangelogAdapter` interface |
| `@cyguin/changelog-adapter-sqlite` | SQLite storage adapter (WAL mode, zero config) |
| `@cyguin/changelog-adapter-postgres` | Postgres storage adapter (connection-string driven) |
| `@cyguin/changelog-cli` | Scaffolds API routes into your Next.js app |
| `@cyguin/changelog-react` | `<ChangelogFeed>` and `<ChangelogBadge>` components |

---

## install

install the packages you need:

```bash
# always needed
npm install @cyguin/changelog-core @cyguin/changelog-react

# choose one adapter
npm install @cyguin/changelog-adapter-sqlite better-sqlite3
npm install @cyguin/changelog-adapter-postgres postgres

# optional: CLI to scaffold API routes
npm install @cyguin/changelog-cli
```

---

## quick start

### 1. scaffold API routes

```bash
npx changelog-init
```

The CLI will ask a few questions and drop a complete API layer into your Next.js app:

```
app/api/changelog/route.ts       GET (list), POST (create)
app/api/changelog/[id]/route.ts GET, PUT, DELETE
app/api/changelog/read/route.ts  GET (unread count), POST (mark read)
```

### 2. wire the adapter

```ts
// app/lib/changelog.ts
import { SQLiteAdapter } from '@cyguin/changelog-adapter-sqlite'
import Database from 'better-sqlite3'

const db = new Database('./changelog.db')
const adapter = new SQLiteAdapter({ db })
await adapter.runMigrations()

export { adapter }
```

### 3. drop in the components

```tsx
// app/page.tsx
import { ChangelogFeed } from '@cyguin/changelog-react'

export default function Home() {
  return (
    <main>
      <ChangelogFeed apiBase="/api/changelog" />
    </main>
  )
}
```

```tsx
// app/layout.tsx (in your navbar)
import { ChangelogBadge } from '@cyguin/changelog-react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav>
          <ChangelogBadge
            apiBase="/api/changelog"
            userId={session.user.id}
            pollInterval={30_000}
          />
          {children}
        </nav>
      </body>
    </html>
  )
}
```

---

## requirements

- Next.js 14+ (App Router)
- Node 18+
- `better-sqlite3` if using the SQLite adapter
- `postgres` if using the Postgres adapter
- React 18+ for the UI components

---

## adapters

**SQLite** — recommended for single-server deployments and local dev. runs WAL mode by default. no setup beyond a writable path.

**Postgres** — for multi-instance or cloud deployments. requires a `DATABASE_URL`. migrations run automatically on first boot via `CREATE TABLE IF NOT EXISTS`.

---

## configuration

```ts
// ChangelogFeed props
<ChangelogFeed
  apiBase="/api/changelog"          // your API base URL
  pageSize={20}                    // entries per page (default 20)
  emptyMessage="Nothing yet"        // empty state text
  className="my-feed"               // optional CSS class
  onEntryClick={(entry) => {}}     // optional click handler
  renderEntry={(entry) => <Custom />} // optional custom renderer
/>
```

```ts
// ChangelogBadge props
<ChangelogBadge
  apiBase="/api/changelog"          // your API base URL
  userId="user_abc123"             // required for auth; uses localStorage if omitted
  pollInterval={30_000}             // ms between polls (default 30s)
  badgeMaxCount={99}                // cap displayed badge number
  triggerClassName=""              // optional CSS class for trigger button
  panelClassName=""                // optional CSS class for panel
  panelWidth={380}                 // panel width in px (default 380)
  onEntryClick={(entry) => {}}     // optional click handler
  renderTrigger={(count) => <Bell />} // optional custom trigger
/>
```

---

## self-hosted first

no Cyguin cloud required. these packages are the whole product — the API routes, the schema, the read/write logic. you can run it forever without touching our servers.

A hosted tier is planned. If you're interested, watch this repo for updates.

---

## development

```bash
git clone https://github.com/cyguin/changelog
cd changelog
npm install

# run tests
npm test

# build all packages
npm run build

# start an example app
cd examples/with-sqlite && npm run dev
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
