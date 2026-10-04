import { useState } from 'react'
import { BadgeCheck, Download, Expand } from 'lucide-react'
import type { GalleryItem } from '@/types/database'
import { publication as pub } from '@/config/publication'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'
import { Reveal } from '@/components/common/Reveal'
import { ImageLightbox } from './GalleryGrid'

const slipItem: GalleryItem = {
  id: 'isbn-acknowledgement',
  media_type: 'image',
  url: pub.images.acknowledgementFull,
  thumbnail_url: null,
  caption: `ISBN Acknowledgement Slip — ${pub.issuedBy}, ${pub.issuerDepartment}`,
  alt: `ISBN acknowledgement slip for ${pub.bookTitle}, ISBN ${pub.isbn}`,
  category: 'events',
  competition_id: null,
  album: null,
  sort_order: 0,
  status: 'published',
  created_at: '',
  updated_at: '',
}

const details: [string, string][] = [
  ['Book title', pub.bookTitle],
  ['Publisher', pub.publisher],
  ['Author', pub.author],
  ['Language', pub.language],
  ['Year of publication', String(pub.year)],
  ['ISBN allotted on', formatDate(pub.allottedDate, true)],
]

/** Official ISBN registration: number, barcode and the government acknowledgement slip. */
export function IsbnSection({ className }: { className?: string }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className={cn('relative overflow-hidden bg-paper py-24 lg:py-28', className)} aria-labelledby="isbn-title">
      <div className="container-page grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow eyebrow-gold text-gold-700">Officially registered</p>
            <h2 id="isbn-title" className="display-lg mt-5 text-navy-900">
              An ISBN-registered publication
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
              {pub.bookTitle} is officially registered with the {pub.issuedBy}, {pub.issuerDepartment}.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-navy-900 px-6 py-4 text-white shadow-[0_20px_40px_-20px_rgba(20,42,49,0.6)]">
              <BadgeCheck className="size-7 shrink-0 text-gold-500" aria-hidden />
              <div>
                <p className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-300 uppercase">ISBN</p>
                <p className="font-display text-[1.35rem] font-bold tracking-wide whitespace-nowrap tabular-nums sm:text-3xl">{pub.isbn}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-line pt-8 sm:grid-cols-2">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{k}</dt>
                  <dd className="mt-1 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="space-y-5 lg:col-span-6">
          <Reveal delay={0.1}>
            <figure className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <img src={pub.images.barcode} alt={`ISBN barcode ${pub.isbn}`} loading="lazy" className="mx-auto h-auto w-full max-w-xs" />
              <figcaption className="mt-3 text-center text-xs text-muted">ISBN barcode</figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.16}>
            <figure className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
              <button
                type="button"
                onClick={() => setOpen(0)}
                className="group relative block w-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-600"
                aria-label="Enlarge the ISBN acknowledgement slip"
              >
                <img src={pub.images.acknowledgement} alt={slipItem.alt ?? ''} loading="lazy" className="w-full" />
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-navy-900/85 px-3 py-1.5 text-xs font-medium text-white opacity-90 backdrop-blur transition group-hover:opacity-100">
                  <Expand className="size-3.5" aria-hidden /> View full size
                </span>
              </button>
              <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 text-sm">
                <span className="text-muted">Acknowledgement Slip · Indian ISBN Agency</span>
                <a
                  href={pub.images.acknowledgementFull}
                  download="ABWR-ISBN-Acknowledgement.jpg"
                  className="inline-flex items-center gap-1.5 font-medium text-navy-700 hover:text-navy-900"
                >
                  <Download className="size-4" aria-hidden /> Download
                </a>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>

      <ImageLightbox items={[slipItem]} index={open} onChange={setOpen} />
    </section>
  )
}
