import type {
  ChangelogAdapter,
  Entry,
  CreateEntryInput,
  UpdateEntryInput,
  GetEntriesOptions,
} from '@cyguin/changelog-core'
import { generateCuid2 } from '@cyguin/changelog-core'

type PostgresSql = import('postgres').Sql

interface PostgresAdapterOptions {
  sql: PostgresSql
}

interface EntryRow {
  id: string
  title: string
  body: string
  version: string | null
  published_at: string
  created_at: string
  updated_at: string
  is_published: boolean
  tags: string
}

function mapRowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    version: row.version,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPublished: row.is_published,
    tags: row.tags ? JSON.parse(row.tags) : [],
  }
}

export class PostgresAdapter implements ChangelogAdapter {
  private sql: PostgresSql

  constructor(options: PostgresAdapterOptions) {
    this.sql = options.sql
  }

  async runMigrations(): Promise<void> {
    await this.sql`
      CREATE TABLE IF NOT EXISTS changelog_entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        version TEXT,
        published_at TEXT NOT NULL,
        created_at TEXT DEFAULT now()::text,
        updated_at TEXT DEFAULT now()::text,
        is_published INTEGER DEFAULT 0,
        tags TEXT DEFAULT '[]'
      )
    `

    await this.sql`
      CREATE TABLE IF NOT EXISTS changelog_reads (
        entry_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        read_at TEXT DEFAULT now()::text,
        PRIMARY KEY (entry_id, user_id)
      )
    `
  }

  async getEntries(opts?: GetEntriesOptions): Promise<Entry[]> {
    const limit = opts?.limit ?? 50
    const offset = opts?.offset ?? 0
    const publishedOnly = opts?.publishedOnly ?? false

    let rows: EntryRow[]

    if (publishedOnly) {
      rows = await this.sql<EntryRow[]>`
        SELECT * FROM changelog_entries
        WHERE is_published = 1
        ORDER BY published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      rows = await this.sql<EntryRow[]>`
        SELECT * FROM changelog_entries
        ORDER BY published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return rows.map(mapRowToEntry)
  }

  async getEntry(id: string): Promise<Entry | null> {
    const rows = await this.sql<EntryRow[]>`
      SELECT * FROM changelog_entries WHERE id = ${id}
    `

    if (rows.length === 0) {
      return null
    }

    return mapRowToEntry(rows[0])
  }

  async createEntry(data: CreateEntryInput): Promise<Entry> {
    const id = generateCuid2()
    const now = new Date().toISOString()
    const publishedAt = data.publishedAt ?? now
    const tags = JSON.stringify(data.tags ?? [])
    const isPublished = data.isPublished ? 1 : 0

    await this.sql`
      INSERT INTO changelog_entries (id, title, body, version, published_at, created_at, updated_at, is_published, tags)
      VALUES (
        ${id},
        ${data.title},
        ${data.body},
        ${data.version ?? null},
        ${publishedAt},
        ${now},
        ${now},
        ${isPublished},
        ${tags}
      )
    `

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

    const setObj: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (data.title !== undefined) {
      setObj.title = data.title
    }
    if (data.body !== undefined) {
      setObj.body = data.body
    }
    if (data.version !== undefined) {
      setObj.version = data.version
    }
    if (data.publishedAt !== undefined) {
      setObj.published_at = data.publishedAt
    }
    if (data.isPublished !== undefined) {
      setObj.is_published = data.isPublished ? 1 : 0
    }
    if (data.tags !== undefined) {
      setObj.tags = JSON.stringify(data.tags)
    }

    await this.sql`UPDATE changelog_entries SET ${this.sql(setObj)} WHERE id = ${id}`

    const entry = await this.getEntry(id)
    if (!entry) {
      throw new Error('Failed to update entry')
    }
    return entry
  }

  async deleteEntry(id: string): Promise<void> {
    await this.sql`DELETE FROM changelog_entries WHERE id = ${id}`
    await this.sql`DELETE FROM changelog_reads WHERE entry_id = ${id}`
  }

  async markRead(entryId: string, userId: string): Promise<void> {
    await this.sql`
      INSERT INTO changelog_reads (entry_id, user_id, read_at)
      VALUES (${entryId}, ${userId}, now()::text)
      ON CONFLICT (entry_id, user_id) DO UPDATE SET read_at = now()::text
    `
  }

  async getUnreadCount(userId: string): Promise<number> {
    interface CountRow {
      count: number
    }
    const result = await this.sql<CountRow[]>`
      SELECT COUNT(*) as count FROM changelog_entries e
      LEFT JOIN changelog_reads r ON e.id = r.entry_id AND r.user_id = ${userId}
      WHERE e.is_published = 1 AND r.entry_id IS NULL
    `

    return Number(result[0]?.count ?? 0)
  }
}
