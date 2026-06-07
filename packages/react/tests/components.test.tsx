import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChangelogBadge } from '../src/ChangelogBadge'
import { ChangelogFeed } from '../src/ChangelogFeed'

describe('ChangelogBadge', () => {
  it('renders trigger button', () => {
    render(<ChangelogBadge apiBase="/api/changelog" />)
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('renders with custom trigger text', () => {
    render(<ChangelogBadge apiBase="/api/changelog" renderTrigger={() => 'Updates'} />)
    expect(screen.getByText('Updates')).toBeDefined()
  })
})

describe('ChangelogFeed', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChangelogFeed apiBase="/api/changelog" />)
    expect(container).toBeDefined()
  })
})
