import { create } from 'zustand'
import { entriesApi } from '@/lib/api'
import type { Entry, CreateEntryInput, UpdateEntryInput } from '@/types'

interface EntriesState {
  entries: Entry[]
  q: string
  tag: string | null
  page: number
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  error: string | null

  setQ: (q: string) => void
  setTag: (tag: string | null) => void
  fetchEntries: (reset?: boolean) => Promise<void>
  fetchEntry: (id: string) => Promise<Entry | null>
  createEntry: (input: CreateEntryInput) => Promise<Entry>
  updateEntry: (id: string, input: UpdateEntryInput) => Promise<Entry>
  deleteEntry: (id: string) => Promise<void>
  removeFromList: (id: string) => void
  upsertEntry: (entry: Entry) => void
}

export const useEntries = create<EntriesState>((set, get) => ({
  entries: [],
  q: '',
  tag: null,
  page: 1,
  hasMore: true,
  loading: false,
  loadingMore: false,
  error: null,

  setQ: q => {
    set({ q, page: 1, hasMore: true })
    get().fetchEntries(true)
  },

  setTag: tag => {
    set({ tag, page: 1, hasMore: true })
    get().fetchEntries(true)
  },

  fetchEntries: async (reset = false) => {
    const { q, tag, page, loading, loadingMore } = get()
    if (loading || loadingMore) return

    if (reset) {
      set({ loading: true })
    } else {
      set({ loadingMore: true })
    }
    try {
      const pageToFetch = reset ? 1 : page
      const data = await entriesApi.list({
        q: q || undefined,
        tag: tag || undefined,
        page: pageToFetch,
        limit: 20,
      })
      set(state => ({
        entries: reset ? data.entries : [...state.entries, ...data.entries],
        hasMore: data.pagination ? pageToFetch < data.pagination.totalPages : Boolean(data.hasMore),
        page: reset ? 2 : page + 1,
        loading: false,
        loadingMore: false,
        error: null,
      }))
    } catch (e) {
      set({ loading: false, loadingMore: false, error: (e as Error).message })
    }
  },

  fetchEntry: async id => {
    const cached = get().entries.find(e => e.id === id)
    if (cached) return cached
    return entriesApi.get(id)
  },

  createEntry: async input => {
    const entry = await entriesApi.create(input)
    get().upsertEntry(entry)
    return entry
  },

  updateEntry: async (id, input) => {
    const entry = await entriesApi.update(id, input)
    get().upsertEntry(entry)
    return entry
  },

  deleteEntry: async id => {
    await entriesApi.delete(id)
    get().removeFromList(id)
  },

  removeFromList: id => set(state => ({ entries: state.entries.filter(e => e.id !== id) })),

  upsertEntry: entry => set(state => {
    const exists = state.entries.some(e => e.id === entry.id)
    return {
      entries: exists
        ? state.entries.map(e => e.id === entry.id ? entry : e)
        : [entry, ...state.entries],
    }
  }),
}))
