import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  /** Debounce in ms before onChange fires. */
  delay?: number
}

export function SearchBar({ value, onChange, placeholder = 'Search…', label = 'Search', className, delay = 300 }: SearchBarProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (draft === value) return
    const t = window.setTimeout(() => onChange(draft), delay)
    return () => window.clearTimeout(t)
  }, [draft, value, delay, onChange])

  return (
    <div className={cn('relative', className)} role="search">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-11 w-full rounded-full border border-line bg-white pr-10 pl-10 text-sm text-ink transition placeholder:text-muted-light focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft('')
            onChange('')
          }}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-paper hover:text-ink"
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}
