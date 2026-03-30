# @cyguin/changelog-react

React components for `@cyguin/changelog`.

## what it is

`<ChangelogFeed>` — paginated changelog feed.
`<ChangelogBadge>` — unread count badge with popup panel.

## install

```bash
npm install @cyguin/changelog-react
```

## ChangelogFeed

```tsx
import { ChangelogFeed } from '@cyguin/changelog-react'

export default function Home() {
  return <ChangelogFeed apiBase="/api/changelog" />
}
```

Props:

| prop | default | description |
|---|---|---|
| `apiBase` | — | your API base URL (required) |
| `pageSize` | `20` | entries per page |
| `emptyMessage` | `"Nothing yet"` | empty state text |

## ChangelogBadge

```tsx
import { ChangelogBadge } from '@cyguin/changelog-react'

export default function Layout({ children }) {
  return (
    <nav>
      <ChangelogBadge
        apiBase="/api/changelog"
        userId={session.user.id}
        pollInterval={30_000}
      />
      {children}
    </nav>
  )
}
```

Props:

| prop | default | description |
|---|---|---|
| `apiBase` | — | your API base URL (required) |
| `userId` | localStorage | user identifier for read state |
| `pollInterval` | `30_000` | ms between polls |
| `badgeMaxCount` | `99` | cap displayed badge number |
| `panelWidth` | `380` | panel width in px |
| `triggerClassName` | — | CSS class for trigger button |
| `panelClassName` | — | CSS class for panel |

## links

[Full changelog monorepo →](https://github.com/cyguin/changelog)

[Full docs →](https://github.com/cyguin/changelog#readme)
