import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Loader2, RotateCw } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-shimmer rounded-lg bg-[linear-gradient(90deg,#eef1f4_0%,#f7f9fb_50%,#eef1f4_100%)] bg-[length:200%_100%]', className)}
      aria-hidden
    />
  )
}

/** Card-shaped skeletons for grids while data loads. */
export function CardGridSkeleton({ count = 3, aspect = 'aspect-[4/3]', className }: { count?: number; aspect?: string; className?: string }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className={cn('w-full rounded-2xl', aspect)} />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 py-16 text-sm text-muted', className)} role="status">
      <Loader2 className="size-5 animate-spin text-navy-700" aria-hidden />
      {label}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  onDark,
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  onDark?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center',
        onDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-line bg-paper/60',
        className,
      )}
    >
      <div className={cn('mb-4 grid size-12 place-items-center rounded-full', onDark ? 'bg-white/10 text-gold-300' : 'bg-white text-navy-700 shadow-sm')}>
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </div>
      <p className={cn('font-display text-lg font-semibold', onDark ? 'text-white' : 'text-ink')}>{title}</p>
      {description && <p className={cn('mt-1.5 max-w-md text-sm', onDark ? 'text-white/60' : 'text-muted')}>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry, className, onDark }: { message?: string | null; onRetry?: () => void; className?: string; onDark?: boolean }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border px-6 py-12 text-center',
        onDark ? 'border-white/15 text-white' : 'border-red-600/15 bg-red-50/50',
        className,
      )}
    >
      <AlertTriangle className="mb-3 size-6 text-red-600" aria-hidden />
      <p className="font-display font-semibold">We couldn’t load this section</p>
      <p className={cn('mt-1 max-w-md text-sm', onDark ? 'text-white/60' : 'text-muted')}>{message ?? 'Please try again in a moment.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-current/20 px-4 py-2 text-xs font-semibold tracking-wider uppercase hover:bg-black/5"
        >
          <RotateCw className="size-3.5" aria-hidden /> Try again
        </button>
      )}
    </div>
  )
}
