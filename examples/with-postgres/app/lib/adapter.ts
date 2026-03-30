import { sql } from 'postgres'
import { PostgresAdapter } from '@cyguin/changelog-adapter-postgres'

let adapter: PostgresAdapter | null = null

function getAdapter() {
  if (adapter) return adapter
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  const postgres = sql({ ...connectionString as any })
  adapter = new PostgresAdapter({ sql: postgres })
  adapter.runMigrations()
  return adapter
}

export { getAdapter }
