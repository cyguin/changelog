import React, { useState, useEffect, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

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

interface ChangelogFeedProps {
  apiBase: string
  pageSize?: number
  emptyMessage?: string
  className?: string
  onEntryClick?: (entry: Entry) => void
  renderEntry?: (entry: Entry) => React.ReactNode
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ChangelogFeed({
  apiBase,
  pageSize = 10,
  emptyMessage = 'No changelog entries yet.',
  className,
  onEntryClick,
  renderEntry,
}: ChangelogFeedProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading && hasMore) {
          fetchEntries(offset, true)
        }
      },
      { threshold: 0.1 }
    )
    observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, isLoading, offset, fetchEntries])

  if (error) {
    return (
      <div
        className={className}
        style={{ color: '#dc2626', padding: '16px', fontSize: '14px' }}
      >
        {error}
      </div>
    )
  }

  if (!isLoading && entries.length === 0) {
    return (
      <div
        className={className}
        style={{ color: '#6b7280', padding: '16px', fontSize: '14px' }}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={className}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onEntryClick?.(entry)}
          style={{
            padding: '16px 0',
            borderBottom: '1px solid #e5e7eb',
            cursor: onEntryClick ? 'pointer' : 'default',
          }}
        >
          {renderEntry ? (
            renderEntry(entry)
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '15px' }}>
                  {entry.title}
                </span>
                {entry.version && (
                  <span
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontFamily: 'monospace',
                    }}
                  >
                    v{entry.version}
                  </span>
                )}
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '8px',
                }}
              >
                {formatDate(entry.publishedAt)}
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#374151' }}>
                <ReactMarkdown>{entry.body}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      ))}
      <div ref={sentinelRef} style={{ height: '1px' }} />
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '14px' }}>
          Loading...
        </div>
      )}
      {!hasMore && entries.length > 0 && (
        <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
          You're all caught up!
        </div>
      )}
    </div>
  )
}
