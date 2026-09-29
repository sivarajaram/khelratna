import type { ReactNode } from 'react'
import type { ColumnDef, Row } from '@/admin/types'
import { cn } from '@/utils/cn'
import { Skeleton } from '@/components/common/States'

interface DataTableProps {
  columns: ColumnDef[]
  rows: Row[]
  rowKey?: string
  loading?: boolean
  onRowClick?: (row: Row) => void
  actions?: (row: Row, index: number) => ReactNode
  empty?: ReactNode
  caption: string
}

/** Compact admin table. Scrolls horizontally on narrow screens rather than squashing columns. */
export function DataTable({ columns, rows, rowKey = 'id', loading, onRowClick, actions, empty, caption }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line bg-paper/70">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn('px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-muted uppercase', c.className)}>
                  {c.label}
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && !rows.length
              ? Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                    {actions && <td />}
                  </tr>
                ))
              : rows.map((row, i) => (
                  <tr
                    key={String(row[rowKey])}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-paper/70', loading && 'opacity-60')}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={cn('max-w-xs px-4 py-3', c.className)}>
                        {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {actions(row, i)}
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && !rows.length && <div className="p-6">{empty}</div>}
    </div>
  )
}
