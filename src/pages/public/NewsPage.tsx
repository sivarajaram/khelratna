import { Newspaper } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useFilters } from '@/hooks/useFilters'
import { listNews, listNewsCategories } from '@/services/content'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { FilterBar } from '@/components/common/FilterBar'
import { SearchBar } from '@/components/common/SearchBar'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState } from '@/components/common/States'
import { Pagination } from '@/components/common/Pagination'
import { Reveal } from '@/components/common/Reveal'
import { NewsCard } from '@/components/public/Cards'

const PAGE = 9

export default function NewsPage() {
  const { values, page, set, reset, activeCount } = useFilters(['category', 'q'] as const)
  const categories = useQuery('news:categories', listNewsCategories)
  const q = useQuery(`news:list:${values.category}:${values.q}:${page}`, () => listNews({ category: values.category, search: values.q, page, pageSize: PAGE }))
  const showLead = page === 1 && !activeCount

  return (
    <>
      <Seo title="News" description="Announcements, championship results and stories from Khelratna." />
      <PageHero
        variant="editorial"
        eyebrow="Newsroom"
        title="News & stories"
        description="Announcements, results and stories from Khelratna championships."
        crumbs={[{ label: 'News' }]}
      />

      <section className="py-14 lg:py-20">
        <div className="container-page">
          <FilterBar
            chips={
              categories.data?.length
                ? {
                    label: 'Category',
                    value: values.category,
                    options: categories.data.map((c) => ({ value: c, label: c })),
                    onChange: (v) => set('category', v),
                  }
                : undefined
            }
            search={<SearchBar value={values.q} onChange={(v) => set('q', v)} placeholder="Search news" label="Search news" />}
            onReset={reset}
            activeCount={activeCount}
          />

          <div className="mt-12">
            <QueryBoundary
              query={q}
              loading={<CardGridSkeleton count={6} aspect="aspect-[3/2]" />}
              isEmpty={(d) => d.rows.length === 0}
              empty={<EmptyState icon={<Newspaper className="size-5" />} title={activeCount ? 'No articles match your search' : 'No news published yet'} />}
            >
              {(d) => {
                const [lead, ...rest] = d.rows
                const grid = showLead ? rest : d.rows
                return (
                  <>
                    {showLead && lead && (
                      <Reveal className="mb-16 border-b border-line pb-16">
                        <div className="lg:w-4/5">
                          <NewsCard article={lead} variant="feature" />
                        </div>
                      </Reveal>
                    )}
                    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                      {grid.map((n, i) => (
                        <Reveal key={n.id} delay={(i % 3) * 0.05}>
                          <NewsCard article={n} />
                        </Reveal>
                      ))}
                    </div>
                    <Pagination
                      className="mt-16"
                      page={page}
                      pageSize={PAGE}
                      total={d.count}
                      onChange={(p) => {
                        set('page', p)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    />
                  </>
                )
              }}
            </QueryBoundary>
          </div>
        </div>
      </section>
    </>
  )
}
