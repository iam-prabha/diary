import { useState, useRef } from 'react'
import { X, Plus, Check } from 'lucide-react'
import type { Tag } from '@/types'

interface TagInputProps {
  allTags: Tag[]
  selected: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ allTags, selected, onChange }: TagInputProps) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const query = input.trim().toLowerCase()
  const suggestions = allTags.filter(t =>
    t.name.includes(query) && !selected.includes(t.name)
  ).slice(0, 6)

  const addTag = (name: string) => {
    const normalized = name.trim().toLowerCase()
    if (!normalized || selected.includes(normalized)) return
    onChange([...selected, normalized])
    setInput('')
    setHighlight(0)
    inputRef.current?.focus()
  }

  const removeTag = (name: string) => {
    onChange(selected.filter(t => t !== name))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0) addTag(suggestions[highlight].name)
      else addTag(input)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(h => Math.min(h + 1, Math.max(suggestions.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === 'Backspace' && input === '' && selected.length > 0) {
      removeTag(selected[selected.length - 1])
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-2">
        {selected.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--accent-soft))] px-3 py-1 text-xs font-medium text-[rgb(var(--ink))]">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: allTags.find(t => t.name === tag)?.color || '#c4785e' }} />
            {tag}
            <button onClick={() => removeTag(tag)} className="text-[rgb(var(--ink-soft))] hover:text-[rgb(var(--ink))]" aria-label={`Remove ${tag}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setHighlight(0) }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? 'Add tags…' : ''}
          className="min-w-[100px] flex-1 border-0 bg-transparent text-sm text-[rgb(var(--ink))] placeholder:text-[rgb(var(--ink-faint))] focus:outline-none"
        />
      </div>

      {focused && input && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] shadow-lg">
          {suggestions.map((tag, i) => (
            <button
              key={tag.id}
              onMouseDown={e => { e.preventDefault(); addTag(tag.name) }}
              onMouseEnter={() => setHighlight(i)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                i === highlight ? 'bg-[rgb(var(--paper-line))]/40' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: tag.color || '#c4785e' }} />
                {tag.name}
                {tag.count ? <span className="text-xs text-[rgb(var(--ink-faint))]">({tag.count})</span> : null}
              </span>
              <Check className="size-3 text-[rgb(var(--accent))]" />
            </button>
          ))}
        </div>
      )}

      {focused && input && suggestions.length === 0 && !selected.includes(query) && (
        <button
          onMouseDown={e => { e.preventDefault(); addTag(input) }}
          className="absolute left-0 right-0 top-full z-20 mt-1 flex items-center gap-2 rounded-xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] px-4 py-2.5 text-left text-sm text-[rgb(var(--ink-soft))] shadow-lg"
        >
          <Plus className="size-4 text-[rgb(var(--accent))]" />
          Create tag “{input}”
        </button>
      )}
    </div>
  )
}
