import { useCallback, useId, useMemo, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router'
import { ExternalLink, Save, Trash2 } from 'lucide-react'
import { resources, rowTitle } from '@/admin/resources'
import type { Row } from '@/admin/types'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { repo } from '@/services/repository'
import { errorMessage } from '@/services/errors'
import { formatDate } from '@/utils/format'
import { PageHeader } from '@/components/admin/PageHeader'
import { ResourceForm } from '@/components/admin/ResourceForm'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/Modal'
import { ErrorState, LoadingState } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import NotFoundAdmin from './NotFoundAdmin'

export default function ResourceEditPage() {
  const { resource = '', id } = useParams()
  const config = resources[resource]
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()
  const formId = useId()
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const q = useQuery(config && id ? `admin:row:${config.table}:${id}` : null, () => repo(config.table).findOne('id', id!) as Promise<Row | null>)
  const row = useMemo<Row | null | undefined>(() => (isNew ? config?.defaults : q.data), [isNew, config, q.data])

  // Warn before leaving with unsaved changes
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !saving && currentLocation.pathname !== nextLocation.pathname)
  const onDirtyChange = useCallback((d: boolean) => setDirty(d), [])

  if (!config) return <NotFoundAdmin />
  if (!isNew && q.data === null) return <NotFoundAdmin message={`This ${config.singular.toLowerCase()} no longer exists.`} />

  const save = async (values: Row) => {
    setSaving(true)
    try {
      if (isNew) {
        const created = (await repo(config.table).insert(values as never)) as unknown as Row
        toast.success(`${config.singular} created`)
        invalidateQueries()
        setDirty(false)
        navigate(`/admin/${config.key}/${created.id}`, { replace: true })
      } else {
        await repo(config.table).update(id!, values as never)
        toast.success('Changes saved')
        invalidateQueries()
        setDirty(false)
        q.reload()
      }
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setSaving(true)
    try {
      await repo(config.table).remove(id!)
      toast.success(`${config.singular} deleted`)
      invalidateQueries()
      setDirty(false)
      navigate(`/admin/${config.key}`, { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
      setSaving(false)
    }
  }

  const publicUrl = !isNew && row ? config.publicPath?.(row) : null
  const title = isNew ? `New ${config.singular.toLowerCase()}` : row ? rowTitle(config, row) : 'Loading…'

  return (
    <>
      <PageHeader
        back={{ to: `/admin/${config.key}`, label: config.plural }}
        title={title}
        description={!isNew && row?.updated_at ? `Last updated ${formatDate(String(row.updated_at))}` : undefined}
        actions={
          <>
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-navy-800 ring-1 ring-line hover:bg-white"
              >
                View on site <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
            {!isNew && (
              <Button
                variant="ghost"
                caps={false}
                size="sm"
                className="text-red-600 hover:bg-red-50"
                icon={<Trash2 className="size-4" aria-hidden />}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
          </>
        }
      />

      {!row ? (
        q.error ? (
          <ErrorState message={q.error} onRetry={q.reload} />
        ) : (
          <LoadingState />
        )
      ) : (
        <ResourceForm config={config} row={row} isNew={isNew} formId={formId} onSubmit={save} onDirtyChange={onDirtyChange} />
      )}

      {/* Sticky save bar */}
      {row && (
        <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-end gap-3">
            {dirty && <span className="mr-auto text-xs text-amber-700">Unsaved changes</span>}
            <Button variant="ghost" caps={false} size="sm" onClick={() => navigate(`/admin/${config.key}`)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} variant="navy" caps={false} size="sm" loading={saving} icon={<Save className="size-4" aria-hidden />}>
              {isNew ? `Create ${config.singular.toLowerCase()}` : 'Save changes'}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${config.singular.toLowerCase()}?`}
        message={`“${title}” will be permanently deleted. This cannot be undone.${config.archive ? ' To hide it from the website instead, archive it from the list.' : ''}`}
        confirmLabel="Delete permanently"
        loading={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        tone="navy"
        title="Leave without saving?"
        message="You have unsaved changes on this page. If you leave now they will be lost."
        confirmLabel="Leave page"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  )
}
