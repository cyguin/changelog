export interface RouteTemplateConfig {
  adapterImport: string
  adapterInit: string
}

export function listAndCreateRoute(_config: RouteTemplateConfig): string {
  return `import { changelogAdapter as adapter } from '@/lib/changelog'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const entries = await adapter.list({ limit, offset, published: true })
  return Response.json({ entries })
}

export async function POST(request: Request) {
  const token = request.headers.get('X-Changelog-Token')
  if (token !== process.env.CHANGELOG_ADMIN_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const entry = await adapter.create(body)
  return Response.json({ entry }, { status: 201 })
}
`
}

export function singleEntryRoute(_config: RouteTemplateConfig): string {
  return `import { changelogAdapter as adapter } from '@/lib/changelog'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const { id } = await params
  const entry = await adapter.getById(id)
  if (!entry) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return Response.json({ entry })
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const token = request.headers.get('X-Changelog-Token')
  if (token !== process.env.CHANGELOG_ADMIN_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const entry = await adapter.update(id, body)
  if (!entry) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return Response.json({ entry })
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  const token = request.headers.get('X-Changelog-Token')
  if (token !== process.env.CHANGELOG_ADMIN_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await adapter.delete(id)
  return new Response(null, { status: 204 })
}
`
}

export function readRoute(_config: RouteTemplateConfig): string {
  return `import { changelogAdapter as adapter } from '@/lib/changelog'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 })
  }
  const unreadCount = await adapter.getUnreadCount(userId)
  return Response.json({ unreadCount })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { entryId, userId } = body
  if (!entryId || !userId) {
    return Response.json({ error: 'entryId and userId are required' }, { status: 400 })
  }
  await adapter.markAsRead({ entryId, userId })
  return Response.json({ success: true })
}
`
}

export function adapterInitModule(config: RouteTemplateConfig): string {
  return `${config.adapterImport}

${config.adapterInit}

let _singleton: typeof changelogAdapter | null = null

export function getAdapter() {
  if (!_singleton) {
    _singleton = changelogAdapter
  }
  return _singleton
}

export const changelogAdapter = getAdapter()
`
}
