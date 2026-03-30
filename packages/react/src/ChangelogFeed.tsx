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
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            marginBottom: '12px',
            background: '#fff',
            cursor: onEntryClick ? 'pointer' : 'default',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (onEntryClick) {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            if (onEntryClick) {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }
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
                  gap: '10px',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>
                  {entry.title}
                </span>
                {entry.version && (
                  <span
                    style={{
                      background: '#f3f4f6',
                      color: '#4b5563',
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontFamily: 'monospace',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
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
                      color: '#2563eb',
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  marginBottom: '12px',
                  letterSpacing: '0.01em',
                }}
              >
                {formatDate(entry.publishedAt)}
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#374151' }}>
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
