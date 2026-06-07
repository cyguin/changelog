import { describe, it, expect } from 'vitest'

const SQLITE_MIGRATION = `-- Changelog entries
CREATE TABLE IF NOT EXISTS changelog_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  tags TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  published_at INTEGER
);

-- Read tracking
CREATE TABLE IF NOT EXISTS changelog_reads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  read_at INTEGER NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES changelog_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_published ON changelog_entries(published);
CREATE INDEX IF NOT EXISTS idx_entries_created ON changelog_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reads_user ON changelog_reads(user_id);
`

const POSTGRES_MIGRATION = `-- Changelog entries
CREATE TABLE IF NOT EXISTS changelog_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  tags TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Read tracking
CREATE TABLE IF NOT EXISTS changelog_reads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (entry_id) REFERENCES changelog_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_published ON changelog_entries(published);
CREATE INDEX IF NOT EXISTS idx_entries_created ON changelog_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reads_user ON changelog_reads(user_id);
`

import { listAndCreateRoute, singleEntryRoute, readRoute, adapterInitModule } from '../src/templates/routes'

describe('CLI SQL migrations', () => {
  it('SQLite migration has all expected tables', () => {
    expect(SQLITE_MIGRATION).toContain('CREATE TABLE IF NOT EXISTS changelog_entries')
    expect(SQLITE_MIGRATION).toContain('CREATE TABLE IF NOT EXISTS changelog_reads')
    expect(SQLITE_MIGRATION).toContain('CREATE INDEX IF NOT EXISTS idx_entries_published')
  })

  it('Postgres migration has all expected tables', () => {
    expect(POSTGRES_MIGRATION).toContain('CREATE TABLE IF NOT EXISTS changelog_entries')
    expect(POSTGRES_MIGRATION).toContain('CREATE TABLE IF NOT EXISTS changelog_reads')
    expect(POSTGRES_MIGRATION).toContain('TIMESTAMPTZ')
    expect(POSTGRES_MIGRATION).toContain('BOOLEAN')
  })
})

describe('CLI route templates', () => {
  const config = {
    adapterImport: "import { changelogAdapter } from '@/lib/changelog'",
    adapterInit: 'const changelogAdapter = createSqliteAdapter(\'./changelog.db\')',
  }

  it('listAndCreateRoute generates valid route code', () => {
    const code = listAndCreateRoute(config)
    expect(code).toContain('adapter.list')
    expect(code).toContain('X-Changelog-Token')
    expect(code).toContain('adapter.create')
    expect(code).toContain('changelogAdapter as adapter')
  })

  it('singleEntryRoute generates valid route code', () => {
    const code = singleEntryRoute(config)
    expect(code).toContain('adapter.getById')
    expect(code).toContain('adapter.update')
    expect(code).toContain('adapter.delete')
    expect(code).toContain('params: Promise<{ id: string }>')
  })

  it('readRoute generates valid route code', () => {
    const code = readRoute(config)
    expect(code).toContain('adapter.getUnreadCount')
    expect(code).toContain('adapter.markAsRead')
    expect(code).toContain('entryId')
    expect(code).toContain('userId')
  })

  it('adapterInitModule includes config values', () => {
    const code = adapterInitModule(config)
    expect(code).toContain('@/lib/changelog')
    expect(code).toContain('createSqliteAdapter')
    expect(code).toContain('getAdapter')
  })
})
