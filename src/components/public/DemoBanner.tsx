import { useEffect, useRef } from 'react'
import { Info } from 'lucide-react'
import { isDemoMode } from '@/lib/env'

/** Visible notice that the site is showing placeholder content (no Supabase configured). */
export function DemoBanner() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isDemoMode || !ref.current) return
    const el = ref.current
    const set = () => document.documentElement.style.setProperty('--banner-h', `${el.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty('--banner-h')
    }
  }, [])

  if (!isDemoMode) return null
  return (
    <div ref={ref} className="fixed inset-x-0 top-0 z-[55] bg-gold-500 text-navy-950" role="note">
      <p className="container-page flex items-center justify-center gap-2 py-1.5 text-center text-[0.72rem] font-medium">
        <Info className="size-3.5 shrink-0" aria-hidden />
        Demo mode — all names, dates, numbers and records shown are placeholders, not real Arjuna Book of World Record information.
      </p>
    </div>
  )
}
