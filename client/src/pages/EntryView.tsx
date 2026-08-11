import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Pencil, Trash2, Download, MoreVertical } from 'lucide-react'
import { api } from '@/lib/api'
import type { Entry } from '@/types'
import { TagChip } from '@/components/tags/TagChip'
import { MediaGallery } from '@/components/media/MediaGallery'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useEntries } from '@/stores/useEntries'
import { renderTipTapHTML } from '@/lib/tipTap'
import { exportEntryAsJSON, exportEntryAsMarkdown } from '@/lib/export'
import { Loading } from '@/components/ui/Loading'

export function EntryView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { removeFromList } = useEntries()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    api.get(`/entries/${id}`)
      .then(res => setEntry(res.data))
      .catch(() => navigate('/diary'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleDelete = async () => {
    await api.delete(`/entries/${id}`)
    removeFromList(id!)
    navigate('/diary')
  }

  if (loading) return <Loading />
  if (!entry) return null

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/diary"
          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--ink-soft))] hover:text-[rgb(var(--accent))]"
        >
          <ArrowLeft className="size-4" />
          Back to journal
        </Link>

        <div className="relative flex items-center gap-2">
          <Link
            to={`/edit/${entry.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--paper-line))] px-4 py-1.5 text-sm text-[rgb(var(--ink-soft))] transition-colors hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
          >
            <Pencil className="size-4" />
            Edit
          </Link>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="grid size-9 touch-target place-items-center rounded-full border border-[rgb(var(--paper-line))] text-[rgb(var(--ink-soft))] hover:text-[rgb(var(--ink))]"
            aria-label="More actions"
          >
            <MoreVertical className="size-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 z-10 w-44 overflow-hidden rounded-xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] shadow-lg">
              <button
                onClick={() => exportEntryAsJSON(entry)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[rgb(var(--ink))] hover:bg-[rgb(var(--paper-line))]/30"
              >
                <Download className="size-4" /> Export JSON
              </button>
              <button
                onClick={() => exportEntryAsMarkdown(entry)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[rgb(var(--ink))] hover:bg-[rgb(var(--paper-line))]/30"
              >
                <Download className="size-4" /> Export Markdown
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex w-full items-center gap-2 border-t border-[rgb(var(--paper-line))] px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <header className="mb-6 border-b border-[rgb(var(--paper-line))] pb-6">
        <h1 className="mb-3 font-serif-display text-4xl text-[rgb(var(--ink))]">{entry.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[rgb(var(--ink-faint))]">
          <time dateTime={entry.createdAt}>
            {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
          </time>
          <span>·</span>
          <time>{format(new Date(entry.createdAt), 'h:mm a')}</time>
          <span
            title={format(new Date(entry.updatedAt), 'MMMM d, yyyy h:mm a')}
          >
            · updated {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
          </span>
        </div>
        {entry.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.tags.map(et => <TagChip key={et.tag.id} tag={et.tag} />)}
          </div>
        )}
      </header>

      <div
        className="prose prose-lg max-w-none font-sans [&_h1]:font-serif-display [&_h2]:font-serif-display [&_h3]:font-serif-display"
        dangerouslySetInnerHTML={{ __html: renderTipTapHTML(entry.content) }}
      />

      {entry.media.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-serif-display text-xl text-[rgb(var(--ink))]">Photos</h2>
          <MediaGallery media={entry.media} />
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete this entry?"
        message="This action cannot be undone."
      />
    </article>
  )
}
