import { Images } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useFilters } from '@/hooks/useFilters'
import { getCompetitionIndex, listGallery } from '@/services/content'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { FilterBar } from '@/components/common/FilterBar'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState } from '@/components/common/States'
import { Button } from '@/components/common/Button'
import { GalleryGrid } from '@/components/public/GalleryGrid'

const BATCH = 18
const CATEGORY_OPTIONS = [
  { value: 'competitions', label: 'Competitions' },
  { value: 'champions', label: 'Champions' },
  { value: 'awards', label: 'Awards' },
  { value: 'world-records', label: 'World Records' },
  { value: 'events', label: 'Events' },
]

export default function GalleryPage() {
  const { values, page, set, reset, activeCount } = useFilters(['category', 'competition'] as const)
  const competitions = useQuery('competitions:index', getCompetitionIndex)
  // "Load more" grows the window instead of paging, so earlier images stay in place
  const q = useQuery(`gallery:${values.category}:${values.competition}:${page}`, () =>
    listGallery({ category: values.category, competition: values.competition, page: 1, pageSize: BATCH * page }),
  )

  return (
    <>
      <Seo title="Gallery" description="Photographs and videos from Arjuna Book of World Record Karate championships, award ceremonies, champions and world record moments." />
      <PageHero
        eyebrow="Gallery"
        title="Moments that matter"
        description="Championship bouts, podiums, ceremonies and record-breaking moments — captured."
        crumbs={[{ label: 'Gallery' }]}
      />

      <section className="py-14 lg:py-20">
        <div className="container-page">
          <FilterBar
            chips={{ label: 'Category', value: values.category, options: CATEGORY_OPTIONS, onChange: (v) => set('category', v) }}
            selects={[
              {
                key: 'competition',
                label: 'Event',
                value: values.competition,
                options: (competitions.data ?? []).map((c) => ({ value: c.id, label: c.name })),
              },
            ]}
            onSelect={(k, v) => set(k as 'competition', v)}
            onReset={reset}
            activeCount={activeCount}
            resultLabel={q.data ? `${q.data.count} ${q.data.count === 1 ? 'item' : 'items'}` : undefined}
          />

          <div className="mt-10">
            <QueryBoundary
              query={q}
              loading={<CardGridSkeleton count={6} aspect="aspect-square" />}
              isEmpty={(d) => d.rows.length === 0}
              empty={
                <EmptyState
                  icon={<Images className="size-5" />}
                  title="No gallery images available"
                  description={activeCount ? 'Try another category or event.' : undefined}
                />
              }
            >
              {(d) => (
                <>
                  <GalleryGrid items={d.rows} columns="wide" />
                  {d.rows.length < d.count && (
                    <div className="mt-12 text-center">
                      <Button variant="outline" onClick={() => set('page', page + 1)} loading={q.loading}>
                        Load more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </QueryBoundary>
          </div>
        </div>
      </section>
    </>
  )
}
