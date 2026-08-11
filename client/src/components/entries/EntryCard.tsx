import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import type { Entry } from '@/types'
import { TagChip } from '@/components/tags/TagChip'

export function EntryCard({ entry }: { entry: Entry }) {
  const excerpt = entry.contentText.length > 160
    ? entry.contentText.slice(0, 160) + '…'
    : entry.contentText

  return (
    <Link
      to={`/entry/${entry.id}`}
      className="group block rounded-2xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between">
        <time className="text-xs text-[rgb(var(--ink-faint))]">
          {format(new Date(entry.createdAt), 'MMM d, yyyy · h:mm a')}
        </time>
        <span className="font-serif-display text-lg text-[rgb(var(--accent))] opacity-0 transition-opacity group-hover:opacity-100">✦</span>
      </div>

      <h3 className="mb-2 font-serif-display text-xl text-[rgb(var(--ink))]">{entry.title}</h3>

      <p className="mb-3 text-sm leading-relaxed text-[rgb(var(--ink-soft))]">{excerpt}</p>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map(et => <TagChip key={et.tag.id} tag={et.tag} />)}
        </div>
      )}
    </Link>
  )
}
