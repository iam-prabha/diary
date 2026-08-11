export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface Tag {
  id: string
  name: string
  color: string | null
  count?: number
}

export interface Media {
  id: string
  url: string
  mimeType: string
  size: number
  width?: number | null
  height?: number | null
  cloudinaryId: string
}

export interface Entry {
  id: string
  title: string
  content: string
  contentText: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  tags: { tag: Tag }[]
  media: Media[]
}

export interface CreateEntryInput {
  title: string
  content: string
  contentText?: string
  tags?: string[]
  media?: Omit<Media, 'id' | 'createdAt'>[]
}

export type UpdateEntryInput = Partial<CreateEntryInput>

export interface EntryListResponse {
  entries: Entry[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
  nextCursor?: string | null
  hasMore?: boolean
}
