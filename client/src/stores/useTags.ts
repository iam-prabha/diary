import { create } from 'zustand'
import { tagsApi } from '@/lib/api'
import type { Tag } from '@/types'

interface TagsState {
  tags: Tag[]
  loading: boolean
  error: string | null
  fetchTags: (force?: boolean) => Promise<void>
  createTag: (name: string, color?: string) => Promise<Tag>
}

export const useTags = create<TagsState>((set, get) => ({
  tags: [],
  loading: false,
  error: null,

  fetchTags: async (force = false) => {
    const { tags, loading } = get()
    if (tags.length > 0 && !force) return
    if (loading) return
    set({ loading: true })
    try {
      const result = await tagsApi.list()
      set({ tags: result, loading: false, error: null })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  createTag: async (name, color) => {
    const tag = await tagsApi.create(name, color)
    set(state => {
      const exists = state.tags.some(t => t.name === tag.name)
      return {
        tags: exists ? state.tags.map(t => t.name === tag.name ? tag : t) : [...state.tags, tag],
      }
    })
    return tag
  },
}))
