import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useFilters } from '@/hooks/useFilters'
import { getCompetitionIndex, listCompetitions } from '@/services/content'
import { yearOf } from '@/utils/format'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { FilterBar } from '@/components/common/FilterBar'
import { SearchBar } from '@/components/common/SearchBar'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState } from '@/components/common/States'
import { Pagination } from '@/components/common/Pagination'
import { Reveal } from '@/components/common/Reveal'
import { CompetitionCard } from '@/components/public/Cards'

const FILTER_KEYS = ['status', 'year', 'location', 'level', 'q'] as const
const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

const distinct = (vals: (string | number | null)[]) => [...new Set(vals.filter((v): v is string | number => v != null && v !== ''))]

export default function CompetitionsPage() {
  const { values, page, set, reset, activeCount } = useFilters(FILTER_KEYS)
  const index = useQuery('competitions:index', getCompetitionIndex)
  const key = `competitions:list:${JSON.stringify(values)}:${page}`
  const list = useQuery(key, () => listCompetitions({ ...values, search: values.q, page }))

  const options = useMemo(() => {
    const rows = index.data ?? []
    return {
      years: distinct(rows.map((r) => yearOf(r.start_date))).sort((a, b) => Number(b) - Number(a)),
      locations: distinct(rows.map((r) => r.location)).sort(),
      levels: distinct(rows.map((r) => r.level)).sort(),
      counts: {
        upcoming: rows.filter((r) => r.status === 'upcoming').length,
        ongoing: rows.filter((r) => r.status === 'ongoing').length,
        completed: rows.filter((r) => r.status === 'completed').length,
      },
    }
  }, [index.data])

  return (
    <>
      <Seo title="Competitions" description="Upcoming, ongoing and completed Karate championships and competitions conducted by Khelratna." />
      <PageHero
        variant="ink"
        eyebrow="Championships"
        title={
          <>
            Championships
            <br />& competitions
          </>
        }
        description="From national stages to international opens — every Khelratna championship, past and upcoming."
        crumbs={[{ label: 'Competitions' }]}
      >
        {index.data && (
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {(['upcoming', 'ongoing', 'completed'] as const).map((s) => (
              <div key={s} className="flex items-baseline gap-3">
                <dt className="order-2 text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">{s}</dt>
                <dd className="font-display text-3xl font-bold tabular-nums">{options.counts[s]}</dd>
              </div>
            ))}
          </dl>
        )}
      </PageHero>

      <section className="py-14 lg:py-20">
        <div className="container-page">
          <FilterBar
            chips={{ label: 'Status', value: values.status, options: STATUS_OPTIONS, onChange: (v) => set('status', v) }}
            search={<SearchBar value={values.q} onChange={(v) => set('q', v)} placeholder="Search competitions" label="Search competitions" />}
            selects={[
              { key: 'year', label: 'Year', value: values.year, options: options.years.map((y) => ({ value: String(y), label: String(y) })) },
              { key: 'location', label: 'Location', value: values.location, options: options.locations.map((l) => ({ value: String(l), label: String(l) })) },
              { key: 'level', label: 'Category', value: values.level, options: options.levels.map((l) => ({ value: String(l), label: String(l) })) },
            ]}
            onSelect={(k, v) => set(k as (typeof FILTER_KEYS)[number], v)}
            onReset={reset}
            activeCount={activeCount}
            resultLabel={list.data ? `${list.data.count} ${list.data.count === 1 ? 'competition' : 'competitions'}` : undefined}
          />

          <div className="mt-10">
            <QueryBoundary
              query={list}
              loading={<CardGridSkeleton count={6} />}
              isEmpty={(d) => d.rows.length === 0}
              empty={
                <EmptyState
                  icon={<CalendarDays className="size-5" />}
                  title={values.status === 'upcoming' && activeCount === 1 ? 'No upcoming competitions currently' : 'No competitions match these filters'}
                  description={activeCount ? 'Try removing a filter to see more championships.' : 'Competitions will appear here once published.'}
                />
              }
            >
              {(d) => (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {d.rows.map((c, i) => (
                      <Reveal key={c.id} delay={(i % 3) * 0.06}>
                        <CompetitionCard competition={c} />
                      </Reveal>
                    ))}
                  </div>
                  <Pagination
                    className="mt-14"
                    page={page}
                    pageSize={9}
                    total={d.count}
                    onChange={(p) => {
                      set('page', p)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </>
              )}
            </QueryBoundary>
          </div>
        </div>
      </section>
    </>
  )
}
