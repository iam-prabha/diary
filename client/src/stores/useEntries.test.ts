import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Entry } from '@/types'
import { useEntries } from '@/stores/useEntries'
import { entriesApi } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  entriesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedApi = vi.mocked(entriesApi)

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    title: 'Entry',
    content: '{}',
    contentText: 'body',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
    publishedAt: null,
    tags: [],
    media: [],
    ...overrides,
  }
}

describe('useEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useEntries.setState({
      entries: [],
      q: '',
      tag: null,
      page: 1,
      hasMore: true,
      loading: false,
      loadingMore: false,
      error: null,
    })
  })

  it('fetches entries and replaces the list on reset', async () => {
    mockedApi.list.mockResolvedValue({
      entries: [makeEntry()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })

    await useEntries.getState().fetchEntries(true)

    const state = useEntries.getState()
    expect(state.entries).toHaveLength(1)
    expect(state.page).toBe(2)
    expect(state.hasMore).toBe(false)
    expect(state.loading).toBe(false)
  })

  it('appends entries when not resetting', async () => {
    useEntries.setState({ entries: [makeEntry({ id: 'a' })], page: 2 })
    mockedApi.list.mockResolvedValue({
      entries: [makeEntry({ id: 'b' })],
      pagination: { page: 2, limit: 20, total: 2, totalPages: 1 },
    })

    await useEntries.getState().fetchEntries(false)

    expect(useEntries.getState().entries.map(e => e.id)).toEqual(['a', 'b'])
  })

  it('stores an error message on failure', async () => {
    mockedApi.list.mockRejectedValue(new Error('boom'))

    await useEntries.getState().fetchEntries(true)

    const state = useEntries.getState()
    expect(state.error).toBe('boom')
    expect(state.loading).toBe(false)
  })

  it('creates an entry and prepends it', async () => {
    const entry = makeEntry({ id: 'new' })
    mockedApi.create.mockResolvedValue(entry)

    const created = await useEntries.getState().createEntry({
      title: 'x',
      content: '{}',
      contentText: 'x',
    })

    expect(created.id).toBe('new')
    expect(useEntries.getState().entries[0].id).toBe('new')
  })

  it('updates an existing entry in place', async () => {
    useEntries.setState({ entries: [makeEntry({ id: 'e1', title: 'Old' })] })
    const updated = makeEntry({ id: 'e1', title: 'New' })
    mockedApi.update.mockResolvedValue(updated)

    await useEntries.getState().updateEntry('e1', { title: 'New' })

    expect(useEntries.getState().entries[0].title).toBe('New')
  })

  it('deletes an entry and removes it from the list', async () => {
    useEntries.setState({ entries: [makeEntry({ id: 'e1' })] })
    mockedApi.delete.mockResolvedValue(undefined as never)

    await useEntries.getState().deleteEntry('e1')

    expect(useEntries.getState().entries).toEqual([])
  })

  it('returns a cached entry without hitting the API', async () => {
    useEntries.setState({ entries: [makeEntry({ id: 'cached' })] })

    const entry = await useEntries.getState().fetchEntry('cached')

    expect(entry?.id).toBe('cached')
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it('fetches a missing entry from the API', async () => {
    mockedApi.get.mockResolvedValue(makeEntry({ id: 'remote' }))

    const entry = await useEntries.getState().fetchEntry('remote')

    expect(entry?.id).toBe('remote')
    expect(mockedApi.get).toHaveBeenCalledWith('remote')
  })

  it('removes a single entry from the list', () => {
    useEntries.setState({ entries: [makeEntry({ id: 'a' }), makeEntry({ id: 'b' })] })
    useEntries.getState().removeFromList('a')
    expect(useEntries.getState().entries.map(e => e.id)).toEqual(['b'])
  })
})
