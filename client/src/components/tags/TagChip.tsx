import type { Tag } from '@/types'

export function TagChip({ tag, onClick, active }: { tag: Tag; onClick?: () => void; active?: boolean }) {
  const content = (
    <>
      <span
        className="mr-1 inline-block size-1.5 rounded-full"
        style={{ backgroundColor: tag.color || '#c4785e' }}
      />
      {tag.name}
    </>
  )

  const className = `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
    active
      ? 'bg-[rgb(var(--accent))] text-white'
      : 'bg-[rgb(var(--accent-soft))] text-[rgb(var(--ink))]'
  }`

  if (onClick) {
    return <button onClick={onClick} className={className}>{content}</button>
  }
  return <span className={className}>{content}</span>
}
