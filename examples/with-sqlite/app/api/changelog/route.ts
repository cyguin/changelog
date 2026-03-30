import { NextRequest, NextResponse } from 'next/server'
import { getAdapter } from '@/app/lib/adapter'

export async function GET(request: NextRequest) {
  try {
    const adapter = getAdapter()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const entries = await adapter.getEntries({ limit, offset })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('[GET /api/changelog]', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (token !== process.env.CHANGELOG_ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const adapter = getAdapter()
    const body = await request.json()
    const entry = await adapter.createEntry(body)
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('[POST /api/changelog]', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}
