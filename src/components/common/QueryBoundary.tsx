import type { ReactNode } from 'react'
import type { QueryState } from '@/hooks/useQuery'
import { ErrorState, LoadingState } from './States'

interface QueryBoundaryProps<T> {
  query: QueryState<T>
  children: (data: T) => ReactNode
  /** Shown on first load; defaults to a spinner. */
  loading?: ReactNode
  /** Rendered instead of children when isEmpty(data) is true. */
  empty?: ReactNode
  isEmpty?: (data: T) => boolean
  onDark?: boolean
}

/** Renders loading, error, empty and success states for a useQuery result consistently. */
export function QueryBoundary<T>({ query, children, loading, empty, isEmpty, onDark }: QueryBoundaryProps<T>) {
  if (query.data === undefined) {
    if (query.error) return <ErrorState message={query.error} onRetry={query.reload} onDark={onDark} />
    return <>{loading ?? <LoadingState />}</>
  }
  if (query.error) return <ErrorState message={query.error} onRetry={query.reload} onDark={onDark} />
  if (isEmpty?.(query.data)) return <>{empty ?? null}</>
  return (
    <div className={query.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={query.loading}>
      {children(query.data)}
    </div>
  )
}
