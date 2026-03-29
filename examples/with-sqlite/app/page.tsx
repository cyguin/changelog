import { ChangelogFeed } from '@cyguin/changelog-react'

export default function Home() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Product Updates</h1>
      <ChangelogFeed
        apiBase="/api/changelog"
        pageSize={20}
        emptyMessage="No updates yet. Check back soon!"
      />
    </div>
  )
}
