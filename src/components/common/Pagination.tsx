import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
  className?: string
  compact?: boolean
}

function pagesToShow(page: number, last: number): (number | '…')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const set = new Set([1, last, page - 1, page, page + 1].filter((p) => p >= 1 && p <= last))
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

export function Pagination({ page, pageSize, total, onChange, className, compact }: PaginationProps) {
  const last = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  const btn = 'grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-medium transition'

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      <button
        className={cn(btn, 'text-navy-900 hover:bg-navy-50 disabled:opacity-30')}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {compact ? (
        <span className="px-3 text-sm text-muted">
          Page {page} of {last}
        </span>
      ) : (
        pagesToShow(page, last).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(btn, p === page ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-navy-50')}
            >
              {p}
            </button>
          ),
        )
      )}
      <button
        className={cn(btn, 'text-navy-900 hover:bg-navy-50 disabled:opacity-30')}
        onClick={() => onChange(page + 1)}
        disabled={page >= last}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  )
}
