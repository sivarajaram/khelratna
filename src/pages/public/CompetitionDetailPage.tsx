import { Link, useParams } from 'react-router'
import { Building2, CalendarDays, FileText, Flag, Globe2, Images, MapPin, Medal, Trophy, Users } from 'lucide-react'
import type { Champion } from '@/types/database'
import { useQuery } from '@/hooks/useQuery'
import { getAthleteSlugs, getCompetition, listCompetitionResults, listGallery } from '@/services/content'
import { formatDateRange, ordinal } from '@/utils/format'
import { cn } from '@/utils/cn'
import { Seo, absoluteUrl } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { CompetitionStatusBadge, MedalBadge } from '@/components/common/Badge'
import { LinkButton } from '@/components/common/Button'
import { Paragraphs } from '@/components/common/Markdown'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States'
import { Reveal } from '@/components/common/Reveal'
import { GalleryGrid } from '@/components/public/GalleryGrid'
import NotFoundPage from './NotFoundPage'

export default function CompetitionDetailPage() {
  const { slug = '' } = useParams()
  const q = useQuery(`competition:${slug}`, () => getCompetition(slug))

  if (q.data === null) return <NotFoundPage title="Competition not found" />
  const c = q.data

  return (
    <>
      {c && (
        <Seo
          title={c.name}
          description={c.short_description}
          image={c.cover_image_url}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'SportsEvent',
            name: c.name,
            sport: 'Karate',
            url: absoluteUrl(`/competitions/${c.slug}`),
            ...(c.start_date ? { startDate: c.start_date } : {}),
            ...(c.end_date ? { endDate: c.end_date } : {}),
            eventStatus: c.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
            ...(c.venue || c.location ? { location: { '@type': 'Place', name: c.venue ?? c.location, address: c.location ?? undefined } } : {}),
            ...(c.cover_image_url ? { image: c.cover_image_url } : {}),
            organizer: { '@type': 'SportsOrganization', name: c.organizer ?? 'Arjuna Book of World Record' },
          }}
        />
      )}
      <PageHero
        variant="ink"
        image={c?.cover_image_url}
        eyebrow={c?.level ? `${c.level} championship` : 'Championship'}
        title={c?.name ?? 'Championship'}
        crumbs={[{ to: '/competitions', label: 'Competitions' }, { label: c?.name ?? '…' }]}
      >
        {c && (
          <div className={cn('flex flex-wrap items-center gap-x-8 gap-y-3 text-sm', c.cover_image_url ? 'text-white/80' : 'text-ink/80')}>
            <CompetitionStatusBadge status={c.status} onDark={!!c.cover_image_url} />
            <span className="inline-flex items-center gap-2">
              <CalendarDays className={cn('size-4', c.cover_image_url ? 'text-gold-300' : 'text-navy-600')} aria-hidden />
              {formatDateRange(c.start_date, c.end_date)}
            </span>
            {c.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className={cn('size-4', c.cover_image_url ? 'text-gold-300' : 'text-navy-600')} aria-hidden />
                {c.location}
              </span>
            )}
          </div>
        )}
      </PageHero>

      {!c && <div className="container-page py-20">{q.error ? <ErrorState message={q.error} onRetry={q.reload} /> : <LoadingState />}</div>}

      {c && (
        <>
          <section className="py-20 lg:py-28">
            <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <p className="eyebrow text-navy-700">About the competition</p>
                <h2 className="display-md mt-4 text-navy-900">Championship overview</h2>
                <Paragraphs text={c.description ?? c.short_description} className="mt-6 space-y-5 text-base leading-8 text-muted sm:text-lg" />

                {c.categories.length > 0 && (
                  <div className="mt-12">
                    <h3 className="font-display text-lg font-semibold text-navy-900">Categories</h3>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {c.categories.map((cat) => (
                        <li key={cat} className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-navy-900 ring-1 ring-line">
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-5" aria-label="Event information">
                <div className="rounded-3xl bg-navy-900 p-8 text-white lg:sticky lg:top-28">
                  <h2 className="font-display text-sm font-semibold tracking-[0.2em] text-gold-300 uppercase">Event information</h2>
                  <dl className="mt-6 divide-y divide-white/10">
                    {[
                      { icon: CalendarDays, label: 'Date', value: formatDateRange(c.start_date, c.end_date) },
                      { icon: Building2, label: 'Venue', value: c.venue },
                      { icon: MapPin, label: 'Location', value: c.location },
                      { icon: Flag, label: 'Organiser', value: c.organizer },
                      { icon: Users, label: 'Participants', value: c.participant_count ? c.participant_count.toLocaleString('en-IN') : null },
                      { icon: Globe2, label: 'Countries', value: c.countries_count ? String(c.countries_count) : null },
                      { icon: Trophy, label: 'Awards', value: c.awards_info },
                    ]
                      .filter((r) => r.value)
                      .map((r) => (
                        <div key={r.label} className="flex gap-4 py-4">
                          <r.icon className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden />
                          <div>
                            <dt className="text-xs text-white/50">{r.label}</dt>
                            <dd className="mt-0.5 text-sm font-medium">{r.value}</dd>
                          </div>
                        </div>
                      ))}
                  </dl>
                  {c.documents.length > 0 && (
                    <div className="mt-6 border-t border-white/10 pt-6">
                      <h3 className="text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">Documents</h3>
                      <ul className="mt-3 space-y-2">
                        {c.documents.map((d) => (
                          <li key={d.url + d.name}>
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-white/85 hover:text-gold-300"
                            >
                              <FileText className="size-4" aria-hidden />
                              {d.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </section>

          <WinnersSection competitionId={c.id} summary={c.results_summary} completed={c.status === 'completed'} />
          <CompetitionGallery competitionId={c.id} />
        </>
      )}
    </>
  )
}

function WinnersSection({ competitionId, summary, completed }: { competitionId: string; summary: string | null; completed: boolean }) {
  const q = useQuery(`competition:results:${competitionId}`, async () => {
    const rows = await listCompetitionResults(competitionId)
    const slugs = await getAthleteSlugs(rows.map((r) => r.athlete_id).filter((x): x is string => !!x))
    return { rows, slugs }
  })

  return (
    <section className="bg-paper py-20 lg:py-28" aria-labelledby="winners-title">
      <div className="container-page">
        <p className="eyebrow eyebrow-gold text-gold-700">Results</p>
        <h2 id="winners-title" className="display-md mt-4 text-navy-900">
          Winners
        </h2>
        {summary && <p className="mt-4 max-w-2xl text-muted">{summary}</p>}
        <div className="mt-10">
          <QueryBoundary
            query={q}
            isEmpty={(d) => d.rows.length === 0}
            empty={
              <EmptyState
                icon={<Medal className="size-5" />}
                title={completed ? 'Results will be published soon' : 'Results will be published after the championship'}
              />
            }
          >
            {({ rows, slugs }) => <ResultsTable rows={rows} slugs={slugs} />}
          </QueryBoundary>
        </div>
      </div>
    </section>
  )
}

function ResultsTable({ rows, slugs }: { rows: Champion[]; slugs: Map<string, string> }) {
  const byCategory = new Map<string, Champion[]>()
  for (const r of rows) {
    const key = [r.category, r.age_group].filter(Boolean).join(' · ') || 'Open category'
    byCategory.set(key, [...(byCategory.get(key) ?? []), r])
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {[...byCategory.entries()].map(([category, list]) => (
        <Reveal key={category}>
          <div className="h-full rounded-2xl bg-white p-6 ring-1 ring-line">
            <h3 className="font-display font-semibold text-navy-900">{category}</h3>
            <ol className="mt-4 divide-y divide-line">
              {list.map((r) => {
                const slug = r.athlete_id ? slugs.get(r.athlete_id) : undefined
                return (
                  <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 font-display text-sm font-bold text-muted tabular-nums">{r.position ? ordinal(r.position) : '—'}</span>
                      {slug ? (
                        <Link to={`/athletes/${slug}`} className="font-medium text-ink hover:text-navy-600 hover:underline">
                          {r.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-ink">{r.name}</span>
                      )}
                      {r.country && <span className="hidden text-xs text-muted sm:inline">{r.country}</span>}
                    </div>
                    {r.medal && <MedalBadge medal={r.medal} />}
                  </li>
                )
              })}
            </ol>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

function CompetitionGallery({ competitionId }: { competitionId: string }) {
  const q = useQuery(`competition:gallery:${competitionId}`, () => listGallery({ competition: competitionId, pageSize: 12 }))
  if (q.data && q.data.rows.length === 0) return null
  return (
    <section className="py-20 lg:py-28" aria-labelledby="comp-gallery-title">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-navy-700">Gallery</p>
            <h2 id="comp-gallery-title" className="display-md mt-4 text-navy-900">
              From the championship
            </h2>
          </div>
          <LinkButton to={`/gallery?competition=${competitionId}`} variant="outline" icon={<Images className="size-4" aria-hidden />}>
            Full gallery
          </LinkButton>
        </div>
        <div className="mt-10">
          <QueryBoundary query={q}>{(d) => <GalleryGrid items={d.rows} columns="wide" />}</QueryBoundary>
        </div>
      </div>
    </section>
  )
}
