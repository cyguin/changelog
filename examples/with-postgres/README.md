# Changelog — PostgreSQL Example

A minimal Next.js 14 application demonstrating the [Cyguin Changelog](https://github.com/joeproit/changelog-monorepo) library with a PostgreSQL backend.

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ running locally

## Setup

```bash
# Install dependencies
pnpm install

# Create your .env.local
cp .env.local.example .env.local
# Edit .env.local and set CHANGELOG_ADMIN_TOKEN and DATABASE_URL

# Run the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the changelog feed. Use the bell icon in the top-right to open the unread badge.

## Admin API

Create entries via POST to `/api/changelog` with the `Authorization: Bearer <token>` header and body:

```json
{
  "title": "New Feature Released",
  "content": "We shipped dark mode support.",
  "tags": ["feature", "release"]
}
```

See the [Cyguin Changelog README](https://github.com/joeproit/changelog-monorepo) for the full API reference.
