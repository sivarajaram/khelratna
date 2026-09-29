import { useMemo } from 'react'
import { Award as AwardIcon } from 'lucide-react'
import type { Award } from '@/types/database'
import { useQuery } from '@/hooks/useQuery'
import { useFilters } from '@/hooks/useFilters'
import { listAwards } from '@/services/content'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { FilterBar } from '@/components/common/FilterBar'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState } from '@/components/common/States'
import { Reveal } from '@/components/common/Reveal'
import { AwardCard } from '@/components/public/Cards'

const CATEGORIES = [
  { value: 'organization', label: 'Organisation Awards' },
  { value: 'athlete', label: 'Athlete Awards' },
  { value: 'championship', label: 'Championship Achievements' },
  { value: 'special', label: 'Special Recognition' },
  { value: 'international', label: 'International Recognition' },
]

export default function AwardsPage() {
  const { values, set, reset, activeCount } = useFilters(['category', 'year'] as const)
  const q = useQuery(`awards:${values.category}`, () => listAwards({ category: values.category }))

  const years = useMemo(() => [...new Set((q.data ?? []).map((a) => a.year).filter((y): y is number => !!y))].sort((a, b) => b - a), [q.data])
  const grouped = useMemo(() => {
    const rows = (q.data ?? []).filter((a) => !values.year || String(a.year) === values.year)
    const map = new Map<number | 'undated', Award[]>()
    for (const a of rows) map.set(a.year ?? 'undated', [...(map.get(a.year ?? 'undated') ?? []), a])
    return [...map.entries()]
  }, [q.data, values.year])

  return (
    <>
      <Seo title="Awards" description="Organisation awards, athlete awards, championship achievements and special and international recognition." />
      <PageHero
        eyebrow="Awards & recognition"
        title={
          <>
            Recognition of
            <br />
            <span className="text-gold-300">excellence</span>
          </>
        }
        description="Honours received by Khelratna, and honours Khelratna has bestowed on the athletes, teams and people who raise the standard of the sport."
        crumbs={[{ label: 'Awards' }]}
      />

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-page">
          <FilterBar
            chips={{ label: 'Award category', value: values.category, options: CATEGORIES, onChange: (v) => set('category', v) }}
            selects={
              years.length > 1 ? [{ key: 'year', label: 'Year', value: values.year, options: years.map((y) => ({ value: String(y), label: String(y) })) }] : []
            }
            onSelect={(k, v) => set(k as 'year', v)}
            onReset={reset}
            activeCount={activeCount}
          />

          <div className="mt-12">
            <QueryBoundary
              query={q}
              loading={<CardGridSkeleton count={6} aspect="aspect-[5/3]" />}
              isEmpty={() => grouped.length === 0}
              empty={<EmptyState icon={<AwardIcon className="size-5" />} title="No awards in this category yet" />}
            >
              {() => (
                <div className="space-y-16">
                  {grouped.map(([year, awards]) => (
                    <div key={year} className="grid gap-8 lg:grid-cols-12">
                      <div className="lg:col-span-2">
                        <p className="font-display text-5xl font-bold text-navy-900/15 lg:sticky lg:top-28">{year === 'undated' ? '—' : year}</p>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2 lg:col-span-10 xl:grid-cols-3">
                        {awards.map((a, i) => (
                          <Reveal key={a.id} delay={(i % 3) * 0.05}>
                            <AwardCard award={a} />
                          </Reveal>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </QueryBoundary>
          </div>
        </div>
      </section>
    </>
  )
}
