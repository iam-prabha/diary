import { describe, it, expect } from 'vitest'
import {
  getOptimizedUrl,
  publicIdFromUrl,
  imagesFromContent,
  mergeMediaIntoContent,
} from '@/lib/media'
import type { Media } from '@/types'

const CLOUD_URL = 'https://res.cloudinary.com/cloud/image/upload/v1730000000/diary/photo.jpg'

describe('getOptimizedUrl', () => {
  it('injects width/quality/fmt for cloudinary URLs', () => {
    const optimized = getOptimizedUrl(CLOUD_URL, 400)
    expect(optimized).toBe(
      'https://res.cloudinary.com/cloud/image/upload/w_400,q_auto,f_auto/v1730000000/diary/photo.jpg',
    )
  })

  it('does not re-process an already optimized URL', () => {
    const optimized = getOptimizedUrl(
      'https://res.cloudinary.com/cloud/image/upload/w_200,q_auto,f_auto/diary/photo.jpg',
      400,
    )
    expect(optimized).not.toContain('/w_400')
  })

  it('leaves non-cloudinary URLs untouched', () => {
    expect(getOptimizedUrl('https://example.com/a.png', 400)).toBe('https://example.com/a.png')
  })
})

describe('publicIdFromUrl', () => {
  it('strips the version segment and extension', () => {
    expect(publicIdFromUrl(CLOUD_URL)).toBe('diary/photo')
  })

  it('handles URLs without a version segment', () => {
    expect(publicIdFromUrl('https://res.cloudinary.com/cloud/image/upload/diary/photo.jpg')).toBe(
      'diary/photo',
    )
  })

  it('returns null for non-cloudinary URLs', () => {
    expect(publicIdFromUrl('https://example.com/a.png')).toBeNull()
  })
})

describe('imagesFromContent', () => {
  it('extracts nested image nodes', () => {
    const json = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'image', attrs: { src: CLOUD_URL } }] },
        { type: 'image', attrs: { src: 'https://example.com/x.png' } },
      ],
    })

    const images = imagesFromContent(json)

    expect(images).toEqual([
      { src: CLOUD_URL, publicId: 'diary/photo' },
      { src: 'https://example.com/x.png', publicId: null },
    ])
  })

  it('returns an empty array for malformed content', () => {
    expect(imagesFromContent('not json')).toEqual([])
  })
})

describe('mergeMediaIntoContent', () => {
  it('appends missing images to the doc', () => {
    const media: Media[] = [
      {
        id: 'm1',
        url: CLOUD_URL,
        mimeType: 'image/jpeg',
        size: 100,
        cloudinaryId: 'diary/photo',
      },
    ]
    const content = JSON.stringify({ type: 'doc', content: [] })

    const merged = JSON.parse(mergeMediaIntoContent(content, media))
    expect(merged.content).toEqual([{ type: 'image', attrs: { src: CLOUD_URL } }])
  })

  it('does not duplicate images already present', () => {
    const media: Media[] = [
      {
        id: 'm1',
        url: CLOUD_URL,
        mimeType: 'image/jpeg',
        size: 100,
        cloudinaryId: 'diary/photo',
      },
    ]
    const content = JSON.stringify({
      type: 'doc',
      content: [{ type: 'image', attrs: { src: CLOUD_URL } }],
    })

    expect(mergeMediaIntoContent(content, media)).toBe(content)
  })

  it('returns content unchanged when there is no media', () => {
    const content = JSON.stringify({ type: 'doc', content: [] })
    expect(mergeMediaIntoContent(content, [])).toBe(content)
  })

  it('rebuilds a doc from malformed content', () => {
    const media: Media[] = [
      {
        id: 'm1',
        url: CLOUD_URL,
        mimeType: 'image/jpeg',
        size: 100,
        cloudinaryId: 'diary/photo',
      },
    ]
    const merged = JSON.parse(mergeMediaIntoContent('garbage', media))
    expect(merged.type).toBe('doc')
    expect(merged.content).toHaveLength(1)
  })
})
