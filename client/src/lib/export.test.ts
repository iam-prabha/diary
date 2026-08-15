import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Entry } from '@/types'
import {
  exportEntryAsJSON,
  exportEntryAsMarkdown,
  exportAllAsJSON,
  exportAllAsMarkdown,
} from '@/lib/export'

vi.mock('file-saver', () => ({ saveAs: vi.fn() }))

const { saveAs } = vi.mocked(await import('file-saver'))

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: '1',
    title: 'Hello World',
    content: '{"type":"doc","content":[]}',
    contentText: 'Some body text',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
    publishedAt: '2026-08-15T10:00:00.000Z',
    tags: [{ tag: { id: 't1', name: 'work', color: null } }],
    media: [],
    ...overrides,
  }
}

describe('exportEntryAsJSON', () => {
  beforeEach(() => vi.clearAllMocks())

  it('downloads a JSON blob with a slugified filename', () => {
    exportEntryAsJSON(makeEntry())

    expect(saveAs).toHaveBeenCalledTimes(1)
    const [blob, filename] = saveAs.mock.calls[0] as [Blob, string]
    expect(blob.type).toBe('application/json')
    expect(filename).toBe('hello-world.json')
  })

  it('falls back to "entry" for a title with no slug chars', () => {
    exportEntryAsJSON(makeEntry({ title: '!!!' }))
    const [, filename] = saveAs.mock.calls[0] as [Blob, string]
    expect(filename).toBe('entry.json')
  })
})

describe('exportEntryAsMarkdown', () => {
  beforeEach(() => vi.clearAllMocks())

  it('downloads a markdown blob containing the title', () => {
    exportEntryAsMarkdown(makeEntry())

    const [blob, filename] = saveAs.mock.calls[0] as [Blob, string]
    expect(blob.type).toBe('text/markdown')
    expect(filename).toBe('hello-world.md')
  })
})

describe('exportAllAsJSON', () => {
  beforeEach(() => vi.clearAllMocks())

  it('downloads a wrapped payload', () => {
    exportAllAsJSON([makeEntry()])

    const [blob, filename] = saveAs.mock.calls[0] as [Blob, string]
    expect(blob.type).toBe('application/json')
    expect(filename).toMatch(/^diary-export-\d{4}-\d{2}-\d{2}\.json$/)
  })
})

describe('exportAllAsMarkdown', () => {
  beforeEach(() => vi.clearAllMocks())

  it('downloads a single markdown file for one entry', async () => {
    await exportAllAsMarkdown([makeEntry()])

    const [, filename] = saveAs.mock.calls[0] as [Blob, string]
    expect(filename).toBe('hello-world.md')
  })

  it('downloads a zip for multiple entries', async () => {
    await exportAllAsMarkdown([makeEntry({ id: '1' }), makeEntry({ id: '2', title: 'Second Post' })])

    const [blob, filename] = saveAs.mock.calls[0] as [Blob, string]
    expect(blob.type).toContain('zip')
    expect(filename).toMatch(/^diary-markdown-\d{4}-\d{2}-\d{2}\.zip$/)
  })
})
