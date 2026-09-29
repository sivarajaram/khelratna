import { Link, useParams } from 'react-router'
import { ArrowUpRight, CheckCircle2, Globe2, Trophy } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { getAthlete } from '@/services/content'
import { formatDate, ordinal } from '@/utils/format'
import { Seo, absoluteUrl } from '@/components/common/Seo'
import { Media } from '@/components/common/Media'
import { MedalBadge } from '@/components/common/Badge'
import { Paragraphs } from '@/components/common/Markdown'
import { ErrorState, LoadingState } from '@/components/common/States'
import { Reveal } from '@/components/common/Reveal'
import NotFoundPage from './NotFoundPage'

export default function AthletePage() {
  const { slug = '' } = useParams()
  const q = useQuery(`athlete:${slug}`, () => getAthlete(slug))

  if (q.data === null) return <NotFoundPage title="Athlete not found" />
  if (!q.data) {
    return <div className="container-page pt-40 pb-24">{q.error ? <ErrorState message={q.error} onRetry={q.reload} /> : <LoadingState />}</div>
  }

  const { athlete: a, results, records } = q.data
  const medals = [
    { label: 'Gold', value: a.gold_count, cls: 'text-gold-300' },
    { label: 'Silver', value: a.silver_count, cls: 'text-slate-200' },
    { label: 'Bronze', value: a.bronze_count, cls: 'text-[#e0a877]' },
  ]
  const championships = [...new Map(results.filter((r) => r.competition).map((r) => [r.competition!.id, r.competition!])).values()]

  return (
    <>
      <Seo
        title={a.name}
        description={`${a.name} — ${a.category ?? 'Karate'} athlete. Career highlights, medals and championships.`}
        image={a.photo_url}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: a.name,
          url: absoluteUrl(`/athletes/${a.slug}`),
          ...(a.photo_url ? { image: a.photo_url } : {}),
          ...(a.country ? { nationality: a.country } : {}),
        }}
      />

      {/* Athlete hero: portrait-led */}
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 -z-10 bg-grain" aria-hidden />
        <div className="absolute -top-32 left-1/3 -z-10 size-[40rem] rounded-full bg-navy-700/40 blur-3xl" aria-hidden />
        <div className="container-page grid items-end gap-10 pt-32 pb-16 lg:grid-cols-12 lg:pt-40 lg:pb-20">
          <Reveal className="lg:col-span-5">
            <Media src={a.photo_url} alt={a.name} aspect="aspect-[4/5]" className="rounded-3xl" priority placeholderLabel="Athlete portrait" />
          </Reveal>
          <div className="lg:col-span-7 lg:pb-6">
            <nav aria-label="Breadcrumb" className="mb-6 text-xs text-white/50">
              <Link to="/champions" className="hover:text-white">
                Champions
              </Link>{' '}
              / <span className="text-white/80">{a.name}</span>
            </nav>
            <p className="eyebrow eyebrow-gold text-gold-300">Karate champion</p>
            <h1 className="display-xl mt-5">{a.name}</h1>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              {a.category && <span>{a.category}</span>}
              {a.country && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="size-4" aria-hidden />
                  {a.country}
                </span>
              )}
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10">
              {medals.map((m) => (
                <div key={m.label} className="flex flex-col-reverse bg-navy-950/60 p-5 text-center backdrop-blur">
                  <dt className="mt-1 text-[0.6875rem] font-semibold tracking-[0.18em] text-white/50 uppercase">{m.label}</dt>
                  <dd className={`font-display text-4xl font-bold tabular-nums ${m.cls}`}>{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-7">
            {a.biography && (
              <div>
                <h2 className="display-md text-navy-900">Biography</h2>
                <Paragraphs text={a.biography} className="mt-6 space-y-5 text-lg leading-8 text-muted" />
              </div>
            )}

            <div>
              <h2 className="display-md text-navy-900">Championship results</h2>
              {results.length ? (
                <ul className="mt-6 divide-y divide-line rounded-2xl ring-1 ring-line">
                  {results.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                      <div>
                        {r.competition ? (
                          <Link to={`/competitions/${r.competition.slug}`} className="font-medium text-ink hover:text-navy-600">
                            {r.competition.name}
                          </Link>
                        ) : (
                          <span className="font-medium text-ink">Championship</span>
                        )}
                        <p className="mt-0.5 text-sm text-muted">{[r.category, r.age_group, r.year].filter(Boolean).join(' · ')}</p>
                      </div>
                      {r.medal ? <MedalBadge medal={r.medal} /> : r.position ? <span className="text-sm font-semibold">{ordinal(r.position)}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-muted">No published results yet.</p>
              )}
            </div>
          </div>

          <aside className="space-y-8 lg:col-span-5">
            {a.achievements.length > 0 && (
              <div className="rounded-3xl bg-paper p-8">
                <h2 className="font-display text-lg font-semibold text-navy-900">Career highlights</h2>
                <ul className="mt-5 space-y-3">
                  {a.achievements.map((x) => (
                    <li key={x} className="flex gap-3 text-sm leading-6 text-ink/85">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {championships.length > 0 && (
              <div className="rounded-3xl p-8 ring-1 ring-line">
                <h2 className="font-display text-lg font-semibold text-navy-900">Major championships</h2>
                <ul className="mt-5 space-y-3">
                  {championships.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/competitions/${c.slug}`}
                        className="group flex items-center justify-between gap-3 text-sm font-medium text-ink hover:text-navy-600"
                      >
                        {c.name}
                        <ArrowUpRight className="size-4 shrink-0 text-muted group-hover:text-navy-600" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {records.length > 0 && (
              <div className="rounded-3xl bg-navy-950 p-8 text-white">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Trophy className="size-5 text-gold-500" aria-hidden /> World records
                </h2>
                <ul className="mt-5 space-y-4">
                  {records.map((r) => (
                    <li key={r.id}>
                      <Link to={`/world-records/${r.slug}`} className="block rounded-xl border border-gold-500/25 p-4 hover:border-gold-500/60">
                        <p className="font-medium">{r.title}</p>
                        <p className="mt-1 text-xs text-white/55">{[formatDate(r.record_date), r.location].filter(Boolean).join(' · ')}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}
