import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEntries } from '@/stores/useEntries'
import { useTags } from '@/stores/useTags'
import { SearchBar } from '@/components/search/SearchBar'
import { TagFilter } from '@/components/tags/TagFilter'
import { EntryCard } from '@/components/entries/EntryCard'
import { EntryCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/entries/EmptyState'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

export function Home() {
  const { entries, loading, loadingMore, hasMore, error, fetchEntries, q } = useEntries()
  const { fetchTags } = useTags()

  useEffect(() => { fetchEntries(true) }, [fetchEntries])
  useEffect(() => { fetchTags(true) }, [fetchTags])

  const sentinelRef = useInfiniteScroll(() => fetchEntries(), hasMore, loadingMore)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <SearchBar />
        <Link
          to="/new"
          className="inline-flex size-10 shrink-0 touch-target items-center justify-center rounded-full bg-[rgb(var(--accent))] text-white transition-transform hover:scale-105"
          aria-label="New entry"
        >
          <Plus className="size-5" />
        </Link>
      </div>

      <div className="mb-8">
        <TagFilter />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <EntryCardSkeleton key={i} />)}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState searching={Boolean(q)} />
      ) : (
        <>
          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            {entries.map(entry => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <EntryCard entry={entry} />
              </motion.div>
            ))}
          </div>

          {loadingMore && (
            <div className="mt-4 space-y-4">
              {[...Array(2)].map((_, i) => <EntryCardSkeleton key={`more-${i}`} />)}
            </div>
          )}

          <div ref={sentinelRef} className="h-4" />
        </>
      )}
    </div>
  )
}
