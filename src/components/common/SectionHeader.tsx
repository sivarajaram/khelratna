import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Reveal } from './Reveal'

interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  accent?: 'red' | 'gold'
  className?: string
  as?: 'h1' | 'h2'
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  tone = 'light',
  accent = 'red',
  className,
  as: H = 'h2',
}: SectionHeaderProps) {
  const dark = tone === 'dark'
  return (
    <Reveal className={cn('flex flex-col gap-6', align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between', className)}>
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p
            className={cn(
              'eyebrow mb-4',
              accent === 'gold' && 'eyebrow-gold',
              dark ? (accent === 'gold' ? 'text-gold-300' : 'text-white/70') : 'text-navy-700',
            )}
          >
            {eyebrow}
          </p>
        )}
        <H className={cn('display-lg', dark ? 'text-white' : 'text-navy-900')}>{title}</H>
        {description && (
          <p className={cn('mt-5 max-w-2xl text-base leading-7 sm:text-lg', align === 'center' && 'mx-auto', dark ? 'text-white/65' : 'text-muted')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  )
}
