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

`ChangelogFeed` defaults to the cyguin dark theme, including the feed surface,
loading state, and empty state. Pass `theme="light"` to opt into the light theme.

Props:

| prop | default | description |
|---|---|---|
| `apiBase` | — | your API base URL (required) |
| `theme` | `"dark"` | visual theme |
| `pageSize` | `10` | entries per page |
| `emptyMessage` | `"No changelog entries yet."` | empty state text |

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
| `theme` | `"dark"` | visual theme |
| `userId` | localStorage | user identifier for read state |
| `pollInterval` | `60_000` | ms between polls |
| `badgeMaxCount` | `99` | cap displayed badge number |
| `panelWidth` | `480` | panel width in px |
| `triggerClassName` | — | CSS class for trigger button |
| `panelClassName` | — | CSS class for panel |

## links

[Full changelog monorepo →](https://github.com/cyguin/changelog)

[Full docs →](https://github.com/cyguin/changelog#readme)
