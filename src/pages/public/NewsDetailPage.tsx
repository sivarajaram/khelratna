import { Link, useParams } from 'react-router'
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { getNewsArticle } from '@/services/content'
import { formatDate } from '@/utils/format'
import { Seo, absoluteUrl } from '@/components/common/Seo'
import { Media } from '@/components/common/Media'
import { Markdown } from '@/components/common/Markdown'
import { ErrorState, LoadingState } from '@/components/common/States'
import { NewsCard } from '@/components/public/Cards'
import NotFoundPage from './NotFoundPage'

export default function NewsDetailPage() {
  const { slug = '' } = useParams()
  const { settings } = useSiteSettings()
  const q = useQuery(`news:${slug}`, () => getNewsArticle(slug))

  if (q.data === null) return <NotFoundPage title="Article not found" />
  if (!q.data) {
    return (
      <div className="bg-navy-900 pt-32 pb-24">
        <div className="container-page">
          {q.error ? <ErrorState onDark message={q.error} onRetry={q.reload} /> : <LoadingState className="text-white/60" />}
        </div>
      </div>
    )
  }

  const { article: n, related } = q.data
  return (
    <>
      <Seo
        title={n.seo_title || n.title}
        description={n.seo_description || n.excerpt}
        image={n.cover_image_url}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: n.title,
          datePublished: n.publish_date,
          dateModified: n.updated_at || n.publish_date,
          url: absoluteUrl(`/news/${n.slug}`),
          ...(n.cover_image_url ? { image: [n.cover_image_url] } : {}),
          author: { '@type': n.author ? 'Person' : 'Organization', name: n.author ?? settings?.org_name ?? 'Arjuna Book of World Record' },
          publisher: { '@type': 'Organization', name: settings?.org_name ?? 'Arjuna Book of World Record' },
        }}
      />

      <article>
        {/* Editorial header: text first, then a full-width image */}
        <header className="bg-navy-900 pt-32 pb-40 text-white lg:pt-40 lg:pb-48">
          <div className="container-page max-w-4xl">
            <Link to="/news" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-white/60 uppercase hover:text-white">
              <ArrowLeft className="size-4" aria-hidden /> All news
            </Link>
            {n.category && <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-red-600 uppercase">{n.category}</p>}
            <h1 className="mt-4 font-display text-3xl leading-tight font-bold tracking-tight sm:text-5xl sm:leading-[1.1]">{n.title}</h1>
            {n.excerpt && <p className="mt-6 text-lg leading-8 text-white/70">{n.excerpt}</p>}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden />
                <time dateTime={n.publish_date}>{formatDate(n.publish_date, true)}</time>
              </span>
              {n.author && (
                <span className="inline-flex items-center gap-2">
                  <UserRound className="size-4" aria-hidden />
                  {n.author}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="container-page -mt-28 max-w-5xl lg:-mt-36">
          <Media src={n.cover_image_url} alt={n.title} aspect="aspect-[16/9]" className="rounded-3xl shadow-2xl" priority placeholderLabel="Article photo" />
        </div>

        <div className="container-page max-w-3xl py-16 lg:py-20">
          <Markdown source={n.content} className="prose-kr" />
        </div>
      </article>

      {related.length > 0 && (
        <aside className="border-t border-line bg-paper py-20" aria-labelledby="related-title">
          <div className="container-page">
            <h2 id="related-title" className="display-md text-navy-900">
              Related news
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <NewsCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
