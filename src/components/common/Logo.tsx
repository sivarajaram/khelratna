import { cn } from '@/utils/cn'

interface LogoProps {
  logoUrl?: string | null
  name?: string
  tone?: 'light' | 'dark'
  className?: string
  showTagline?: boolean
}

/** Default emblem shipped with the site; Site Settings › Logo overrides it. */
export const DEFAULT_LOGO = '/logo.webp'

/** Circular emblem + wordmark. The wordmark stays so the name is always readable. */
export function Logo({ logoUrl, name = 'Arjuna Book of World Record', tone = 'dark', className, showTagline = true }: LogoProps) {
  const light = tone === 'light'
  // "Arjuna Book of World Record" -> "ARJUNA" over "BOOK OF WORLD RECORD", matching the badge
  const [first, ...rest] = name.trim().split(/\s+/)
  const subtitle = rest.join(' ')
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <img
        src={logoUrl || DEFAULT_LOGO}
        alt=""
        width={44}
        height={44}
        decoding="async"
        className={cn('size-11 shrink-0 rounded-full object-contain', light ? 'ring-1 ring-white/20' : 'shadow-sm')}
      />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-[1.05rem] font-bold tracking-[0.2em] uppercase', light ? 'text-white' : 'text-navy-900')}>{first}</span>
        {showTagline && subtitle && (
          <span className={cn('mt-1 text-[0.58rem] font-medium tracking-[0.2em] uppercase', light ? 'text-white/60' : 'text-muted')}>{subtitle}</span>
        )}
      </span>
    </span>
  )
}
