import { ImageOff, Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate, titleCase } from '@/utils/format'

const statusColors: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  valid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  responded: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  upcoming: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  ongoing: 'bg-red-50 text-red-700 ring-red-600/20',
  new: 'bg-red-50 text-red-700 ring-red-600/20',
  read: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  archived: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  revoked: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

export function StatusPill({ status }: { status: unknown }) {
  const s = String(status ?? '')
  if (!s) return null
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        statusColors[s] ?? 'bg-paper text-muted ring-line',
      )}
    >
      {titleCase(s)}
    </span>
  )
}

export function Thumb({ src, square }: { src: unknown; square?: boolean }) {
  const url = typeof src === 'string' && src ? src : null
  return (
    <div className={cn('grid shrink-0 place-items-center overflow-hidden rounded-md bg-paper ring-1 ring-line', square ? 'size-10' : 'h-10 w-14')}>
      {url ? <img src={url} alt="" loading="lazy" className="size-full object-cover" /> : <ImageOff className="size-4 text-muted-light" aria-hidden />}
    </div>
  )
}

export function TitleCell({
  title,
  subtitle,
  image,
  featured,
  square,
}: {
  title: unknown
  subtitle?: unknown
  image?: unknown
  featured?: unknown
  square?: boolean
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {image !== undefined && <Thumb src={image} square={square} />}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate font-medium text-ink">
          {String(title ?? '—')}
          {featured === true && <Star className="size-3.5 shrink-0 fill-gold-500 text-gold-500" aria-label="Featured" />}
        </p>
        {subtitle ? <p className="truncate text-xs text-muted">{String(subtitle)}</p> : null}
      </div>
    </div>
  )
}

export const dateCell = (v: unknown) => <span className="whitespace-nowrap text-muted">{formatDate(typeof v === 'string' ? v : null) || '—'}</span>
export const textCell = (v: unknown) => <span className="text-muted">{v == null || v === '' ? '—' : String(v)}</span>
