import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import type { CompetitionStatus, Medal } from '@/types/database'

type Tone = 'neutral' | 'navy' | 'accent' | 'gold' | 'green' | 'amber' | 'dark'

const tones: Record<Tone, string> = {
  neutral: 'bg-paper text-muted ring-line',
  navy: 'bg-navy-50 text-navy-800 ring-navy-100',
  accent: 'bg-accent-50 text-accent-700 ring-accent-600/15',
  gold: 'bg-gold-50 text-gold-700 ring-gold-500/30',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  dark: 'bg-navy-950/70 text-white ring-white/15 backdrop-blur',
}

export function Badge({ tone = 'neutral', children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}

const statusTone: Record<CompetitionStatus, Tone> = {
  draft: 'neutral',
  upcoming: 'navy',
  ongoing: 'accent',
  completed: 'green',
  cancelled: 'neutral',
}

export function CompetitionStatusBadge({ status, onDark }: { status: CompetitionStatus; onDark?: boolean }) {
  return (
    <Badge tone={onDark ? 'dark' : statusTone[status]} dot={status === 'ongoing'} className={status === 'ongoing' && onDark ? 'text-accent-50' : ''}>
      {status === 'ongoing' ? 'Live now' : status}
    </Badge>
  )
}

const medalStyle: Record<Medal, string> = {
  gold: 'from-gold-300 to-gold-600 text-navy-950',
  silver: 'from-slate-100 to-silver text-navy-950',
  bronze: 'from-[#d99a62] to-bronze text-white',
}

export function MedalBadge({ medal, className }: { medal: Medal; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.1em] uppercase shadow-sm',
        medalStyle[medal],
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
        <circle cx="8" cy="9.5" r="5" fill="currentColor" opacity=".25" />
        <circle cx="8" cy="9.5" r="3" fill="currentColor" />
        <path d="M5 1h2.2L8 4.2 8.8 1H11L9.3 5.2H6.7Z" fill="currentColor" />
      </svg>
      {medal}
    </span>
  )
}
