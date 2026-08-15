import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EntryCard } from '@/components/entries/EntryCard'
import type { Entry } from '@/types'

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    title: 'Deep thoughts',
    content: '{}',
    contentText: 'A short body',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
    publishedAt: null,
    tags: [{ tag: { id: 't1', name: 'life', color: null } }],
    media: [],
    ...overrides,
  }
}

function renderCard(entry: Entry) {
  return render(
    <MemoryRouter>
      <EntryCard entry={entry} />
    </MemoryRouter>,
  )
}

describe('EntryCard', () => {
  it('renders the title and excerpt', () => {
    renderCard(makeEntry())
    expect(screen.getByText('Deep thoughts')).toBeInTheDocument()
    expect(screen.getByText('A short body')).toBeInTheDocument()
  })

  it('links to the entry view', () => {
    renderCard(makeEntry())
    expect(screen.getByRole('link')).toHaveAttribute('href', '/entry/e1')
  })

  it('truncates excerpts longer than 160 chars', () => {
    const longText = 'x'.repeat(200)
    renderCard(makeEntry({ contentText: longText }))
    expect(screen.getByText(longText.slice(0, 160) + '…')).toBeInTheDocument()
  })

  it('renders tag chips', () => {
    renderCard(makeEntry())
    expect(screen.getByText('life')).toBeInTheDocument()
  })

  it('omits the tag row when there are no tags', () => {
    renderCard(makeEntry({ tags: [] }))
    expect(screen.queryByText('life')).not.toBeInTheDocument()
  })
})
