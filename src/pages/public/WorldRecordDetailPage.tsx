import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowUpRight, CalendarDays, FileBadge2, FileText, MapPin, ShieldCheck, Tag, User } from 'lucide-react'
import type { GalleryItem } from '@/types/database'
import { useQuery } from '@/hooks/useQuery'
import { getAthleteSlugs, getWorldRecord } from '@/services/content'
import { formatDate, youtubeId } from '@/utils/format'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { Paragraphs } from '@/components/common/Markdown'
import { ErrorState, LoadingState } from '@/components/common/States'
import { GalleryGrid } from '@/components/public/GalleryGrid'
import NotFoundPage from './NotFoundPage'

export default function WorldRecordDetailPage() {
  const { slug = '' } = useParams()
  const q = useQuery(`record:${slug}`, async () => {
    const record = await getWorldRecord(slug)
    if (!record) return null
    const slugs = record.athlete_id ? await getAthleteSlugs([record.athlete_id]) : new Map<string, string>()
    return { record, athleteSlug: record.athlete_id ? slugs.get(record.athlete_id) : undefined }
  })

  const images = useMemo<GalleryItem[]>(
    () =>
      (q.data?.record.images ?? []).map((url, i) => ({
        id: `${i}`,
        url,
        media_type: 'image',
        thumbnail_url: null,
        caption: null,
        alt: `${q.data?.record.title} — image ${i + 1}`,
        category: 'world-records',
        competition_id: null,
        album: null,
        sort_order: i,
        status: 'published',
        created_at: '',
        updated_at: '',
      })),
    [q.data],
  )

  if (q.data === null) return <NotFoundPage title="Record not found" />
  const r = q.data?.record
  const ytId = youtubeId(r?.video_url)

  return (
    <div className="bg-navy-950 text-white">
      {r && <Seo title={r.title} description={r.description} image={r.cover_image_url} />}
      <PageHero
        variant="prestige"
        image={r?.cover_image_url}
        eyebrow={r?.category ? `World record · ${r.category}` : 'World record'}
        title={r?.title ?? 'World record'}
        crumbs={[{ to: '/world-records', label: 'World Records' }, { label: r?.title ?? '…' }]}
      >
        {r?.recognition_org && (
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm text-gold-100">
            <ShieldCheck className="size-4 text-gold-300" aria-hidden />
            Recognised by {r.recognition_org}
          </p>
        )}
      </PageHero>

      {!r && (
        <div className="container-page py-20">
          {q.error ? <ErrorState onDark message={q.error} onRetry={q.reload} /> : <LoadingState className="text-white/60" />}
        </div>
      )}

      {r && (
        <section className="relative pb-28">
          <div className="absolute inset-0 bg-grain" aria-hidden />
          <div className="container-page relative grid gap-14 pt-16 lg:grid-cols-12">
            <div className="space-y-14 lg:col-span-7">
              <div>
                <p className="eyebrow eyebrow-gold text-gold-300">The achievement</p>
                <Paragraphs text={r.story ?? r.description} className="mt-6 space-y-5 text-lg leading-8 text-white/70" />
              </div>

              {(ytId || r.video_url) && (
                <div>
                  <h2 className="font-display text-xl font-semibold">Video</h2>
                  <div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-gold-500/20">
                    {ytId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                        title={`${r.title} video`}
                        allowFullScreen
                        loading="lazy"
                        className="size-full"
                      />
                    ) : (
                      <video src={r.video_url!} controls preload="metadata" className="size-full" />
                    )}
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold">Gallery</h2>
                  <GalleryGrid items={images} className="mt-5" />
                </div>
              )}
            </div>

            <aside className="lg:col-span-5">
              <div className="space-y-6 lg:sticky lg:top-28">
                <div className="rounded-3xl border border-gold-500/25 bg-white/[0.04] p-8">
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">Record information</h2>
                  <dl className="mt-6 space-y-5 text-sm">
                    {[
                      { icon: User, label: 'Record holder', value: r.holder_name, to: q.data?.athleteSlug ? `/athletes/${q.data.athleteSlug}` : undefined },
                      { icon: CalendarDays, label: 'Date', value: formatDate(r.record_date, true) },
                      { icon: MapPin, label: 'Location', value: r.location },
                      { icon: Tag, label: 'Category', value: r.category },
                      { icon: ShieldCheck, label: 'Recognition organisation', value: r.recognition_org },
                    ]
                      .filter((x) => x.value)
                      .map((x) => (
                        <div key={x.label} className="flex gap-4">
                          <x.icon className="mt-0.5 size-4 shrink-0 text-gold-500/70" aria-hidden />
                          <div>
                            <dt className="text-xs text-white/45">{x.label}</dt>
                            <dd className="mt-0.5 font-medium">
                              {x.to ? (
                                <Link to={x.to} className="inline-flex items-center gap-1 hover:text-gold-300">
                                  {x.value} <ArrowUpRight className="size-3.5" aria-hidden />
                                </Link>
                              ) : (
                                x.value
                              )}
                            </dd>
                          </div>
                        </div>
                      ))}
                  </dl>
                </div>

                {(r.certificate_url || r.documents.length > 0) && (
                  <div className="rounded-3xl bg-white/[0.04] p-8 ring-1 ring-white/10">
                    <h2 className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">Supporting evidence</h2>
                    <ul className="mt-5 space-y-3">
                      {r.certificate_url && (
                        <li>
                          <a
                            href={r.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl bg-gold-500/10 p-4 text-sm font-medium text-gold-100 hover:bg-gold-500/20"
                          >
                            <FileBadge2 className="size-5 text-gold-300" aria-hidden /> Record certificate
                          </a>
                        </li>
                      )}
                      {r.documents.map((d) => (
                        <li key={d.url + d.name}>
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl p-4 text-sm text-white/80 ring-1 ring-white/10 hover:ring-gold-500/40"
                          >
                            <FileText className="size-5 text-white/50" aria-hidden /> {d.name}
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
      )}
    </div>
  )
}
