import { ArrowRight, Images, Medal, Trophy, Users } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { getAthleteSlugs, listFeaturedAwards, listFeaturedChampions, listFeaturedRecords, listGallery } from '@/services/content'
import { splitPhones } from '@/utils/format'
import { Seo, absoluteUrl } from '@/components/common/Seo'
import { SectionHeader } from '@/components/common/SectionHeader'
import { LinkButton } from '@/components/common/Button'
import { Media } from '@/components/common/Media'
import { Reveal } from '@/components/common/Reveal'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState, Skeleton } from '@/components/common/States'
import { AwardCard, ChampionCard, RecordCard } from '@/components/public/Cards'
import { StatCounter } from '@/components/public/StatCounter'
import { GalleryGrid } from '@/components/public/GalleryGrid'
import { HomeHero } from './home/HomeHero'

export default function HomePage() {
  const { settings } = useSiteSettings()

  return (
    <>
      <Seo
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'SportsOrganization',
            name: settings?.org_name ?? 'Arjuna Book of World Record',
            sport: 'Karate',
            url: absoluteUrl('/'),
            ...(settings?.logo_url ? { logo: settings.logo_url } : {}),
            ...(settings?.email ? { email: settings.email } : {}),
            ...(settings?.phone ? { telephone: splitPhones(settings.phone) } : {}),
            ...(settings?.logo_url ? {} : { logo: absoluteUrl('/logo.png') }),
          },
        ]}
      />
      <HomeHero image={settings?.hero_image_url} />
      <StatsBand />
      <AboutSection />
      <RecordsSection />
      <ChampionsSection />
      <AwardsSection />
      <GallerySection />
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
    <section aria-label="Arjuna Book of World Record in numbers" className="relative z-10 bg-white lg:bg-transparent">
      <div className="container-page lg:-mt-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line shadow-[0_30px_60px_-30px_rgba(20,42,49,0.35)] ring-1 ring-line lg:grid-cols-4">
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
            alt="Arjuna Book of World Record championship ceremony"
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
            eyebrow="About Arjuna Book of World Record"
            title={
              <>
                Built on discipline.
                <br />
                <span className="text-accent-600">Driven by excellence.</span>
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
                    <span className="font-display text-xs font-bold text-accent-600">0{i + 1}</span>
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

// --------------------------------------------------------------- world records
function RecordsSection() {
  const q = useQuery('home:records', () => listFeaturedRecords(3))
  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 text-white lg:py-32" aria-labelledby="records-title">
      <div className="absolute inset-0 bg-grain" aria-hidden />
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
          description="Showcasing Arjuna Book of World Record’s documented world records and extraordinary achievements."
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
                description="Winners from Arjuna Book of World Record championships will appear here."
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

// ------------------------------------------------------------------- final CTA
function FinalCta() {
  return (
    <section className="border-t border-line bg-paper py-24 lg:py-28" aria-labelledby="cta-title">
      <div className="container-page">
        <Reveal className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-navy-700">The next chapter</p>
            <h2 id="cta-title" className="display-lg mt-6 text-navy-900">
              Be part of the next championship
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted">
              Discover Arjuna Book of World Record competitions, achievements and the athletes who continue to raise the standard of Karate excellence.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <LinkButton to="/competitions" size="lg" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Explore competitions
            </LinkButton>
            <LinkButton to="/contact" size="lg" variant="outline" icon={<Users className="size-4" aria-hidden />}>
              Contact us
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
