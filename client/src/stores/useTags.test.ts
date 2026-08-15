import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Tag } from '@/types'
import { useTags } from '@/stores/useTags'
import { tagsApi } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  tagsApi: {
    list: vi.fn(),
    create: vi.fn(),
  },
}))

const mockedApi = vi.mocked(tagsApi)

function makeTag(overrides: Partial<Tag> = {}): Tag {
  return { id: 't1', name: 'work', color: '#c4785e', ...overrides }
}

describe('useTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useTags.setState({ tags: [], loading: false, error: null })
  })

  it('fetches tags and stores them', async () => {
    mockedApi.list.mockResolvedValue([makeTag()])

    await useTags.getState().fetchTags()

    expect(useTags.getState().tags).toEqual([makeTag()])
    expect(useTags.getState().loading).toBe(false)
  })

  it('skips refetch when tags are already loaded', async () => {
    useTags.setState({ tags: [makeTag()] })

    await useTags.getState().fetchTags()

    expect(mockedApi.list).not.toHaveBeenCalled()
  })

  it('stores an error message on failure', async () => {
    mockedApi.list.mockRejectedValue(new Error('nope'))

    await useTags.getState().fetchTags()

    expect(useTags.getState().error).toBe('nope')
  })

  it('creates a tag and appends it', async () => {
    mockedApi.create.mockResolvedValue(makeTag({ name: 'new', id: 't2' }))

    const tag = await useTags.getState().createTag('new')

    expect(tag.name).toBe('new')
    expect(useTags.getState().tags).toContainEqual(makeTag({ name: 'new', id: 't2' }))
  })

  it('replaces an existing tag instead of duplicating', async () => {
    useTags.setState({ tags: [makeTag({ name: 'work', color: '#000000' })] })
    mockedApi.create.mockResolvedValue(makeTag({ name: 'work', color: '#ffffff' }))

    await useTags.getState().createTag('work')

    expect(useTags.getState().tags).toHaveLength(1)
    expect(useTags.getState().tags[0].color).toBe('#ffffff')
  })
})
