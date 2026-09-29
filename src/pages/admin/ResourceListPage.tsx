import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2, UploadCloud } from 'lucide-react'
import { resources, rowTitle } from '@/admin/resources'
import type { Row } from '@/admin/types'
import { useFilters } from '@/hooks/useFilters'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { repo } from '@/services/repository'
import { errorMessage } from '@/services/errors'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/Modal'
import { EmptyState, ErrorState } from '@/components/common/States'
import { LinkButton, Button } from '@/components/common/Button'
import { useToast } from '@/components/common/Toast'
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog'
import NotFoundAdmin from './NotFoundAdmin'

const PAGE_SIZE = 20
const iconBtn = 'inline-grid size-8 place-items-center rounded-md text-muted transition hover:bg-paper hover:text-ink disabled:opacity-30'

export default function ResourceListPage() {
  const { resource = '' } = useParams()
  const config = resources[resource]
  const navigate = useNavigate()
  const toast = useToast()
  const { values, page, set } = useFilters(['q', 'status'] as const)
  const [confirm, setConfirm] = useState<{ row: Row; action: 'delete' | 'archive' } | null>(null)
  const [busy, setBusy] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)

  const q = useQuery(config ? `admin:list:${config.table}:${values.q}:${values.status}:${page}` : null, () => {
    const archived = values.status === 'archived' && config.archive?.field !== config.statusField
    return repo(config.table).list({
      eq: archived
        ? { [config.archive!.field]: config.archive!.value as boolean }
        : {
            [config.statusField ?? '']: values.status || undefined,
            ...(config.archive && config.archive.field !== config.statusField ? { [config.archive.field]: false } : {}),
          },
      search: values.q ? { columns: config.searchColumns, term: values.q } : undefined,
      order: config.defaultOrder,
      range: { from: (page - 1) * PAGE_SIZE, to: page * PAGE_SIZE - 1 },
    }) as unknown as Promise<{ rows: Row[]; count: number }>
  })

  if (!config) return <NotFoundAdmin />

  const refresh = () => {
    invalidateQueries()
    q.reload()
  }

  const runConfirm = async () => {
    if (!confirm) return
    setBusy(true)
    try {
      const id = String(confirm.row.id)
      if (confirm.action === 'delete') {
        await repo(config.table).remove(id)
        toast.success(`${config.singular} deleted`)
      } else {
        const archived = confirm.row[config.archive!.field] === config.archive!.value
        await repo(config.table).update(id, { [config.archive!.field]: archived ? config.archive!.restore : config.archive!.value } as never)
        toast.success(archived ? `${config.singular} restored` : `${config.singular} archived`)
      }
      setConfirm(null)
      refresh()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  // Reorder: renumber the visible page so sort_order is unique, then swap the two rows
  const canReorder = config.reorderable && !values.q && !values.status
  const move = async (index: number, delta: number) => {
    const rows = [...(q.data?.rows ?? [])]
    const j = index + delta
    if (j < 0 || j >= rows.length) return
    ;[rows[index], rows[j]] = [rows[j], rows[index]]
    const offset = (page - 1) * PAGE_SIZE
    try {
      await Promise.all(rows.map((r, k) => (r.sort_order !== offset + k ? repo(config.table).update(String(r.id), { sort_order: offset + k } as never) : null)))
      refresh()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const statusOptions = [
    ...(config.statusOptions ?? []),
    ...(config.archive && config.archive.field !== config.statusField ? [{ value: 'archived', label: 'Archived' }] : []),
  ]

  return (
    <>
      <PageHeader
        title={config.plural}
        description={config.description}
        actions={
          <>
            {config.key === 'gallery' && (
              <Button variant="outline" caps={false} size="sm" icon={<UploadCloud className="size-4" aria-hidden />} onClick={() => setBulkOpen(true)}>
                Bulk upload
              </Button>
            )}
            <LinkButton to={`/admin/${config.key}/new`} variant="navy" caps={false} size="sm" icon={<Plus className="size-4" aria-hidden />}>
              Add {config.singular.toLowerCase()}
            </LinkButton>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={values.q} onChange={(v) => set('q', v)} placeholder={`Search ${config.plural.toLowerCase()}`} className="sm:w-80" />
        {statusOptions.length > 0 && (
          <select
            value={values.status}
            onChange={(e) => set('status', e.target.value)}
            className="input h-11 rounded-full sm:w-48"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        {q.data && <p className="text-sm text-muted sm:ml-auto">{q.data.count} total</p>}
      </div>

      {q.error && !q.data ? (
        <ErrorState message={q.error} onRetry={q.reload} />
      ) : (
        <DataTable
          caption={config.plural}
          columns={config.columns}
          rows={q.data?.rows ?? []}
          loading={q.loading}
          onRowClick={(row) => navigate(`/admin/${config.key}/${row.id}`)}
          empty={
            <EmptyState
              title={values.q || values.status ? 'Nothing matches these filters' : `No ${config.plural.toLowerCase()} yet`}
              action={
                !values.q && !values.status ? (
                  <LinkButton to={`/admin/${config.key}/new`} variant="navy" caps={false} size="sm" icon={<Plus className="size-4" aria-hidden />}>
                    Add the first one
                  </LinkButton>
                ) : undefined
              }
            />
          }
          actions={(row, i) => {
            const publicUrl = config.publicPath?.(row)
            const archived = config.archive && row[config.archive.field] === config.archive.value
            const title = rowTitle(config, row)
            return (
              <div className="inline-flex items-center gap-0.5">
                {canReorder && (
                  <>
                    <button className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${title} up`}>
                      <ArrowUp className="size-4" />
                    </button>
                    <button className={iconBtn} onClick={() => move(i, 1)} disabled={i === (q.data?.rows.length ?? 0) - 1} aria-label={`Move ${title} down`}>
                      <ArrowDown className="size-4" />
                    </button>
                  </>
                )}
                {publicUrl && (
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={iconBtn} aria-label={`View ${title} on site`} title="View on site">
                    <ExternalLink className="size-4" />
                  </a>
                )}
                <Link to={`/admin/${config.key}/${row.id}`} className={iconBtn} aria-label={`Edit ${title}`} title="Edit">
                  <Pencil className="size-4" />
                </Link>
                {config.archive && (
                  <button
                    className={iconBtn}
                    onClick={() => setConfirm({ row, action: 'archive' })}
                    aria-label={`${archived ? 'Restore' : 'Archive'} ${title}`}
                    title={archived ? 'Restore' : 'Archive'}
                  >
                    {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
                  </button>
                )}
                <button
                  className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
                  onClick={() => setConfirm({ row, action: 'delete' })}
                  aria-label={`Delete ${title}`}
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )
          }}
        />
      )}

      <Pagination className="mt-6" page={page} pageSize={PAGE_SIZE} total={q.data?.count ?? 0} onChange={(p) => set('page', p)} />

      <ConfirmDialog
        open={!!confirm}
        loading={busy}
        tone={confirm?.action === 'delete' ? 'danger' : 'navy'}
        title={
          confirm?.action === 'delete'
            ? `Delete ${config.singular.toLowerCase()}?`
            : confirm && config.archive && confirm.row[config.archive.field] === config.archive.value
              ? `Restore ${config.singular.toLowerCase()}?`
              : `Archive ${config.singular.toLowerCase()}?`
        }
        message={
          confirm?.action === 'delete'
            ? `“${confirm ? rowTitle(config, confirm.row) : ''}” will be permanently deleted. This cannot be undone.`
            : 'Archived items are hidden from the public website but can be restored at any time.'
        }
        confirmLabel={confirm?.action === 'delete' ? 'Delete permanently' : 'Confirm'}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      {config.key === 'gallery' && <BulkUploadDialog open={bulkOpen} onClose={() => setBulkOpen(false)} onDone={refresh} />}
    </>
  )
}
