# @cyguin/changelog-adapter-postgres

Postgres storage adapter for `@cyguin/changelog`.

## what it is

Drop-in Postgres backend. Connection-string driven. Migrations run automatically on first boot via `CREATE TABLE IF NOT EXISTS`.

## install

```bash
npm install @cyguin/changelog-adapter-postgres postgres
```

## use

```ts
import { PostgresAdapter } from '@cyguin/changelog-adapter-postgres'
import { sql } from 'postgres'

const db = sql(DATABASE_URL)
const adapter = new PostgresAdapter({ db })

export { adapter }
```

## links

[Full changelog monorepo →](https://github.com/cyguin/changelog)

[Full docs →](https://github.com/cyguin/changelog#readme)
