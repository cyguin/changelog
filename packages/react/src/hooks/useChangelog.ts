import { useState, useEffect, useCallback } from 'react'

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

export interface UseChangelogResult {
  entries: Entry[]
  isLoading: boolean
  hasMore: boolean
  error: string | null
  loadMore: () => void
}

export function useChangelog(apiBase: string, pageSize = 10): UseChangelogResult {
  const [entries, setEntries] = useState<Entry[]>([])
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(
    async (currentOffset: number, append: boolean) => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${apiBase}?limit=${pageSize}&offset=${currentOffset}`
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Entry[] = await res.json()
        setEntries((prev) => (append ? [...prev, ...data] : data))
        setHasMore(data.length === pageSize)
        setOffset(currentOffset + data.length)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entries')
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase, pageSize]
  )

  useEffect(() => {
    fetchEntries(0, false)
  }, [fetchEntries])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchEntries(offset, true)
    }
  }, [isLoading, hasMore, offset, fetchEntries])

  return { entries, isLoading, hasMore, error, loadMore }
}
