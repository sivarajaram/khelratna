import { Link } from 'react-router'
import { ArrowRight, Award, CalendarRange, Images, Inbox, Medal, Newspaper, Plus, Trophy, UserRound } from 'lucide-react'
import type { TableName } from '@/types/database'
import { useQuery } from '@/hooks/useQuery'
import { useAuth } from '@/hooks/useAuth'
import { repo } from '@/services/repository'
import { formatDate } from '@/utils/format'
import { PageHeader } from '@/components/admin/PageHeader'
import { StatusPill } from '@/components/admin/Cells'
import { ErrorState, Skeleton } from '@/components/common/States'

const counters: { table: TableName; label: string; to: string; icon: typeof Trophy }[] = [
  { table: 'competitions', label: 'Total competitions', to: '/admin/competitions', icon: CalendarRange },
  { table: 'athletes', label: 'Total athletes', to: '/admin/athletes', icon: UserRound },
  { table: 'champions', label: 'Total champions', to: '/admin/champions', icon: Medal },
  { table: 'world_records', label: 'World records', to: '/admin/world-records', icon: Trophy },
  { table: 'awards', label: 'Awards', to: '/admin/awards', icon: Award },
  { table: 'news', label: 'News', to: '/admin/news', icon: Newspaper },
  { table: 'enquiries', label: 'Enquiries', to: '/admin/enquiries', icon: Inbox },
]

const recentSources: { table: TableName; label: string; title: string; path: (id: string) => string }[] = [
  { table: 'competitions', label: 'Latest competition', title: 'name', path: (id) => `/admin/competitions/${id}` },
  { table: 'champions', label: 'Latest champion', title: 'name', path: (id) => `/admin/champions/${id}` },
  { table: 'world_records', label: 'Latest world record', title: 'title', path: (id) => `/admin/world-records/${id}` },
  { table: 'news', label: 'Latest news', title: 'title', path: (id) => `/admin/news/${id}` },
  { table: 'enquiries', label: 'Latest enquiry', title: 'subject', path: () => '/admin/enquiries' },
]

const quickActions = [
  { label: 'Add competition', to: '/admin/competitions/new' },
  { label: 'Add champion', to: '/admin/champions/new' },
  { label: 'Add world record', to: '/admin/world-records/new' },
  { label: 'Add award', to: '/admin/awards/new' },
  { label: 'Add news', to: '/admin/news/new' },
  { label: 'Upload gallery', to: '/admin/gallery', icon: Images },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const counts = useQuery('admin:dashboard:counts', async () => {
    const [values, newEnquiries] = await Promise.all([
      Promise.all(counters.map((c) => repo(c.table).count())),
      repo('enquiries').count({ eq: { status: 'new' } }),
    ])
    return { values, newEnquiries }
  })
  const recent = useQuery('admin:dashboard:recent', () =>
    Promise.all(
      recentSources.map((s) =>
        repo(s.table)
          .list({ order: [{ column: 'created_at', ascending: false }], range: { from: 0, to: 0 } })
          .then((r) => r.rows[0] as unknown as Record<string, unknown> | undefined),
      ),
    ),
  )

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back${user?.email ? `, ${user.email}` : ''}.`} />

      {counts.error && <ErrorState message={counts.error} onRetry={counts.reload} className="mb-6" />}

      <section aria-label="Totals" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {counters.map((c, i) => (
          <Link key={c.table} to={c.to} className="group rounded-xl border border-line bg-white p-4 transition hover:border-navy-600/40 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">{c.label}</p>
              <c.icon className="size-4 text-muted-light group-hover:text-navy-700" aria-hidden />
            </div>
            {counts.data ? (
              <p className="mt-3 font-display text-3xl font-semibold text-ink tabular-nums">{counts.data.values[i]}</p>
            ) : (
              <Skeleton className="mt-3 h-9 w-16" />
            )}
            {c.table === 'enquiries' && !!counts.data?.newEnquiries && <p className="mt-1 text-xs font-medium text-red-600">{counts.data.newEnquiries} new</p>}
          </Link>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-line bg-white lg:col-span-2" aria-labelledby="recent-title">
          <h2 id="recent-title" className="border-b border-line px-5 py-4 font-display font-semibold">
            Recent activity
          </h2>
          <ul className="divide-y divide-line">
            {recentSources.map((s, i) => {
              const row = recent.data?.[i]
              return (
                <li key={s.table}>
                  {recent.data ? (
                    row ? (
                      <Link to={s.path(String(row.id))} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-paper/60">
                        <div className="min-w-0">
                          <p className="text-xs text-muted">{s.label}</p>
                          <p className="truncate font-medium text-ink">{String(row[s.title] ?? '—')}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <StatusPill status={row.status} />
                          <span className="hidden text-xs text-muted sm:inline">{formatDate(String(row.created_at))}</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="px-5 py-3.5">
                        <p className="text-xs text-muted">{s.label}</p>
                        <p className="text-sm text-muted-light">Nothing yet</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2 px-5 py-3.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-line bg-white" aria-labelledby="quick-title">
          <h2 id="quick-title" className="border-b border-line px-5 py-4 font-display font-semibold">
            Quick actions
          </h2>
          <ul className="space-y-1 p-3">
            {quickActions.map((a) => (
              <li key={a.to}>
                <Link to={a.to} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper">
                  <span className="grid size-7 place-items-center rounded-md bg-navy-900 text-white">
                    {a.icon ? <a.icon className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
                  </span>
                  <span className="flex-1">{a.label}</span>
                  <ArrowRight className="size-4 text-muted-light transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
