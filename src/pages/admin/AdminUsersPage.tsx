import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, Trash2 } from 'lucide-react'
import type { AdminUser } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { repo } from '@/services/repository'
import { inviteAdmin } from '@/services/forms'
import { errorMessage } from '@/services/errors'
import { isDemoMode } from '@/lib/env'
import { formatDate } from '@/utils/format'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/Modal'
import { EmptyState, ErrorState } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  full_name: z.string().trim().max(120),
})
type FormValues = z.infer<typeof schema>

export default function AdminUsersPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [removing, setRemoving] = useState<AdminUser | null>(null)
  const [busy, setBusy] = useState(false)
  const q = useQuery('admin:users', () => repo('admins').list({ order: [{ column: 'created_at' }] }))
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', full_name: '' } })

  const onInvite = async (v: FormValues) => {
    try {
      await inviteAdmin(v.email, v.full_name)
      toast.success(isDemoMode ? 'Admin added (demo)' : `Invitation sent to ${v.email}`)
      reset()
      invalidateQueries('admin:users')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const remove = async () => {
    if (!removing) return
    setBusy(true)
    try {
      await repo('admins').remove(removing.user_id)
      toast.success('Admin access removed')
      setRemoving(null)
      invalidateQueries('admin:users')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Admin users" description="People who can sign in and manage website content." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {q.error && !q.data ? (
            <ErrorState message={q.error} onRetry={q.reload} />
          ) : (
            <DataTable
              caption="Administrators"
              rowKey="user_id"
              rows={(q.data?.rows ?? []) as unknown as Record<string, unknown>[]}
              loading={q.loading}
              empty={<EmptyState title="No administrators found" />}
              columns={[
                {
                  key: 'email',
                  label: 'Administrator',
                  render: (r) => (
                    <div>
                      <p className="font-medium text-ink">
                        {String(r.full_name || r.email)}
                        {r.user_id === user?.id && (
                          <span className="ml-2 rounded bg-navy-50 px-1.5 py-0.5 text-[0.65rem] font-semibold text-navy-700 uppercase">You</span>
                        )}
                      </p>
                      <p className="text-xs text-muted">{String(r.email)}</p>
                    </div>
                  ),
                },
                { key: 'created_at', label: 'Added', render: (r) => <span className="text-muted">{formatDate(String(r.created_at))}</span> },
              ]}
              actions={(r) =>
                r.user_id !== user?.id ? (
                  <button
                    onClick={() => setRemoving(r as unknown as AdminUser)}
                    className="inline-grid size-8 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${String(r.email)}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null
              }
            />
          )}
        </div>

        <form onSubmit={handleSubmit(onInvite)} noValidate className="h-fit space-y-4 rounded-xl border border-line bg-white p-5">
          <h2 className="font-display font-semibold">Invite an administrator</h2>
          <p className="text-sm text-muted">They will receive an email to set their password and will have full access to the admin panel.</p>
          <FormField label="Email" required error={errors.email?.message}>
            <input {...register('email')} type="email" className="input" />
          </FormField>
          <FormField label="Full name" error={errors.full_name?.message}>
            <input {...register('full_name')} className="input" />
          </FormField>
          <Button type="submit" variant="navy" caps={false} size="sm" className="w-full" loading={isSubmitting} icon={<Send className="size-4" aria-hidden />}>
            Send invitation
          </Button>
          {!isDemoMode && <p className="text-xs text-muted">Requires the invite-admin Edge Function to be deployed (see README).</p>}
        </form>
      </div>

      <ConfirmDialog
        open={!!removing}
        title="Remove admin access?"
        message={`${removing?.email ?? ''} will no longer be able to manage the website. Their login account itself is not deleted.`}
        confirmLabel="Remove access"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      />
    </>
  )
}
