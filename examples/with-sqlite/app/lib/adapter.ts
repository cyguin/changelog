import Database from 'better-sqlite3'
import { SQLiteAdapter } from '@cyguin/changelog-adapter-sqlite'

let adapter: SQLiteAdapter | null = null

function getAdapter() {
  if (adapter) return adapter
  const db = new Database('changelog.db')
  adapter = new SQLiteAdapter({ db })
  adapter.runMigrations()
  return adapter
}

export { getAdapter }
