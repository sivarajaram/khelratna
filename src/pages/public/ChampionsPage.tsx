import { Medal } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useFilters } from '@/hooks/useFilters'
import { getAthleteSlugs, getChampionFilterOptions, listChampions, PAGE_SIZE } from '@/services/content'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { FilterBar } from '@/components/common/FilterBar'
import { SearchBar } from '@/components/common/SearchBar'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState } from '@/components/common/States'
import { Pagination } from '@/components/common/Pagination'
import { Reveal } from '@/components/common/Reveal'
import { ChampionCard } from '@/components/public/Cards'

const FILTER_KEYS = ['medal', 'year', 'competition', 'category', 'gender', 'ageGroup', 'q'] as const
const opt = (v: string | number) => ({ value: String(v), label: String(v) })

export default function ChampionsPage() {
  const { values, page, set, reset, activeCount } = useFilters(FILTER_KEYS)
  const options = useQuery('champions:options', getChampionFilterOptions)
  const list = useQuery(`champions:list:${JSON.stringify(values)}:${page}`, async () => {
    const res = await listChampions({ ...values, search: values.q, page })
    const slugs = await getAthleteSlugs(res.rows.map((r) => r.athlete_id).filter((x): x is string => !!x))
    return { ...res, slugs }
  })
  const o = options.data

  return (
    <>
      <Seo
        title="Champions"
        description="Karate champions and medal winners from Arjuna Book of World Record championships — filter by year, competition, category, gender and age group."
      />
      <PageHero
        eyebrow="Champions"
        title={
          <>
            Champions who
            <br />
            made their mark
          </>
        }
        description="The athletes who stood on the podium at Arjuna Book of World Record championships."
        crumbs={[{ label: 'Champions' }]}
      />

      <section className="py-14 lg:py-20">
        <div className="container-page">
          <FilterBar
            chips={{
              label: 'Medal',
              value: values.medal,
              options: [
                { value: 'gold', label: 'Gold' },
                { value: 'silver', label: 'Silver' },
                { value: 'bronze', label: 'Bronze' },
              ],
              onChange: (v) => set('medal', v),
            }}
            search={<SearchBar value={values.q} onChange={(v) => set('q', v)} placeholder="Search athletes" label="Search champions" />}
            selects={[
              { key: 'year', label: 'Year', value: values.year, options: (o?.years ?? []).map(opt) },
              {
                key: 'competition',
                label: 'Competition',
                value: values.competition,
                options: (o?.competitions ?? []).map((c) => ({ value: c.id, label: c.name })),
              },
              { key: 'category', label: 'Category', value: values.category, options: (o?.categories ?? []).map(opt) },
              {
                key: 'gender',
                label: 'Gender',
                value: values.gender,
                options: [
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' },
                ],
              },
              { key: 'ageGroup', label: 'Age group', value: values.ageGroup, options: (o?.ageGroups ?? []).map(opt) },
            ]}
            onSelect={(k, v) => set(k as (typeof FILTER_KEYS)[number], v)}
            onReset={reset}
            activeCount={activeCount}
            resultLabel={list.data ? `${list.data.count} ${list.data.count === 1 ? 'result' : 'results'}` : undefined}
          />

          <div className="mt-10">
            <QueryBoundary
              query={list}
              loading={<CardGridSkeleton count={8} aspect="aspect-[4/5]" className="grid-cols-2 lg:grid-cols-4" />}
              isEmpty={(d) => d.rows.length === 0}
              empty={
                <EmptyState
                  icon={<Medal className="size-5" />}
                  title={activeCount ? 'No champions match these filters' : 'No champions published yet'}
                  description={activeCount ? 'Try removing a filter.' : 'Winners will be listed here once results are published.'}
                />
              }
            >
              {(d) => (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {d.rows.map((c, i) => (
                      <Reveal key={c.id} delay={(i % 4) * 0.05}>
                        <ChampionCard champion={c} athleteSlug={c.athlete_id ? d.slugs.get(c.athlete_id) : undefined} />
                      </Reveal>
                    ))}
                  </div>
                  <Pagination
                    className="mt-14"
                    page={page}
                    pageSize={PAGE_SIZE}
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
