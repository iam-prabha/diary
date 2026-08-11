import { useTags } from '@/stores/useTags'
import { useEntries } from '@/stores/useEntries'

export function TagFilter() {
  const { tags } = useTags()
  const { tag, setTag } = useEntries()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setTag(null)}
        className={`touch-target rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          tag === null
            ? 'bg-[rgb(var(--accent))] text-white'
            : 'border border-[rgb(var(--paper-line))] text-[rgb(var(--ink-soft))] hover:border-[rgb(var(--accent))]'
        }`}
      >
        All
      </button>
      {tags.map(t => (
        <button
          key={t.id}
          onClick={() => setTag(tag === t.name ? null : t.name)}
          className={`touch-target rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            tag === t.name
              ? 'bg-[rgb(var(--accent))] text-white'
              : 'border border-[rgb(var(--paper-line))] text-[rgb(var(--ink-soft))] hover:border-[rgb(var(--accent))]'
          }`}
        >
          <span className="mr-1 inline-block size-1.5 rounded-full" style={{ backgroundColor: t.color || '#c4785e' }} />
          {t.name}
        </button>
      ))}
    </div>
  )
}
