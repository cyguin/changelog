import { NextRequest, NextResponse } from 'next/server'
import { getAdapter } from '@/app/lib/adapter'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adapter = getAdapter()
    const entry = await adapter.getEntry(params.id)
    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(entry)
  } catch (error) {
    console.error('[GET /api/changelog/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (token !== process.env.CHANGELOG_ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const adapter = getAdapter()
    const body = await request.json()
    const entry = await adapter.updateEntry(params.id, body)
    return NextResponse.json(entry)
  } catch (error) {
    console.error('[PUT /api/changelog/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adapter = getAdapter()
    await adapter.deleteEntry(params.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/changelog/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}
