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
  theme?: 'light' | 'dark'
  pageSize?: number
  emptyMessage?: string
  className?: string
  onEntryClick?: (entry: Entry) => void
  renderEntry?: (entry: Entry) => React.ReactNode
}

const themes = {
  light: {
    bg: '#ffffff',
    bgSubtle: '#f1f3f6',
    border: '#e5e5e5',
    fg: '#0a0d17',
    muted: '#858b98',
    accent: '#ffd21f',
    accentFg: '#0a0d17',
    shadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  dark: {
    bg: '#0a0d17',
    bgSubtle: '#101521',
    border: '#252b3a',
    fg: '#f1f3f6',
    muted: '#858b98',
    accent: '#ffd21f',
    accentFg: '#0a0d17',
    shadow: '0 18px 50px rgba(0, 0, 0, 0.32)',
  },
} as const

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ChangelogFeed({
  apiBase,
  theme = 'dark',
  pageSize = 10,
  emptyMessage = 'No changelog entries yet.',
  className,
  onEntryClick,
  renderEntry,
}: ChangelogFeedProps) {
  const colors = themes[theme]
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
        style={{ color: '#fca5a5', padding: '16px', fontSize: '14px' }}
      >
        {error}
      </div>
    )
  }

  if (!isLoading && entries.length === 0) {
    return (
      <div
        className={className}
        style={{ color: colors.muted, padding: '16px', fontSize: '14px' }}
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
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            marginBottom: '12px',
            background: colors.bg,
            color: colors.fg,
            cursor: onEntryClick ? 'pointer' : 'default',
            boxShadow: colors.shadow,
            transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (onEntryClick) {
              e.currentTarget.style.boxShadow = '0 22px 60px rgba(0,0,0,0.38)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            if (onEntryClick) {
              e.currentTarget.style.boxShadow = colors.shadow
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
                <span style={{ fontWeight: 700, fontSize: '16px', color: colors.fg }}>
                  {entry.title}
                </span>
                {entry.version && (
                  <span
                    style={{
                      background: colors.bgSubtle,
                      color: colors.muted,
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
                      background: 'color-mix(in srgb, #ffd21f 14%, transparent)',
                      color: colors.accent,
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
                  color: colors.muted,
                  marginBottom: '12px',
                  letterSpacing: '0.01em',
                }}
              >
                {formatDate(entry.publishedAt)}
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.7, color: colors.fg }}>
                <ReactMarkdown>{entry.body}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      ))}
      <div ref={sentinelRef} style={{ height: '1px' }} />
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '16px', color: colors.muted, fontSize: '14px' }}>
          Loading...
        </div>
      )}
      {!hasMore && entries.length > 0 && (
        <div style={{ textAlign: 'center', padding: '16px', color: colors.muted, fontSize: '13px' }}>
          You're all caught up!
        </div>
      )}
    </div>
  )
}
