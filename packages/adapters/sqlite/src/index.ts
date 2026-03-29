import type {
  ChangelogAdapter,
  Entry,
  CreateEntryInput,
  UpdateEntryInput,
  GetEntriesOptions,
} from '@cyguin/changelog-core'
import { generateCuid2 } from '@cyguin/changelog-core'

interface Sqlite3Database {
  prepare(sql: string): Statement
}

interface Statement {
  run(...params: unknown[]): RunResult
  get(...params: unknown[]): unknown
  all(...params: unknown[]): unknown[]
}

interface RunResult {
  changes: number
  lastInsertRowid: number | bigint
}

interface SqliteAdapterOptions {
  db: Sqlite3Database
}

function mapRowToEntry(row: Record<string, unknown>): Entry {
  return {
    id: row.id as string,
    title: row.title as string,
    body: row.body as string,
    version: row.version as string | null,
    publishedAt: row.published_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    isPublished: Boolean(row.is_published),
    tags: row.tags ? JSON.parse(row.tags as string) : [],
  }
}

export class SQLiteAdapter implements ChangelogAdapter {
  private db: Sqlite3Database

  constructor(options: SqliteAdapterOptions) {
    this.db = options.db
  }

  async runMigrations(): Promise<void> {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS changelog_entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        version TEXT,
        published_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        is_published INTEGER DEFAULT 0,
        tags TEXT DEFAULT '[]'
      )
    `).run()

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS changelog_reads (
        entry_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        read_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (entry_id, user_id)
      )
    `).run()
  }

  async getEntries(opts?: GetEntriesOptions): Promise<Entry[]> {
    const limit = opts?.limit ?? 50
    const offset = opts?.offset ?? 0
    const publishedOnly = opts?.publishedOnly ?? false

    let sql = 'SELECT * FROM changelog_entries'
    const params: unknown[] = []

    if (publishedOnly) {
      sql += ' WHERE is_published = 1'
    }

    sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const rows = this.db.prepare(sql).all(...params) as Record<string, unknown>[]
    return rows.map(mapRowToEntry)
  }

  async getEntry(id: string): Promise<Entry | null> {
    const row = this.db.prepare(
      'SELECT * FROM changelog_entries WHERE id = ?'
    ).get(id) as Record<string, unknown> | undefined

    return row ? mapRowToEntry(row) : null
  }

  async createEntry(data: CreateEntryInput): Promise<Entry> {
    const id = generateCuid2()
    const now = new Date().toISOString()
    const publishedAt = data.publishedAt ?? now
    const tags = JSON.stringify(data.tags ?? [])
    const isPublished = data.isPublished ? 1 : 0

    this.db.prepare(`
      INSERT INTO changelog_entries (id, title, body, version, published_at, created_at, updated_at, is_published, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.title, data.body, data.version ?? null, publishedAt, now, now, isPublished, tags)

    const entry = await this.getEntry(id)
    if (!entry) {
      throw new Error('Failed to create entry')
    }
    return entry
  }

  async updateEntry(id: string, data: UpdateEntryInput): Promise<Entry> {
    const existing = await this.getEntry(id)
    if (!existing) {
      throw new Error(`Entry not found: ${id}`)
    }

    const updates: string[] = []
    const params: unknown[] = []

    if (data.title !== undefined) {
      updates.push('title = ?')
      params.push(data.title)
    }
    if (data.body !== undefined) {
      updates.push('body = ?')
      params.push(data.body)
    }
    if (data.version !== undefined) {
      updates.push('version = ?')
      params.push(data.version)
    }
    if (data.publishedAt !== undefined) {
      updates.push('published_at = ?')
      params.push(data.publishedAt)
    }
    if (data.isPublished !== undefined) {
      updates.push('is_published = ?')
      params.push(data.isPublished ? 1 : 0)
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?')
      params.push(JSON.stringify(data.tags))
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      params.push(id)

      this.db.prepare(`
        UPDATE changelog_entries SET ${updates.join(', ')} WHERE id = ?
      `).run(...params)
    }

    const entry = await this.getEntry(id)
    if (!entry) {
      throw new Error('Failed to update entry')
    }
    return entry
  }

  async deleteEntry(id: string): Promise<void> {
    this.db.prepare('DELETE FROM changelog_entries WHERE id = ?').run(id)
    this.db.prepare('DELETE FROM changelog_reads WHERE entry_id = ?').run(id)
  }

  async markRead(entryId: string, userId: string): Promise<void> {
    this.db.prepare(`
      INSERT OR REPLACE INTO changelog_reads (entry_id, user_id, read_at)
      VALUES (?, ?, datetime('now'))
    `).run(entryId, userId)
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM changelog_entries e
      LEFT JOIN changelog_reads r ON e.id = r.entry_id AND r.user_id = ?
      WHERE e.is_published = 1 AND r.entry_id IS NULL
    `).get(userId) as { count: number }

    return result.count
  }
}

export { SqliteAdapterOptions } from './types.js'
