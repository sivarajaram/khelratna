import { Link } from 'react-router'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { listUpcomingCompetitions } from '@/services/content'
import { formatDateRange } from '@/utils/format'
import { CompetitionStatusBadge } from '@/components/common/Badge'
import { Reveal } from '@/components/common/Reveal'

const monthFmt = new Intl.DateTimeFormat('en-IN', { month: 'short' })

function daysUntil(date: string | null): number | null {
  if (!date) return null
  const diff = new Date(`${date}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / 86_400_000)
}

/** Upcoming and ongoing championships, listed on the News page. Renders nothing when none are scheduled. */
export function UpcomingCompetitions() {
  const q = useQuery('news:upcoming-competitions', () => listUpcomingCompetitions(6))
  if (!q.data?.length) return null

  return (
    <section className="border-b border-line bg-paper py-14 lg:py-16" aria-labelledby="upcoming-title">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-navy-700">On the calendar</p>
            <h2 id="upcoming-title" className="display-md mt-3 text-navy-900">
              Upcoming championships
            </h2>
          </div>
          <Link
            to="/competitions?status=upcoming"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-navy-800 uppercase hover:text-navy-600"
          >
            All competitions <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {q.data.map((c, i) => {
            const start = c.start_date ? new Date(`${c.start_date}T00:00:00`) : null
            const days = c.status === 'upcoming' ? daysUntil(c.start_date) : null
            return (
              <Reveal as="li" key={c.id} delay={(i % 3) * 0.05}>
                <Link
                  to={`/competitions/${c.slug}`}
                  className="group flex h-full gap-4 rounded-2xl bg-white p-5 ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(20,42,49,0.45)] hover:ring-navy-600/30"
                >
                  <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-900 py-3 text-white">
                    <span className="font-display text-2xl leading-none font-bold tabular-nums">{start ? start.getDate() : '—'}</span>
                    <span className="mt-1 text-[0.65rem] font-semibold tracking-[0.16em] text-gold-300 uppercase">
                      {start ? monthFmt.format(start) : 'TBA'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CompetitionStatusBadge status={c.status} />
                      {days !== null && days >= 0 && (
                        <span className="text-xs font-medium text-muted">{days === 0 ? 'Starts today' : `${days} ${days === 1 ? 'day' : 'days'} to go`}</span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display leading-snug font-semibold text-navy-900 group-hover:text-navy-600">{c.name}</h3>
                    <p className="mt-1.5 text-xs text-muted">{formatDateRange(c.start_date, c.end_date)}</p>
                    {c.location && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
                        <MapPin className="size-3.5" aria-hidden /> {c.location}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
