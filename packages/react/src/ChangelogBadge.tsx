import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChangelogFeed, type Entry } from './ChangelogFeed'
import { useUnreadCount } from './hooks/useUnreadCount'

interface ChangelogBadgeProps {
  apiBase: string
  userId?: string
  pollInterval?: number
  badgeMaxCount?: number
  triggerClassName?: string
  panelClassName?: string
  panelWidth?: number
  onEntryClick?: (entry: Entry) => void
  renderTrigger?: (unreadCount: number) => React.ReactNode
}

export function ChangelogBadge({
  apiBase,
  userId,
  pollInterval = 60000,
  badgeMaxCount = 99,
  triggerClassName,
  panelClassName,
  panelWidth = 480,
  onEntryClick,
  renderTrigger,
}: ChangelogBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount, markAllRead } = useUnreadCount(apiBase, userId, pollInterval)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const openPanel = useCallback(() => {
    setIsOpen(true)
    markAllRead([])
  }, [markAllRead])

  const closePanel = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        closePanel()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closePanel])

  const displayCount = unreadCount > badgeMaxCount ? `${badgeMaxCount}+` : unreadCount

  return (
    <>
      <div
        ref={triggerRef}
        onClick={isOpen ? closePanel : openPanel}
        className={triggerClassName}
        style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
      >
        {renderTrigger ? (
          renderTrigger(unreadCount)
        ) : (
          <button
            type="button"
            style={{
              position: 'relative',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Changelog
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {displayCount}
              </span>
            )}
          </button>
        )}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className={panelClassName}
            style={{
              position: 'fixed',
              top:
                triggerRef.current
                  ? triggerRef.current.getBoundingClientRect().bottom + 8
                  : 0,
              right: '16px',
              width: panelWidth,
              maxWidth: `calc(100vw - 32px)`,
              maxHeight: '80vh',
              overflowY: 'auto',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
                borderRadius: '12px 12px 0 0',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>
                Changelog
              </span>
              <button
                type="button"
                onClick={closePanel}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#9ca3af',
                  padding: '0',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '0 16px 16px' }}>
              <ChangelogFeed
                apiBase={apiBase}
                pageSize={10}
                onEntryClick={onEntryClick}
                className={panelClassName}
                emptyMessage="No changelog entries yet."
              />
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
