import { PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-[rgb(var(--accent-soft))]">
        <PenLine className="size-8 text-[rgb(var(--accent))]" />
      </div>
      <h3 className="mb-2 font-serif-display text-2xl text-[rgb(var(--ink))]">
        {searching ? 'No entries found' : 'Your blank page awaits'}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-[rgb(var(--ink-soft))]">
        {searching
          ? 'Try a different search term or clear your filters.'
          : 'Write your first entry — capture a thought, a memory, or an idea.'}
      </p>
      {!searching && (
        <Link
          to="/new"
          className="rounded-full bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Start writing
        </Link>
      )}
    </div>
  )
}
