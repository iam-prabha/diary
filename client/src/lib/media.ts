import type { Media } from '@/types'

export function getOptimizedUrl(url: string, width: number): string {
  if (url.includes('cloudinary.com') && !url.includes('/image/upload/w_')) {
    return url.replace('/image/upload/', `/image/upload/w_${width},q_auto,f_auto/`)
  }
  return url
}

export function publicIdFromUrl(url: string): string | null {
  const marker = '/image/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const parts = url.slice(idx + marker.length).split('/')
  if (/^v\d+$/.test(parts[0] ?? '')) parts.shift()
  const last = parts[parts.length - 1]
  if (last) parts[parts.length - 1] = last.replace(/\.[a-zA-Z0-9]+$/, '')
  return parts.join('/') || null
}

export function imagesFromContent(json: string): Array<{ src: string; publicId: string | null }> {
  const result: Array<{ src: string; publicId: string | null }> = []
  try {
    const doc = JSON.parse(json) as {
      content?: Array<{ type?: string; attrs?: { src?: string }; content?: unknown[] }>
    }
    const walk = (nodes: typeof doc.content) => {
      for (const node of nodes ?? []) {
        if (node.type === 'image' && node.attrs?.src) {
          result.push({ src: node.attrs.src, publicId: publicIdFromUrl(node.attrs.src) })
        }
        if (node.content) walk(node.content as typeof doc.content)
      }
    }
    walk(doc.content)
  } catch {
    // ignore malformed content
  }
  return result
}

export function mergeMediaIntoContent(content: string, media: Media[]): string {
  if (media.length === 0) return content
  let doc: { type: string; content?: Array<{ type: string; attrs?: { src?: string }; content?: unknown[] }> }
  try {
    doc = JSON.parse(content)
  } catch {
    doc = { type: 'doc', content: [] }
  }
  if (!Array.isArray(doc.content)) doc.content = []
  const nodes = doc.content
  const existing = new Set<string>()
  const walk = (nodes: typeof doc.content) => {
    for (const node of nodes ?? []) {
      if (node.type === 'image' && node.attrs?.src) existing.add(node.attrs.src)
      if (node.content) walk(node.content as typeof doc.content)
    }
  }
  walk(nodes)
  const missing = media
    .filter(m => !existing.has(m.url))
    .map(m => ({ type: 'image', attrs: { src: m.url } }))
  if (missing.length > 0) {
    nodes.push(...missing)
    return JSON.stringify(doc)
  }
  return content
}
