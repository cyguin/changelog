import { NextRequest, NextResponse } from 'next/server'
import { getAdapter } from '@/app/lib/adapter'

export async function GET(request: NextRequest) {
  try {
    const adapter = getAdapter()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }
    const entries = await adapter.getEntries({ limit: 1000, offset: 0 })
    const readIds = await adapter.getReadIds(userId)
    const unread = entries.filter((e) => !readIds.includes(e.id))
    return NextResponse.json({ count: unread.length })
  } catch (error) {
    console.error('[GET /api/changelog/read]', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adapter = getAdapter()
    const body = await request.json()
    const { entryIds, userId } = body
    if (!userId || !Array.isArray(entryIds)) {
      return NextResponse.json(
        { error: 'entryIds array and userId are required' },
        { status: 400 }
      )
    }
    await adapter.markAllRead(userId, entryIds)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[POST /api/changelog/read]', error)
    return NextResponse.json(
      { error: 'Failed to mark entries as read' },
      { status: 500 }
    )
  }
}
