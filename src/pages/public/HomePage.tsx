import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, CalendarDays, Images, MapPin, Medal, Newspaper, Trophy, Users } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import {
  getFeaturedCompetition,
  listFeaturedAwards,
  listFeaturedChampions,
  listFeaturedRecords,
  listGallery,
  listNews,
  listShowcaseCompetitions,
  getAthleteSlugs,
} from '@/services/content'
import type { Competition } from '@/types/database'
import { formatDateRange, truncate } from '@/utils/format'
import { cn } from '@/utils/cn'
import { Seo, absoluteUrl } from '@/components/common/Seo'
import { SectionHeader } from '@/components/common/SectionHeader'
import { LinkButton } from '@/components/common/Button'
import { Media } from '@/components/common/Media'
import { Reveal } from '@/components/common/Reveal'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState, Skeleton } from '@/components/common/States'
import { CompetitionStatusBadge } from '@/components/common/Badge'
import { AwardCard, ChampionCard, NewsCard, RecordCard } from '@/components/public/Cards'
import { StatCounter } from '@/components/public/StatCounter'
import { GalleryGrid } from '@/components/public/GalleryGrid'
import { HomeHero } from './home/HomeHero'

function daysUntil(date: string | null): number | null {
  if (!date) return null
  const diff = new Date(`${date}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / 86_400_000)
}

export default function HomePage() {
  const { settings } = useSiteSettings()
  const featured = useQuery('home:featured-competition', getFeaturedCompetition)

  return (
    <>
      <Seo
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SportsOrganization',
          name: settings?.org_name ?? 'Khelratna',
          sport: 'Karate',
          url: absoluteUrl('/'),
          ...(settings?.logo_url ? { logo: settings.logo_url } : {}),
          ...(settings?.email ? { email: settings.email } : {}),
          ...(settings?.phone ? { telephone: settings.phone } : {}),
        }}
      />
      <HomeHero image={settings?.hero_image_url} featured={featured.data} />
      <StatsBand />
      <AboutSection />
      <FeaturedCompetitionSection competition={featured.data} loading={featured.loading && featured.data === undefined} />
      <ShowcaseSection excludeId={featured.data?.id} ready={featured.data !== undefined || !!featured.error} />
      <RecordsSection />
      <ChampionsSection />
      <AwardsSection />
      <GallerySection />
      <NewsSection />
      <FinalCta />
    </>
  )
}

// ------------------------------------------------------------------ statistics
function StatsBand() {
  const { settings, loading } = useSiteSettings()
  const stats = settings?.stats ?? []
  if (!loading && !stats.length) return null
  return (
    <section aria-label="Khelratna in numbers" className="relative z-10 bg-white lg:bg-transparent">
      <div className="container-page lg:-mt-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line shadow-[0_30px_60px_-30px_rgba(11,31,51,0.35)] ring-1 ring-line lg:grid-cols-4">
          {loading && !stats.length
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-white p-6 sm:p-8">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="mt-3 h-3 w-32" />
                </div>
              ))
            : stats.slice(0, 4).map((s, i) => (
                <div key={i} className="bg-white p-6 sm:p-8">
                  <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------- about
function AboutSection() {
  const { settings } = useSiteSettings()
  const values = settings?.core_values?.slice(0, 3) ?? []
  return (
    <section className="py-24 lg:py-32" aria-labelledby="about-title">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="absolute -top-4 -left-4 h-2/3 w-2/3 rounded-3xl bg-paper" aria-hidden />
          <Media
            src={settings?.about_image_url}
            alt="Khelratna championship ceremony"
            aspect="aspect-[5/6]"
            className="relative rounded-3xl"
            placeholderLabel="Organisation photo"
          />
          <div className="absolute -right-3 -bottom-6 hidden rounded-2xl bg-navy-900 p-6 text-white shadow-xl sm:block">
            <Trophy className="size-6 text-gold-500" aria-hidden />
            <p className="mt-3 font-display text-sm font-semibold tracking-[0.16em] uppercase">Competition</p>
            <p className="font-display text-sm font-semibold tracking-[0.16em] text-white/60 uppercase">Recognition</p>
            <p className="font-display text-sm font-semibold tracking-[0.16em] text-white/35 uppercase">Achievement</p>
          </div>
        </Reveal>

        <div>
          <SectionHeader
            eyebrow="About Khelratna"
            title={
              <>
                Built on discipline.
                <br />
                <span className="text-red-600">Driven by excellence.</span>
              </>
            }
          />
          <Reveal delay={0.1}>
            {settings?.about_summary ? (
              <p className="mt-6 text-base leading-8 text-muted sm:text-lg">{settings.about_summary}</p>
            ) : (
              <div className="mt-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
          </Reveal>
          {values.length > 0 && (
            <Reveal delay={0.15}>
              <ul className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
                {values.map((v, i) => (
                  <li key={v.title}>
                    <span className="font-display text-xs font-bold text-red-600">0{i + 1}</span>
                    <p className="mt-1 font-display font-semibold text-navy-900 uppercase">{v.title}</p>
                    {v.description && <p className="mt-1.5 text-sm leading-6 text-muted">{v.description}</p>}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          <Reveal delay={0.2} className="mt-10">
            <LinkButton to="/about" variant="navy" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Discover our story
            </LinkButton>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------- featured competition
function FeaturedCompetitionSection({ competition: c, loading }: { competition: Competition | null | undefined; loading: boolean }) {
  const days = c && c.status === 'upcoming' ? daysUntil(c.start_date) : null
  return (
    <section className="bg-paper py-24 lg:py-28" aria-labelledby="featured-title">
      <div className="container-page">
        <SectionHeader
          eyebrow={c?.status === 'completed' ? 'Featured championship' : 'Next on the calendar'}
          title="Featured competition"
          action={
            <LinkButton to="/competitions" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              All competitions
            </LinkButton>
          }
        />
        <div className="mt-12">
          {loading ? (
            <Skeleton className="h-[28rem] w-full rounded-3xl" />
          ) : !c ? (
            <EmptyState
              title="No upcoming competitions currently"
              description="New championships will be announced here. Check back soon."
              icon={<CalendarDays className="size-5" />}
            />
          ) : (
            <Reveal>
              <article className="group relative grid overflow-hidden rounded-3xl bg-white ring-1 ring-line lg:grid-cols-12">
                <div className="relative lg:col-span-7">
                  <Media
                    src={c.cover_image_url}
                    alt={c.name}
                    className="h-full min-h-72"
                    aspect="aspect-[16/10] lg:aspect-auto"
                    imgClassName="transition duration-700 group-hover:scale-[1.03]"
                    placeholderLabel="Competition photo"
                  />
                  {days !== null && days >= 0 && (
                    <div className="absolute top-5 left-5 rounded-2xl bg-white/95 px-5 py-4 text-center shadow-lg backdrop-blur">
                      <p className="font-display text-3xl font-bold text-navy-900 tabular-nums">{days}</p>
                      <p className="text-[0.625rem] font-semibold tracking-[0.18em] text-muted uppercase">{days === 1 ? 'Day to go' : 'Days to go'}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col p-8 sm:p-10 lg:col-span-5 lg:p-12">
                  <div className="flex flex-wrap items-center gap-2">
                    <CompetitionStatusBadge status={c.status} />
                    {c.level && <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-red-600 uppercase">{c.level}</span>}
                  </div>
                  <h3 id="featured-title" className="mt-5 font-display text-3xl leading-tight font-bold text-navy-900 uppercase">
                    {c.name}
                  </h3>
                  <dl className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <dt className="sr-only">Date</dt>
                      <CalendarDays className="size-4 text-navy-700" aria-hidden />
                      <dd className="font-medium text-ink">{formatDateRange(c.start_date, c.end_date)}</dd>
                    </div>
                    {(c.venue || c.location) && (
                      <div className="flex items-center gap-3">
                        <dt className="sr-only">Location</dt>
                        <MapPin className="size-4 text-navy-700" aria-hidden />
                        <dd className="font-medium text-ink">{[c.venue, c.location].filter(Boolean).join(', ')}</dd>
                      </div>
                    )}
                  </dl>
                  {c.short_description && <p className="mt-6 leading-7 text-muted">{truncate(c.short_description, 220)}</p>}
                  <div className="mt-auto pt-8">
                    <LinkButton to={`/competitions/${c.slug}`} iconRight={<ArrowRight className="size-4" aria-hidden />}>
                      View competition
                    </LinkButton>
                  </div>
                </div>
              </article>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------- championship showcase
function ShowcaseSection({ excludeId, ready }: { excludeId?: string; ready: boolean }) {
  const q = useQuery(ready ? `home:showcase:${excludeId ?? ''}` : null, () => listShowcaseCompetitions(excludeId))
  if (q.data && !q.data.length) return null
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white lg:py-32" aria-labelledby="showcase-title">
      <div className="absolute inset-0 bg-grain" aria-hidden />
      <div className="container-page relative">
        <SectionHeader
          tone="dark"
          eyebrow="Championships"
          title={<span id="showcase-title">Stages built for champions</span>}
          description="Every Khelratna championship is organised to one standard: fair judging, clear categories and a stage worthy of the athletes who compete."
          action={
            <LinkButton to="/competitions" variant="outline-light" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Explore competitions
            </LinkButton>
          }
        />
        <div className="mt-14">
          <QueryBoundary query={q} onDark loading={<CardGridSkeleton count={3} aspect="aspect-[3/4]" />}>
            {(rows) => (
              <div className="grid gap-5 md:grid-cols-3">
                {rows.map((c, i) => (
                  <Reveal key={c.id} delay={i * 0.08}>
                    <Link to={`/competitions/${c.slug}`} className="group relative block overflow-hidden rounded-2xl focus-visible:outline-offset-4">
                      <Media
                        src={c.cover_image_url}
                        alt={c.name}
                        aspect={i === 0 ? 'aspect-[3/4]' : 'aspect-[3/4]'}
                        tone={i === 1 ? 'ink' : 'navy'}
                        imgClassName="transition duration-700 group-hover:scale-105"
                        placeholderLabel="Championship photo"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" aria-hidden />
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <div className="flex items-center gap-2">
                          {c.level && <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-300 uppercase">{c.level}</span>}
                          <CompetitionStatusBadge status={c.status} onDark />
                        </div>
                        <h3 className="mt-3 font-display text-xl leading-tight font-bold uppercase">{c.name}</h3>
                        <p className="mt-2 text-xs text-white/60">
                          {formatDateRange(c.start_date, c.end_date)}
                          {c.location && ` · ${c.location}`}
                        </p>
                        {c.short_description && <p className="mt-3 line-clamp-2 text-sm text-white/55">{c.short_description}</p>}
                        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase">
                          View championship <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </QueryBoundary>
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------------- world records
function RecordsSection() {
  const q = useQuery('home:records', () => listFeaturedRecords(3))
  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 text-white lg:py-32" aria-labelledby="records-title">
      <div className="absolute inset-0 bg-grain" aria-hidden />
      <div className="absolute top-0 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
      <div className="gold-rule absolute inset-x-0 top-0" aria-hidden />
      <div className="container-page relative">
        <SectionHeader
          tone="dark"
          accent="gold"
          align="center"
          eyebrow="World records"
          title={
            <span id="records-title">
              Records that <span className="text-gold-300">made history</span>
            </span>
          }
          description="Showcasing Khelratna’s documented world records and extraordinary achievements."
        />
        <div className="mt-14">
          <QueryBoundary
            query={q}
            onDark
            loading={<CardGridSkeleton count={3} />}
            isEmpty={(rows) => rows.length === 0}
            empty={
              <EmptyState
                onDark
                title="No world records available"
                description="Documented records will be showcased here once published."
                icon={<Trophy className="size-5" />}
              />
            }
          >
            {(rows) => (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rows.map((r, i) => (
                  <Reveal key={r.id} delay={i * 0.08}>
                    <RecordCard record={r} />
                  </Reveal>
                ))}
              </div>
            )}
          </QueryBoundary>
        </div>
        <div className="mt-12 text-center">
          <LinkButton to="/world-records" variant="gold" iconRight={<ArrowRight className="size-4" aria-hidden />}>
            Explore world records
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------- champions
function ChampionsSection() {
  const q = useQuery('home:champions', async () => {
    const rows = await listFeaturedChampions(4)
    const slugs = await getAthleteSlugs(rows.map((r) => r.athlete_id).filter((x): x is string => !!x))
    return { rows, slugs }
  })
  return (
    <section className="py-24 lg:py-32" aria-labelledby="champions-title">
      <div className="container-page">
        <SectionHeader
          eyebrow="Champions"
          title={<span id="champions-title">Champions who made their mark</span>}
          action={
            <LinkButton to="/champions" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              View champions
            </LinkButton>
          }
        />
        <div className="mt-12">
          <QueryBoundary
            query={q}
            loading={<CardGridSkeleton count={4} aspect="aspect-[4/5]" className="lg:grid-cols-4" />}
            isEmpty={(d) => d.rows.length === 0}
            empty={
              <EmptyState
                title="No champions published yet"
                description="Winners from Khelratna championships will appear here."
                icon={<Medal className="size-5" />}
              />
            }
          >
            {({ rows, slugs }) => (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {rows.map((c, i) => (
                  <Reveal key={c.id} delay={i * 0.06}>
                    <ChampionCard champion={c} athleteSlug={c.athlete_id ? slugs.get(c.athlete_id) : undefined} />
                  </Reveal>
                ))}
              </div>
            )}
          </QueryBoundary>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------- awards
function AwardsSection() {
  const q = useQuery('home:awards', () => listFeaturedAwards(4))
  return (
    <section className="bg-paper py-24 lg:py-32" aria-labelledby="awards-title">
      <div className="container-page">
        <SectionHeader
          eyebrow="Awards & achievements"
          accent="gold"
          title={<span id="awards-title">Recognition of excellence</span>}
          description="Honouring organisations, athletes and moments that raised the standard of Karate."
          action={
            <LinkButton to="/awards" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              View all awards
            </LinkButton>
          }
        />
        <div className="mt-12">
          <QueryBoundary
            query={q}
            loading={<CardGridSkeleton count={4} aspect="aspect-[5/3]" className="lg:grid-cols-4" />}
            isEmpty={(rows) => rows.length === 0}
            empty={<EmptyState title="No awards published yet" icon={<Trophy className="size-5" />} />}
          >
            {(rows) => (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {rows.map((a, i) => (
                  <Reveal key={a.id} delay={i * 0.06}>
                    <AwardCard award={a} />
                  </Reveal>
                ))}
              </div>
            )}
          </QueryBoundary>
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------- gallery
function GallerySection() {
  // Only a small, fixed slice of the gallery loads on the homepage
  const q = useQuery('home:gallery', () => listGallery({ pageSize: 8 }))
  return (
    <section className="py-24 lg:py-32" aria-labelledby="gallery-title">
      <div className="container-page">
        <SectionHeader
          eyebrow="Gallery"
          title={<span id="gallery-title">Moments on the tatami</span>}
          action={
            <LinkButton to="/gallery" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Open gallery
            </LinkButton>
          }
        />
        <div className="mt-12">
          <QueryBoundary
            query={q}
            loading={<CardGridSkeleton count={3} aspect="aspect-square" />}
            isEmpty={(d) => d.rows.length === 0}
            empty={<EmptyState title="No gallery images available" icon={<Images className="size-5" />} />}
          >
            {(d) => <GalleryGrid items={d.rows} columns="wide" />}
          </QueryBoundary>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------ news
function NewsSection() {
  const q = useQuery('home:news', () => listNews({ pageSize: 4 }))
  return (
    <section className="border-t border-line bg-paper py-24 lg:py-32" aria-labelledby="news-title">
      <div className="container-page">
        <SectionHeader
          eyebrow="Latest news"
          title={<span id="news-title">From the championship floor</span>}
          action={
            <LinkButton to="/news" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              View all news
            </LinkButton>
          }
        />
        <div className="mt-12">
          <QueryBoundary
            query={q}
            loading={<CardGridSkeleton count={3} />}
            isEmpty={(d) => d.rows.length === 0}
            empty={<EmptyState title="No news published yet" icon={<Newspaper className="size-5" />} />}
          >
            {({ rows: [lead, ...rest] }) => (
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <Reveal className={cn(rest.length ? 'lg:col-span-7' : 'lg:col-span-12')}>
                  <NewsCard article={lead} variant="feature" />
                </Reveal>
                {rest.length > 0 && (
                  <div className="space-y-6 lg:col-span-5 lg:border-l lg:border-line lg:pl-14">
                    {rest.map((n, i) => (
                      <Reveal key={n.id} delay={i * 0.06} className={cn(i > 0 && 'border-t border-line pt-6')}>
                        <NewsCard article={n} variant="compact" />
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
            )}
          </QueryBoundary>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------- final CTA
function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 py-24 text-white lg:py-32" aria-labelledby="cta-title">
      <div className="absolute inset-0 -z-10 bg-grain" aria-hidden />
      <div className="absolute top-0 -right-32 -z-10 h-full w-2/3 skew-x-[-18deg] bg-gradient-to-l from-red-600/25 to-transparent" aria-hidden />
      <div className="absolute bottom-0 -left-20 -z-10 size-96 rounded-full bg-navy-600/40 blur-3xl" aria-hidden />
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-white/70">The next chapter</p>
          <h2 id="cta-title" className="display-lg mt-6">
            Be part of the next championship
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Discover Khelratna competitions, achievements and the athletes who continue to raise the standard of Karate excellence.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <LinkButton to="/competitions" size="lg" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Explore competitions
            </LinkButton>
            <LinkButton to="/contact" size="lg" variant="outline-light" icon={<Users className="size-4" aria-hidden />}>
              Contact Khelratna
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
