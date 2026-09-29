import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import type { GalleryItem } from '@/types/database'
import { cn } from '@/utils/cn'
import { youtubeId } from '@/utils/format'
import { Media } from '@/components/common/Media'
import { useDialogBehaviour } from '@/components/common/Modal'

// Placeholder tiles vary in height so the masonry rhythm is visible before real photos exist
const placeholderAspects = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]', 'aspect-[16/11]']

function thumbOf(item: GalleryItem): string | null {
  if (item.thumbnail_url) return item.thumbnail_url
  if (item.media_type === 'youtube') {
    const id = youtubeId(item.url)
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
  }
  return item.media_type === 'image' ? item.url || null : null
}

interface GalleryGridProps {
  items: GalleryItem[]
  columns?: 'default' | 'wide'
  className?: string
}

export function GalleryGrid({ items, columns = 'default', className }: GalleryGridProps) {
  const [index, setIndex] = useState<number | null>(null)

  return (
    <>
      <ul className={cn('gap-4 [column-fill:_balance]', columns === 'wide' ? 'columns-2 md:columns-3 xl:columns-4' : 'columns-2 lg:columns-3', className)}>
        {items.map((item, i) => {
          const thumb = thumbOf(item)
          return (
            <li key={item.id} className="mb-4 break-inside-avoid">
              <button
                onClick={() => setIndex(i)}
                className="group relative block w-full overflow-hidden rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                aria-label={`Open ${item.media_type === 'image' ? 'image' : 'video'}: ${item.caption ?? item.alt ?? 'gallery item'}`}
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={item.alt ?? item.caption ?? ''}
                    loading="lazy"
                    decoding="async"
                    className="w-full transition duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <Media
                    src={null}
                    alt={item.alt ?? 'Gallery placeholder'}
                    aspect={placeholderAspects[i % placeholderAspects.length]}
                    placeholderLabel="Gallery photo"
                    tone={i % 3 === 1 ? 'ink' : 'navy'}
                  />
                )}
                {item.media_type !== 'image' && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-14 place-items-center rounded-full bg-white/90 text-navy-900 shadow-lg transition group-hover:scale-110">
                      <Play className="ml-0.5 size-6 fill-current" aria-hidden />
                    </span>
                  </span>
                )}
                {item.caption && (
                  <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-navy-950/90 to-transparent p-4 pt-10 text-xs leading-5 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    {item.caption}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      <ImageLightbox items={items} index={index} onChange={setIndex} />
    </>
  )
}

interface LightboxProps {
  items: GalleryItem[]
  index: number | null
  onChange: (index: number | null) => void
}

export function ImageLightbox({ items, index, onChange }: LightboxProps) {
  const panel = useRef<HTMLDivElement>(null)
  const open = index !== null
  const close = useCallback(() => onChange(null), [onChange])
  useDialogBehaviour(open, close, panel)

  const go = useCallback(
    (delta: number) => {
      if (index === null || !items.length) return
      onChange((index + delta + items.length) % items.length)
    },
    [index, items.length, onChange],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  // Basic swipe support on touch devices
  const touchX = useRef<number | null>(null)

  const item = index !== null ? items[index] : null
  const ytId = item?.media_type === 'youtube' ? youtubeId(item.url) : null

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          tabIndex={-1}
          className="fixed inset-0 z-[85] flex flex-col bg-navy-950/95 text-white outline-none backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
            touchX.current = null
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-sm text-white/60 tabular-nums">
              {index! + 1} / {items.length}
            </p>
            <button onClick={close} className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close viewer">
              <X className="size-6" aria-hidden />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex max-h-full w-full max-w-6xl items-center justify-center"
            >
              {ytId ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
                    title={item.caption ?? 'YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full"
                  />
                </div>
              ) : item.media_type === 'video' ? (
                <video src={item.url} controls autoPlay className="max-h-[75dvh] w-full rounded-lg bg-black" />
              ) : item.url ? (
                <img src={item.url} alt={item.alt ?? item.caption ?? ''} className="max-h-[75dvh] w-auto rounded-lg object-contain" />
              ) : (
                <Media src={null} alt={item.alt ?? 'Placeholder'} className="aspect-[3/2] w-full max-w-3xl rounded-lg" placeholderLabel="Photo coming soon" />
              )}
            </motion.div>

            {items.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-2 grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:left-6"
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-2 grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:right-6"
                  aria-label="Next"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            )}
          </div>

          <div className="min-h-20 px-4 py-5 text-center sm:px-6">
            {item.caption && <p className="mx-auto max-w-2xl text-sm leading-6 text-white/80">{item.caption}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
