import { Link } from 'react-router'
import { ArrowUpRight, Award as AwardIcon, CalendarDays, Globe2, MapPin, ShieldCheck, Trophy } from 'lucide-react'
import type { Award, Competition, NewsArticle, WorldRecord } from '@/types/database'
import type { ChampionWithCompetition } from '@/services/content'
import { cn } from '@/utils/cn'
import { formatDate, formatDateRange, ordinal, truncate } from '@/utils/format'
import { Media } from '@/components/common/Media'
import { Badge, CompetitionStatusBadge, MedalBadge } from '@/components/common/Badge'

// Each card is one link: the title anchor stretches over the card via ::after,
// so the card is fully clickable while screen readers hear a single link.
const stretched = 'after:absolute after:inset-0 after:z-10 after:content-[""] focus-visible:outline-none'
const cardFocus = 'focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-accent-600'

// ---------------------------------------------------------------- competition
export function CompetitionCard({ competition: c, className }: { competition: Competition; className?: string }) {
  return (
    <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line card-hover', cardFocus, className)}>
      <div className="relative">
        <Media
          src={c.cover_image_url}
          alt={c.name}
          aspect="aspect-[16/10]"
          imgClassName="transition duration-700 group-hover:scale-[1.04]"
          placeholderLabel="Competition photo"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <CompetitionStatusBadge status={c.status} onDark />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {c.level && <p className="text-[0.6875rem] font-semibold tracking-[0.2em] text-accent-600 uppercase">{c.level}</p>}
        <h3 className="mt-2 font-display text-xl leading-snug font-semibold text-navy-900">
          <Link to={`/competitions/${c.slug}`} className={stretched}>
            {c.name}
          </Link>
        </h3>
        <dl className="mt-4 space-y-2 text-sm text-muted">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Date</dt>
            <CalendarDays className="size-4 shrink-0 text-navy-700" aria-hidden />
            <dd>{formatDateRange(c.start_date, c.end_date)}</dd>
          </div>
          {c.location && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <MapPin className="size-4 shrink-0 text-navy-700" aria-hidden />
              <dd>{c.location}</dd>
            </div>
          )}
        </dl>
        {c.short_description && <p className="mt-4 text-sm leading-6 text-muted">{truncate(c.short_description, 140)}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-semibold tracking-[0.14em] text-navy-900 uppercase">
          View details <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </article>
  )
}

// ------------------------------------------------------------------- champion
export function ChampionCard({ champion: c, athleteSlug }: { champion: ChampionWithCompetition; athleteSlug?: string }) {
  return (
    <article className={cn('group relative overflow-hidden rounded-2xl bg-navy-900', cardFocus)}>
      <Media
        src={c.photo_url}
        alt={`${c.name}, ${c.category ?? 'Karate'} champion`}
        aspect="aspect-[4/5]"
        imgClassName="transition duration-700 group-hover:scale-[1.04]"
        placeholderLabel="Athlete photo"
        tone="dark"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" aria-hidden />
      {c.medal && <MedalBadge medal={c.medal} className="absolute top-4 left-4" />}
      {c.year && <span className="absolute top-4 right-4 font-display text-sm font-semibold text-white/70">{c.year}</span>}
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        {c.category && <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-gold-300 uppercase">{c.category}</p>}
        <h3 className="mt-1.5 font-display text-xl leading-tight font-semibold uppercase">
          {athleteSlug ? (
            <Link to={`/athletes/${athleteSlug}`} className={stretched}>
              {c.name}
            </Link>
          ) : (
            c.name
          )}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs text-white/60">
          {[c.position && !c.medal ? `${ordinal(c.position)} place` : null, c.competition?.name, c.age_group].filter(Boolean).join(' · ')}
        </p>
      </div>
    </article>
  )
}

// --------------------------------------------------------------- world record
export function RecordCard({ record: r, featured }: { record: WorldRecord; featured?: boolean }) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-b from-white/[0.06] to-white/[0.02] transition duration-500 hover:border-gold-500/60',
        cardFocus,
      )}
    >
      <div className="relative">
        <Media
          src={r.cover_image_url}
          alt={r.title}
          aspect={featured ? 'aspect-[16/9]' : 'aspect-[3/2]'}
          tone="gold"
          placeholderLabel="Record photo"
          imgClassName="transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" aria-hidden />
        {r.category && (
          <Badge tone="dark" className="absolute top-4 left-4 text-gold-300!">
            {r.category}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-gold-300">
          <Trophy className="size-4" aria-hidden />
          <span className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase">World record</span>
        </div>
        <h3 className="mt-3 font-display text-xl leading-snug font-semibold text-white">
          <Link to={`/world-records/${r.slug}`} className={stretched}>
            {r.title}
          </Link>
        </h3>
        {r.holder_name && <p className="mt-2 text-sm font-medium text-white/80">{r.holder_name}</p>}
        {r.description && <p className="mt-3 text-sm leading-6 text-white/55">{truncate(r.description, 130)}</p>}
        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-xs">
          <div>
            <dt className="text-white/40">Date</dt>
            <dd className="mt-0.5 text-white/80">{formatDate(r.record_date) || '—'}</dd>
          </div>
          <div>
            <dt className="text-white/40">Location</dt>
            <dd className="mt-0.5 text-white/80">{r.location || '—'}</dd>
          </div>
          {r.recognition_org && (
            <div className="col-span-2 flex items-start gap-2 text-gold-300/90">
              <dt className="sr-only">Recognised by</dt>
              <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden />
              <dd>{r.recognition_org}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------- award
export const awardCategoryLabels: Record<Award['category'], string> = {
  organization: 'Organisation Award',
  athlete: 'Athlete Award',
  championship: 'Championship Achievement',
  special: 'Special Recognition',
  international: 'International Recognition',
}

export function AwardCard({ award: a, className }: { award: Award; className?: string }) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition duration-300 hover:border-gold-500/50 hover:shadow-[0_18px_40px_-20px_rgba(201,162,39,0.45)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {a.image_url ? (
          <img src={a.image_url} alt="" loading="lazy" className="size-16 rounded-xl object-cover ring-1 ring-gold-500/30" />
        ) : (
          <div className="grid size-16 place-items-center rounded-xl bg-gradient-to-br from-gold-50 to-gold-100 text-gold-600 ring-1 ring-gold-500/25">
            {a.category === 'international' ? (
              <Globe2 className="size-7" strokeWidth={1.5} aria-hidden />
            ) : (
              <AwardIcon className="size-7" strokeWidth={1.5} aria-hidden />
            )}
          </div>
        )}
        {a.year && <span className="font-display text-2xl font-bold text-navy-900/15">{a.year}</span>}
      </div>
      <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.18em] text-gold-600 uppercase">{awardCategoryLabels[a.category]}</p>
      <h3 className="mt-2 font-display text-lg leading-snug font-semibold text-navy-900">{a.name}</h3>
      {a.recipient && <p className="mt-1 text-sm font-medium text-ink/80">{a.recipient}</p>}
      {a.description && <p className="mt-3 text-sm leading-6 text-muted">{a.description}</p>}
    </article>
  )
}

// ----------------------------------------------------------------------- news
export function NewsCard({ article: n, variant = 'default' }: { article: NewsArticle; variant?: 'default' | 'feature' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <article className={cn('group relative flex gap-4', cardFocus, 'rounded-xl')}>
        <Media src={n.cover_image_url} alt="" className="w-28 shrink-0 rounded-xl sm:w-36" aspect="aspect-[4/3]" placeholderLabel="" />
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-accent-600 uppercase">
            {n.category}
            <span className="text-muted"> · {formatDate(n.publish_date)}</span>
          </p>
          <h3 className="mt-1.5 font-display leading-snug font-semibold text-navy-900 group-hover:text-navy-600">
            <Link to={`/news/${n.slug}`} className={stretched}>
              {n.title}
            </Link>
          </h3>
        </div>
      </article>
    )
  }
  const feature = variant === 'feature'
  return (
    <article className={cn('group relative flex h-full flex-col', cardFocus, 'rounded-2xl')}>
      <Media
        src={n.cover_image_url}
        alt=""
        aspect={feature ? 'aspect-[16/10]' : 'aspect-[3/2]'}
        className="rounded-2xl"
        imgClassName="transition duration-700 group-hover:scale-[1.03]"
        placeholderLabel="News photo"
      />
      <div className="flex flex-1 flex-col pt-5">
        <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-accent-600 uppercase">
          {n.category ?? 'News'}
          <span className="text-muted"> · {formatDate(n.publish_date)}</span>
        </p>
        <h3
          className={cn(
            'mt-2 font-display leading-snug font-semibold text-navy-900 transition group-hover:text-navy-600',
            feature ? 'text-2xl sm:text-3xl' : 'text-lg',
          )}
        >
          <Link to={`/news/${n.slug}`} className={stretched}>
            {n.title}
          </Link>
        </h3>
        {n.excerpt && <p className={cn('mt-3 leading-6 text-muted', feature ? 'text-base' : 'text-sm')}>{truncate(n.excerpt, feature ? 220 : 130)}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold tracking-[0.14em] text-navy-900 uppercase">
          Read more <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </article>
  )
}
