export interface Entry {
  id: string
  title: string
  body: string
  version: string | null
  publishedAt: string
  createdAt: string
  updatedAt: string
  isPublished: boolean
  tags: string[]
}

export interface ReadRecord {
  entryId: string
  userId: string
  readAt: string
}

export interface CreateEntryInput {
  title: string
  body: string
  version?: string
  publishedAt?: string
  isPublished?: boolean
  tags?: string[]
}

export interface UpdateEntryInput {
  title?: string
  body?: string
  version?: string | null
  publishedAt?: string
  isPublished?: boolean
  tags?: string[]
}

export interface GetEntriesOptions {
  limit?: number
  offset?: number
  publishedOnly?: boolean
}

export interface ChangelogAdapter {
  getEntries(opts?: GetEntriesOptions): Promise<Entry[]>
  getEntry(id: string): Promise<Entry | null>
  createEntry(data: CreateEntryInput): Promise<Entry>
  updateEntry(id: string, data: UpdateEntryInput): Promise<Entry>
  deleteEntry(id: string): Promise<void>
  markRead(entryId: string, userId: string): Promise<void>
  getUnreadCount(userId: string): Promise<number>
  runMigrations(): Promise<void>
}
