import { useState } from 'react'
import { Archive, CheckCheck, Mail, Phone, Reply, Trash2 } from 'lucide-react'
import type { Enquiry, EnquiryStatus } from '@/types/database'
import { useFilters } from '@/hooks/useFilters'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { repo } from '@/services/repository'
import { errorMessage } from '@/services/errors'
import { cn } from '@/utils/cn'
import { formatDate, truncate } from '@/utils/format'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { StatusPill } from '@/components/admin/Cells'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog, Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { EmptyState, ErrorState } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'

const PAGE_SIZE = 20
const TABS: { value: string; label: string }[] = [
  { value: '', label: 'Inbox' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'responded', label: 'Responded' },
  { value: 'archived', label: 'Archived' },
]

export default function EnquiriesPage() {
  const toast = useToast()
  const { values, page, set } = useFilters(['status', 'q'] as const)
  const [open, setOpen] = useState<Enquiry | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const q = useQuery(`admin:enquiries:${values.status}:${values.q}:${page}`, () =>
    repo('enquiries').list({
      eq: { status: values.status || undefined },
      neq: { status: values.status ? undefined : 'archived' },
      search: values.q ? { columns: ['name', 'email', 'subject', 'message'], term: values.q } : undefined,
      order: [{ column: 'created_at', ascending: false }],
      range: { from: (page - 1) * PAGE_SIZE, to: page * PAGE_SIZE - 1 },
    }),
  )

  const setStatus = async (e: Enquiry, status: EnquiryStatus, quiet = false) => {
    try {
      const updated = (await repo('enquiries').update(e.id, { status })) as Enquiry
      invalidateQueries('admin:enquiries', 'admin:dashboard')
      q.reload()
      if (open?.id === e.id) setOpen(updated)
      if (!quiet) toast.success(`Marked as ${status}`)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const openEnquiry = (e: Enquiry) => {
    setOpen(e)
    if (e.status === 'new') void setStatus(e, 'read', true)
  }

  const remove = async () => {
    if (!open) return
    setBusy(true)
    try {
      await repo('enquiries').remove(open.id)
      toast.success('Enquiry deleted')
      setConfirmDelete(false)
      setOpen(null)
      invalidateQueries('admin:enquiries', 'admin:dashboard')
      q.reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Enquiries" description="Messages submitted through the contact form." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-white p-1 ring-1 ring-line scrollbar-none" role="tablist" aria-label="Enquiry status">
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={values.status === t.value}
              onClick={() => set('status', t.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap',
                values.status === t.value ? 'bg-navy-900 text-white' : 'text-muted hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <SearchBar value={values.q} onChange={(v) => set('q', v)} placeholder="Search enquiries" className="lg:ml-auto lg:w-80" />
      </div>

      {q.error && !q.data ? (
        <ErrorState message={q.error} onRetry={q.reload} />
      ) : (
        <DataTable
          caption="Enquiries"
          rows={(q.data?.rows ?? []) as unknown as Record<string, unknown>[]}
          loading={q.loading}
          onRowClick={(r) => openEnquiry(r as unknown as Enquiry)}
          empty={<EmptyState title="No enquiries here" description="New contact form submissions will appear in the inbox." />}
          columns={[
            {
              key: 'name',
              label: 'From',
              render: (r) => (
                <div className="min-w-0">
                  <p className={cn('truncate', r.status === 'new' ? 'font-semibold text-ink' : 'font-medium text-ink/80')}>{String(r.name)}</p>
                  <p className="truncate text-xs text-muted">{String(r.email)}</p>
                </div>
              ),
            },
            {
              key: 'subject',
              label: 'Subject',
              render: (r) => (
                <div className="min-w-0">
                  <p className={cn('truncate', r.status === 'new' && 'font-semibold')}>{String(r.subject)}</p>
                  <p className="truncate text-xs text-muted">{truncate(String(r.message), 80)}</p>
                </div>
              ),
            },
            { key: 'created_at', label: 'Date', render: (r) => <span className="whitespace-nowrap text-muted">{formatDate(String(r.created_at))}</span> },
            { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
          ]}
        />
      )}

      <Pagination className="mt-6" page={page} pageSize={PAGE_SIZE} total={q.data?.count ?? 0} onChange={(p) => set('page', p)} />

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.subject ?? ''}
        description={open ? `Received ${formatDate(open.created_at, true)}` : undefined}
        size="lg"
        footer={
          open && (
            <>
              <Button
                variant="ghost"
                caps={false}
                size="sm"
                className="mr-auto text-red-600 hover:bg-red-50"
                icon={<Trash2 className="size-4" aria-hidden />}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
              {open.status !== 'archived' && (
                <Button variant="outline" caps={false} size="sm" icon={<Archive className="size-4" aria-hidden />} onClick={() => setStatus(open, 'archived')}>
                  Archive
                </Button>
              )}
              {open.status !== 'responded' && (
                <Button
                  variant="outline"
                  caps={false}
                  size="sm"
                  icon={<CheckCheck className="size-4" aria-hidden />}
                  onClick={() => setStatus(open, 'responded')}
                >
                  Mark responded
                </Button>
              )}
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 text-xs font-semibold text-white hover:bg-navy-700"
              >
                <Reply className="size-4" aria-hidden /> Reply by email
              </a>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <p className="font-semibold text-ink">{open.name}</p>
              <a href={`mailto:${open.email}`} className="inline-flex items-center gap-1.5 text-navy-700 hover:underline">
                <Mail className="size-4" aria-hidden /> {open.email}
              </a>
              {open.phone && (
                <a href={`tel:${open.phone}`} className="inline-flex items-center gap-1.5 text-navy-700 hover:underline">
                  <Phone className="size-4" aria-hidden /> {open.phone}
                </a>
              )}
              <StatusPill status={open.status} />
            </div>
            <p className="rounded-lg bg-paper p-4 text-sm leading-6 whitespace-pre-wrap text-ink">{open.message}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete enquiry?"
        message="This enquiry will be permanently deleted. Consider archiving it instead."
        confirmLabel="Delete permanently"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
