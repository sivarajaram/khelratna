import { useMemo } from 'react'
import { ShieldCheck, Trophy } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useFilters } from '@/hooks/useFilters'
import { listWorldRecords } from '@/services/content'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState } from '@/components/common/States'
import { Reveal } from '@/components/common/Reveal'
import { RecordCard } from '@/components/public/Cards'
import { cn } from '@/utils/cn'

export default function WorldRecordsPage() {
  const { values, set } = useFilters(['category'] as const)
  const all = useQuery('records:all', () => listWorldRecords())

  const categories = useMemo(() => [...new Set((all.data?.rows ?? []).map((r) => r.category).filter((c): c is string => !!c))].sort(), [all.data])
  const rows = useMemo(() => (all.data?.rows ?? []).filter((r) => !values.category || r.category === values.category), [all.data, values.category])

  return (
    <div className="bg-navy-950 text-white">
      <Seo title="World Records" description="Documented Karate world records and extraordinary achievements recognised by Arjuna Book of World Record." />
      <PageHero
        variant="prestige"
        eyebrow="World records"
        title={
          <>
            Records that
            <br />
            <span className="text-gold-300">made history</span>
          </>
        }
        description="Documented world records and extraordinary achievements — each presented with its recognising organisation and supporting evidence."
        crumbs={[{ label: 'World Records' }]}
        size="lg"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-xs text-gold-100">
          <ShieldCheck className="size-4 text-gold-300" aria-hidden />
          Only records documented and verified by Arjuna Book of World Record are listed.
        </p>
      </PageHero>

      <section className="relative pb-28">
        <div className="absolute inset-0 bg-grain" aria-hidden />
        <div className="container-page relative pt-4">
          {categories.length > 1 && (
            <div className="-mx-4 mb-10 overflow-x-auto px-4 scrollbar-none" role="group" aria-label="Record category">
              <div className="flex w-max gap-2">
                {['', ...categories].map((c) => (
                  <button
                    key={c || 'all'}
                    onClick={() => set('category', c)}
                    aria-pressed={values.category === c}
                    className={cn(
                      'h-10 rounded-full px-4 text-[0.78rem] font-semibold tracking-[0.08em] uppercase transition',
                      values.category === c ? 'bg-gold-500 text-navy-950' : 'text-white/70 ring-1 ring-white/15 ring-inset hover:ring-gold-500/50',
                    )}
                  >
                    {c || 'All records'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <QueryBoundary
            query={all}
            onDark
            loading={<CardGridSkeleton count={3} className="opacity-10" />}
            isEmpty={() => rows.length === 0}
            empty={
              <EmptyState
                onDark
                icon={<Trophy className="size-5" />}
                title="No world records available"
                description="Documented records will be showcased here once published."
              />
            }
          >
            {() => {
              const [lead, ...rest] = rows
              return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Reveal className="md:col-span-2 lg:row-span-1">
                    <RecordCard record={lead} featured />
                  </Reveal>
                  {rest.map((r, i) => (
                    <Reveal key={r.id} delay={(i % 3) * 0.06}>
                      <RecordCard record={r} />
                    </Reveal>
                  ))}
                </div>
              )
            }}
          </QueryBoundary>
        </div>
      </section>
    </div>
  )
}
