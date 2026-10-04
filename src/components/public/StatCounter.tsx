import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'

const fmt = new Intl.NumberFormat('en-IN')

interface StatCounterProps {
  value: number
  suffix?: string
  label: string
  className?: string
  tone?: 'light' | 'dark'
}

/** Counts up from zero the first time it scrolls into view. */
export function StatCounter({ value, suffix = '', label, className, tone = 'light' }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setDisplay(Math.round(v)) })
    return () => controls.stop()
  }, [inView, value, reduce])

  const dark = tone === 'dark'
  return (
    <div ref={ref} className={cn('text-left', className)}>
      <p className={cn('font-display text-4xl font-bold tracking-tight tabular-nums sm:text-5xl', dark ? 'text-white' : 'text-navy-900')}>
        <span className="sr-only">
          {fmt.format(value)}
          {suffix}
        </span>
        <span aria-hidden>
          {fmt.format(display)}
          <span className="text-accent-600">{suffix}</span>
        </span>
      </p>
      <p className={cn('mt-2 text-xs font-semibold tracking-[0.16em] uppercase', dark ? 'text-white/55' : 'text-muted')}>{label}</p>
    </div>
  )
}
