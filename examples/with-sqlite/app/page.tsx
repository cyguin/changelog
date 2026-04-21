import { ChangelogFeed } from '@cyguin/changelog-react'

export default function Home() {
  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#f1f3f6',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        Product Updates
      </h1>
      <p
        style={{
          fontSize: '1rem',
          color: '#858b98',
          marginBottom: '2rem',
        }}
      >
        The latest features, improvements, and fixes.
      </p>
      <ChangelogFeed
        apiBase="/api/changelog"
        pageSize={20}
        emptyMessage="No updates yet. Check back soon!"
      />
    </div>
  )
}
