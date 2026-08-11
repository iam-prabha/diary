import type { Prisma } from '../generated/prisma/client.js'

type EntryInclude = Prisma.EntryInclude

export const entryInclude: EntryInclude = {
  tags: { include: { tag: true } },
  media: true,
}

export function extractTextFromTipTap(json: string): string {
  try {
    const doc = JSON.parse(json)
    return extractText(doc)
  } catch {
    return ''
  }
}

function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { type?: string; text?: string; content?: unknown[] }
  if (n.type === 'text') return n.text || ''
  if (Array.isArray(n.content)) return n.content.map(extractText).join(' ')
  return ''
}
