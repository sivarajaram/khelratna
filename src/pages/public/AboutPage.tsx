import { ArrowRight, Compass, Eye, Flag, Globe2, Medal, ShieldCheck, Sparkles, Star, Trophy, Users } from 'lucide-react'
import type { MilestoneKind } from '@/types/database'
import { useQuery } from '@/hooks/useQuery'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { getAboutContent, listFeaturedAwards } from '@/services/content'
import { cn } from '@/utils/cn'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { SectionHeader } from '@/components/common/SectionHeader'
import { Media } from '@/components/common/Media'
import { Reveal } from '@/components/common/Reveal'
import { Paragraphs } from '@/components/common/Markdown'
import { QueryBoundary } from '@/components/common/QueryBoundary'
import { CardGridSkeleton, EmptyState, Skeleton } from '@/components/common/States'
import { LinkButton } from '@/components/common/Button'
import { AwardCard } from '@/components/public/Cards'
import { StatCounter } from '@/components/public/StatCounter'
import { IsbnSection } from '@/components/public/IsbnSection'

const valueIcons = [ShieldCheck, Star, Trophy, Users, Medal, Sparkles]

const kindMeta: Record<MilestoneKind, { label: string; icon: typeof Flag; gold?: boolean }> = {
  milestone: { label: 'Milestone', icon: Flag },
  championship: { label: 'Championship', icon: Trophy },
  recognition: { label: 'Recognition', icon: Medal, gold: true },
  'world-record': { label: 'World record', icon: Star, gold: true },
  international: { label: 'International', icon: Globe2 },
}

export default function AboutPage() {
  const { settings } = useSiteSettings()
  const about = useQuery('about:content', getAboutContent)
  const awards = useQuery('about:awards', () => listFeaturedAwards(3))

  return (
    <>
      <Seo
        title="About"
        description={
          settings?.about_summary ?? 'The story, mission and values of Arjuna Book of World Record, a Karate competition and recognition organisation.'
        }
      />
      <PageHero
        eyebrow="About Arjuna Book of World Record"
        title={
          <>
            Our journey
            <br />
            in Karate
          </>
        }
        description="An organisation dedicated to championships, recognition and the pursuit of excellence in Karate."
        crumbs={[{ label: 'About' }]}
        size="lg"
      />

      {/* Story */}
      <section className="py-24 lg:py-32" aria-labelledby="story-title">
        <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <SectionHeader eyebrow="Our story" title={<span id="story-title">The Arjuna Book of World Record story</span>} />
            <Reveal delay={0.1}>
              {settings ? (
                <Paragraphs text={settings.about_story ?? settings.about_summary} className="mt-8 space-y-5 text-base leading-8 text-muted sm:text-lg" />
              ) : (
                <div className="mt-8 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              )}
            </Reveal>
            {!!settings?.stats?.length && (
              <Reveal delay={0.15}>
                <div className="mt-12 grid grid-cols-2 gap-8 border-t border-line pt-10">
                  {settings.stats.slice(0, 4).map((s) => (
                    <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
                  ))}
                </div>
              </Reveal>
            )}
          </div>
          <Reveal className="lg:col-span-6" delay={0.1}>
            <div className="sticky top-28">
              <Media
                src={settings?.about_image_url}
                alt="Arjuna Book of World Record championship"
                aspect="aspect-[4/5]"
                className="rounded-3xl"
                placeholderLabel="Organisation photo"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <IsbnSection className="bg-white" />

      {/* Mission & vision */}
      <section className="bg-paper py-24 lg:py-28" aria-label="Mission and vision">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {[
            { id: 'mission', title: 'Our mission', text: settings?.mission, icon: Compass, dark: true },
            { id: 'vision', title: 'Our vision', text: settings?.vision, icon: Eye, dark: false },
          ].map((b, i) => (
            <Reveal key={b.id} delay={i * 0.08}>
              <article
                id={b.id}
                className={cn(
                  'relative h-full scroll-mt-28 overflow-hidden rounded-3xl p-10 lg:p-14',
                  b.dark ? 'bg-navy-900 text-white' : 'bg-white ring-1 ring-line',
                )}
              >
                <b.icon className={cn('size-8', b.dark ? 'text-gold-500' : 'text-red-600')} strokeWidth={1.5} aria-hidden />
                <h2 className={cn('mt-8 font-display text-3xl font-bold uppercase', b.dark ? 'text-white' : 'text-navy-900')}>{b.title}</h2>
                <p className={cn('mt-5 text-lg leading-8', b.dark ? 'text-white/70' : 'text-muted')}>
                  {b.text || 'To be published by Arjuna Book of World Record.'}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Core values */}
      {!!settings?.core_values?.length && (
        <section className="py-24 lg:py-32" aria-labelledby="values-title">
          <div className="container-page">
            <SectionHeader eyebrow="Core values" align="center" title={<span id="values-title">What we stand for</span>} />
            <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3">
              {settings.core_values.map((v, i) => {
                const Icon = valueIcons[i % valueIcons.length]
                return (
                  <li key={v.title} className="group bg-white p-8 transition hover:bg-navy-900 lg:p-10">
                    <Icon className="size-7 text-red-600 transition group-hover:text-gold-500" strokeWidth={1.5} aria-hidden />
                    <h3 className="mt-6 font-display text-xl font-bold text-navy-900 uppercase transition group-hover:text-white">{v.title}</h3>
                    {v.description && <p className="mt-3 text-sm leading-6 text-muted transition group-hover:text-white/65">{v.description}</p>}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="relative overflow-hidden bg-navy-950 py-24 text-white lg:py-32" aria-labelledby="timeline-title">
        <div className="absolute inset-0 bg-grain" aria-hidden />
        <div className="container-page relative">
          <SectionHeader tone="dark" eyebrow="Milestones" title={<span id="timeline-title">The journey so far</span>} />
          <div className="mt-16">
            <QueryBoundary
              query={about}
              onDark
              loading={<Skeleton className="h-64 w-full opacity-10" />}
              isEmpty={(d) => d.milestones.length === 0}
              empty={<EmptyState onDark title="Milestones will be published soon" />}
            >
              {({ milestones }) => (
                <ol className="relative space-y-12 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-white/15 md:before:left-1/2">
                  {milestones.map((m, i) => {
                    const meta = kindMeta[m.kind]
                    const right = i % 2 === 1
                    return (
                      <Reveal as="li" key={m.id} className="relative pl-10 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                        <span
                          className={cn(
                            'absolute top-1.5 left-0 size-[15px] rounded-full border-2 md:left-1/2 md:-translate-x-1/2',
                            meta.gold ? 'border-gold-500 bg-gold-500/30' : 'border-red-600 bg-navy-950',
                          )}
                          aria-hidden
                        />
                        <div className={cn(right ? 'md:col-start-2' : 'md:text-right')}>
                          <p className={cn('font-display text-4xl font-bold tabular-nums', meta.gold ? 'text-gold-300' : 'text-white')}>{m.year}</p>
                          <p
                            className={cn(
                              'mt-2 inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase',
                              meta.gold ? 'text-gold-300/80' : 'text-white/50',
                              !right && 'md:flex-row-reverse',
                            )}
                          >
                            <meta.icon className="size-3.5" aria-hidden />
                            {meta.label}
                          </p>
                          <h3 className="mt-3 font-display text-xl font-semibold">{m.title}</h3>
                          {m.description && <p className="mt-2 text-sm leading-6 text-white/60">{m.description}</p>}
                        </div>
                      </Reveal>
                    )
                  })}
                </ol>
              )}
            </QueryBoundary>
          </div>
        </div>
      </section>

      {/* Major achievements */}
      <section className="py-24 lg:py-32" aria-labelledby="achievements-title">
        <div className="container-page">
          <SectionHeader
            eyebrow="Major achievements"
            accent="gold"
            title={<span id="achievements-title">Recognition earned</span>}
            action={
              <LinkButton to="/awards" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>
                All awards
              </LinkButton>
            }
          />
          <div className="mt-12">
            <QueryBoundary
              query={awards}
              loading={<CardGridSkeleton count={3} aspect="aspect-[5/3]" />}
              isEmpty={(r) => r.length === 0}
              empty={<EmptyState title="Achievements will be published soon" />}
            >
              {(rows) => (
                <div className="grid gap-5 md:grid-cols-3">
                  {rows.map((a) => (
                    <AwardCard key={a.id} award={a} />
                  ))}
                </div>
              )}
            </QueryBoundary>
          </div>
        </div>
      </section>

      {/* Leadership — only when Arjuna Book of World Record has published officials */}
      {!!about.data?.officials.length && (
        <section className="bg-paper py-24 lg:py-32" aria-labelledby="leadership-title">
          <div className="container-page">
            <SectionHeader eyebrow="Leadership" title={<span id="leadership-title">Officials &amp; leadership</span>} />
            <ul className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {about.data.officials.map((o) => (
                <li key={o.id}>
                  <Media src={o.photo_url} alt={o.name} aspect="aspect-[4/5]" className="rounded-2xl" placeholderLabel="Portrait" />
                  <p className="mt-4 font-display font-semibold text-navy-900">{o.name}</p>
                  <p className="text-sm text-muted">{o.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
