import { useState, useEffect, useCallback, useRef } from 'react'

const LS_KEY = 'cyguin_changelog_read_ids'

interface UseUnreadCountResult {
  unreadCount: number
  markAllRead: (entryIds: string[]) => void
}

function getGuestReadIds(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGuestReadIds(ids: string[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids))
  } catch {
    // storage unavailable
  }
}

async function fetchUnreadCount(apiBase: string, userId: string): Promise<number> {
  const res = await fetch(`${apiBase}/read?userId=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: { unreadCount: number } = await res.json()
  return data.unreadCount
}

async function postMarkRead(
  apiBase: string,
  entryIds: string[],
  userId: string
): Promise<void> {
  const res = await fetch(`${apiBase}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryIds, userId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export function useUnreadCount(
  apiBase: string,
  userId?: string,
  pollInterval = 60000
): UseUnreadCountResult {
  const isGuest = !userId
  const [unreadCount, setUnreadCount] = useState(0)
  const [guestReadIds, setGuestReadIds] = useState<string[]>(() =>
    isGuest ? getGuestReadIds() : []
  )
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    if (isGuest) {
      setUnreadCount(0)
      return
    }
    try {
      const count = await fetchUnreadCount(apiBase, userId!)
      setUnreadCount(count)
    } catch {
      // swallow poll errors
    }
  }, [apiBase, userId, isGuest])

  useEffect(() => {
    refresh()
    if (pollInterval > 0 && !isGuest) {
      pollRef.current = setInterval(refresh, pollInterval)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [refresh, pollInterval, isGuest])

  const markAllRead = useCallback(
    async (entryIds: string[]) => {
      if (isGuest) {
        const updated = [...new Set([...guestReadIds, ...entryIds])]
        saveGuestReadIds(updated)
        setGuestReadIds(updated)
        setUnreadCount(0)
        return
      }
      try {
        await postMarkRead(apiBase, entryIds, userId!)
        setUnreadCount(0)
      } catch {
        // swallow
      }
    },
    [apiBase, userId, isGuest, guestReadIds]
  )

  return { unreadCount, markAllRead }
}
