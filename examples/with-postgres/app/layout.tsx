import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Changelog — PostgreSQL Example',
  description: 'Changelog feed powered by PostgreSQL and the cyguin changelog library.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #252b3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Changelog Demo (PostgreSQL)</strong>
          <ChangelogBadge apiBase="/api/changelog" userId="demo-user" />
        </nav>
        <main style={{ padding: '2rem' }}>{children}</main>
      </body>
    </html>
  )
}

import { ChangelogBadge } from '@cyguin/changelog-react'
