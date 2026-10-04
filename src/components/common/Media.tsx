import { useState } from 'react'
import { Camera } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MediaProps {
  src: string | null | undefined
  alt: string
  className?: string
  imgClassName?: string
  /** Tailwind aspect class, e.g. "aspect-[4/3]". Omit when the parent sizes the box. */
  aspect?: string
  priority?: boolean
  /** Label shown on the branded placeholder when no photo exists yet. */
  placeholderLabel?: string
  /** Placeholder style: light neutral by default; 'dark' and 'gold' for dark sections and overlaid text. */
  tone?: 'navy' | 'ink' | 'gold' | 'dark'
  sizes?: string
}

const toneBg = {
  navy: 'from-navy-100 via-navy-50 to-paper',
  ink: 'from-[#e6eaec] via-[#eef1f2] to-paper',
  dark: 'from-navy-700 via-navy-900 to-navy-950',
  gold: 'from-[#3a3114] via-navy-900 to-navy-950',
}
const darkTones = new Set(['dark', 'gold'])

/**
 * Image with lazy loading, a fade-in on load and a branded placeholder when the
 * photo is missing or fails. Placeholders make it obvious a real photo is still needed.
 */
export function Media({ src, alt, className, imgClassName, aspect, priority, placeholderLabel = 'Photo coming soon', tone = 'navy', sizes }: MediaProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showImage = !!src && !failed
  const dark = darkTones.has(tone)

  return (
    <div className={cn('relative overflow-hidden', dark ? 'bg-navy-900' : 'bg-paper', aspect, className)}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('size-full object-cover transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
        />
      ) : (
        <div className={cn('absolute inset-0 bg-gradient-to-br', toneBg[tone])} role="img" aria-label={alt}>
          <div
            className={cn(
              'absolute inset-0',
              dark
                ? 'bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0_1px,transparent_1px_22px)]'
                : 'bg-[repeating-linear-gradient(135deg,rgba(20,42,49,0.035)_0_1px,transparent_1px_22px)]',
            )}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div className={cn('flex flex-col items-center gap-2', dark ? 'text-white/35' : 'text-navy-700/35')}>
              <Camera className="size-6" strokeWidth={1.4} aria-hidden />
              <span className="text-[0.625rem] font-medium tracking-[0.2em] uppercase">{placeholderLabel}</span>
            </div>
          </div>
        </div>
      )}
      {showImage && !loaded && <div className={cn('absolute inset-0 animate-pulse', dark ? 'bg-navy-800' : 'bg-navy-50')} aria-hidden />}
    </div>
  )
}
