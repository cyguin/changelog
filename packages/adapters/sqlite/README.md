# @cyguin/changelog-adapter-sqlite

SQLite storage adapter for `@cyguin/changelog`.

## what it is

Drop-in SQLite backend. Runs in WAL mode. Zero config — just pass a `better-sqlite3` database instance.

## install

```bash
npm install @cyguin/changelog-adapter-sqlite better-sqlite3
```

## use

```ts
import { SQLiteAdapter } from '@cyguin/changelog-adapter-sqlite'
import Database from 'better-sqlite3'

const db = new Database('./changelog.db')
const adapter = new SQLiteAdapter({ db })
await adapter.runMigrations()

export { adapter }
```

## links

[Full changelog monorepo →](https://github.com/cyguin/changelog)

[Full docs →](https://github.com/cyguin/changelog#readme)
