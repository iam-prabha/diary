import { Search, X } from 'lucide-react'
import { useEntries } from '@/stores/useEntries'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

export function SearchBar() {
  const { q, setQ } = useEntries()
  const [input, setInput] = useState(q)
  const debouncedInput = useDebounce(input, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debouncedInput !== q) setQ(debouncedInput)
  }, [debouncedInput, q, setQ])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--ink-faint))]" />
      <input
        ref={inputRef}
        data-search-input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Search your journal… ⌘K"
        className="w-full rounded-xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] py-2.5 pl-10 pr-10 text-sm text-[rgb(var(--ink))] placeholder:text-[rgb(var(--ink-faint))] focus:border-[rgb(var(--accent))] focus:outline-none"
      />
      {input && (
        <button
          onClick={() => setInput('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--ink-faint))] hover:text-[rgb(var(--ink))]"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
