import { useState, type ReactNode } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Modal } from './Modal'
import { Button } from './Button'

export interface FilterOption {
  value: string
  label: string
}

export interface SelectFilter {
  key: string
  label: string
  value: string
  options: FilterOption[]
}

interface FilterBarProps {
  /** Primary segmented filter shown as chips (e.g. status or category). */
  chips?: { label: string; value: string; options: FilterOption[]; onChange: (value: string) => void }
  selects?: SelectFilter[]
  onSelect?: (key: string, value: string) => void
  search?: ReactNode
  onReset?: () => void
  activeCount?: number
  className?: string
  resultLabel?: string
}

function SelectControl({ filter, onSelect, full }: { filter: SelectFilter; onSelect: (k: string, v: string) => void; full?: boolean }) {
  return (
    <label className={cn('relative block', full ? 'w-full' : 'min-w-40')}>
      <span className="sr-only">{filter.label}</span>
      <select
        value={filter.value}
        onChange={(e) => onSelect(filter.key, e.target.value)}
        className={cn(
          'h-11 w-full cursor-pointer appearance-none rounded-full border bg-white pr-10 pl-4 text-sm transition focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15 focus:outline-none',
          filter.value ? 'border-navy-900 font-medium text-navy-900' : 'border-line text-muted',
        )}
      >
        <option value="">{filter.label}: All</option>
        {filter.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </label>
  )
}

/** Horizontal filters on desktop; chips scroll and the selects move into a bottom sheet on mobile. */
export function FilterBar({ chips, selects = [], onSelect = () => {}, search, onReset, activeCount = 0, className, resultLabel }: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const selectActive = selects.filter((s) => s.value).length

  return (
    <div className={cn('space-y-4', className)}>
      {chips && (
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0" role="group" aria-label={chips.label}>
          <div className="flex w-max gap-2">
            {[{ value: '', label: 'All' }, ...chips.options].map((o) => {
              const active = chips.value === o.value
              return (
                <button
                  key={o.value || 'all'}
                  onClick={() => chips.onChange(o.value)}
                  aria-pressed={active}
                  className={cn(
                    'h-10 rounded-full px-4 text-[0.78rem] font-semibold tracking-[0.08em] uppercase transition',
                    active ? 'bg-navy-900 text-white shadow-sm' : 'bg-white text-navy-900 ring-1 ring-line ring-inset hover:ring-navy-900/40',
                  )}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {(selects.length > 0 || search) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {search && <div className="md:w-72 lg:w-80">{search}</div>}

          {/* Desktop selects */}
          <div className="hidden flex-1 flex-wrap items-center gap-2 md:flex">
            {selects.map((f) => (
              <SelectControl key={f.key} filter={f} onSelect={onSelect} />
            ))}
          </div>

          {/* Mobile filter trigger */}
          {selects.length > 0 && (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium text-navy-900 md:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filters
              {selectActive > 0 && <span className="grid size-5 place-items-center rounded-full bg-red-600 text-[0.65rem] text-white">{selectActive}</span>}
            </button>
          )}

          <div className="flex items-center justify-between gap-4 md:ml-auto">
            {resultLabel && <p className="text-sm text-muted">{resultLabel}</p>}
            {onReset && activeCount > 0 && (
              <button onClick={onReset} className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                <X className="size-3.5" aria-hidden /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        sheet
        footer={
          <>
            {onReset && (
              <Button variant="ghost" size="sm" caps={false} onClick={onReset}>
                Clear all
              </Button>
            )}
            <Button variant="navy" size="sm" caps={false} onClick={() => setSheetOpen(false)}>
              Show results
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {selects.map((f) => (
            <div key={f.key}>
              <p className="mb-1.5 text-xs font-semibold tracking-wider text-muted uppercase">{f.label}</p>
              <SelectControl filter={f} onSelect={onSelect} full />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
