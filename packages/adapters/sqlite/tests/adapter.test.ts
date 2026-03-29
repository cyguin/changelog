import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { SQLiteAdapter } from '../src/index.js'

describe('SQLiteAdapter', () => {
  let db: InstanceType<typeof Database>
  let adapter: SQLiteAdapter

  beforeEach(() => {
    db = new Database(':memory:')
    adapter = new SQLiteAdapter({ db })
  })

  describe('runMigrations', () => {
    it('creates both tables', async () => {
      await adapter.runMigrations()

      const entriesTable = db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='changelog_entries'
      `).get()

      const readsTable = db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='changelog_reads'
      `).get()

      expect(entriesTable).toBeDefined()
      expect(readsTable).toBeDefined()
    })
  })

  describe('createEntry', () => {
    beforeEach(async () => {
      await adapter.runMigrations()
    })

    it('creates an entry with all fields', async () => {
      const entry = await adapter.createEntry({
        title: 'Test Title',
        body: 'Test body content',
        version: '1.0.0',
        publishedAt: '2024-01-15T10:00:00Z',
        isPublished: true,
        tags: ['feature', 'bugfix'],
      })

      expect(entry.id).toBeDefined()
      expect(entry.title).toBe('Test Title')
      expect(entry.body).toBe('Test body content')
      expect(entry.version).toBe('1.0.0')
      expect(entry.publishedAt).toBe('2024-01-15T10:00:00Z')
      expect(entry.isPublished).toBe(true)
      expect(entry.tags).toEqual(['feature', 'bugfix'])
    })

    it('creates an entry with defaults', async () => {
      const entry = await adapter.createEntry({
        title: 'Minimal Entry',
        body: 'Body only',
      })

      expect(entry.id).toBeDefined()
      expect(entry.title).toBe('Minimal Entry')
      expect(entry.body).toBe('Body only')
      expect(entry.version).toBeNull()
      expect(entry.isPublished).toBe(false)
      expect(entry.tags).toEqual([])
    })
  })

  describe('getEntry', () => {
    beforeEach(async () => {
      await adapter.runMigrations()
    })

    it('returns entry by id', async () => {
      const created = await adapter.createEntry({
        title: 'Find Me',
        body: 'Body',
      })

      const found = await adapter.getEntry(created.id)

      expect(found).not.toBeNull()
      expect(found?.title).toBe('Find Me')
    })

    it('returns null for non-existent id', async () => {
      const found = await adapter.getEntry('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('getEntries', () => {
    beforeEach(async () => {
      await adapter.runMigrations()
    })

    it('returns all entries by default', async () => {
      await adapter.createEntry({ title: 'Entry 1', body: 'Body 1' })
      await adapter.createEntry({ title: 'Entry 2', body: 'Body 2' })

      const entries = await adapter.getEntries()

      expect(entries).toHaveLength(2)
    })

    it('respects limit and offset', async () => {
      for (let i = 0; i < 5; i++) {
        await adapter.createEntry({
          title: `Entry ${i}`,
          body: `Body ${i}`,
          publishedAt: new Date(2024, 0, i + 1).toISOString(),
        })
      }

      const page1 = await adapter.getEntries({ limit: 2, offset: 0 })
      const page2 = await adapter.getEntries({ limit: 2, offset: 2 })

      expect(page1).toHaveLength(2)
      expect(page2).toHaveLength(2)
      expect(page1[0].title).toBe('Entry 4')
      expect(page2[0].title).toBe('Entry 2')
    })

    it('filters publishedOnly entries', async () => {
      await adapter.createEntry({ title: 'Published', body: 'Body', isPublished: true })
      await adapter.createEntry({ title: 'Draft', body: 'Body', isPublished: false })

      const all = await adapter.getEntries()
      const published = await adapter.getEntries({ publishedOnly: true })

      expect(all).toHaveLength(2)
      expect(published).toHaveLength(1)
      expect(published[0].title).toBe('Published')
    })
  })

  describe('updateEntry', () => {
    beforeEach(async () => {
      await adapter.runMigrations()
    })

    it('updates entry fields', async () => {
      const created = await adapter.createEntry({
        title: 'Original Title',
        body: 'Original Body',
      })

      const updated = await adapter.updateEntry(created.id, {
        title: 'Updated Title',
        version: '2.0.0',
      })

      expect(updated.title).toBe('Updated Title')
      expect(updated.body).toBe('Original Body')
      expect(updated.version).toBe('2.0.0')
    })

    it('throws for non-existent entry', async () => {
      await expect(
        adapter.updateEntry('non-existent', { title: 'New Title' })
      ).rejects.toThrow('Entry not found')
    })
  })

  describe('deleteEntry', () => {
    beforeEach(async () => {
      await adapter.runMigrations()
    })

    it('deletes entry and its read records', async () => {
      const entry = await adapter.createEntry({ title: 'To Delete', body: 'Body' })
      await adapter.markRead(entry.id, 'user-1')

      await adapter.deleteEntry(entry.id)

      const found = await adapter.getEntry(entry.id)
      expect(found).toBeNull()
    })
  })

  describe('markRead and getUnreadCount', () => {
    beforeEach(async () => {
      await adapter.runMigrations()
    })

    it('marks entry as read for user', async () => {
      const entry = await adapter.createEntry({
        title: 'Test',
        body: 'Body',
        isPublished: true,
      })

      await adapter.markRead(entry.id, 'user-123')

      const unreadCount = await adapter.getUnreadCount('user-123')
      expect(unreadCount).toBe(0)
    })

    it('returns correct unread count', async () => {
      const entry1 = await adapter.createEntry({
        title: 'Entry 1',
        body: 'Body',
        isPublished: true,
      })
      await adapter.createEntry({
        title: 'Entry 2',
        body: 'Body',
        isPublished: true,
      })

      let unreadCount = await adapter.getUnreadCount('user-456')
      expect(unreadCount).toBe(2)

      await adapter.markRead(entry1.id, 'user-456')

      unreadCount = await adapter.getUnreadCount('user-456')
      expect(unreadCount).toBe(1)
    })

    it('only counts published entries', async () => {
      const published = await adapter.createEntry({
        title: 'Published',
        body: 'Body',
        isPublished: true,
      })
      await adapter.createEntry({
        title: 'Draft',
        body: 'Body',
        isPublished: false,
      })

      const unreadCount = await adapter.getUnreadCount('user-789')

      expect(unreadCount).toBe(1)
      await adapter.markRead(published.id, 'user-789')
      expect(await adapter.getUnreadCount('user-789')).toBe(0)
    })
  })
})
