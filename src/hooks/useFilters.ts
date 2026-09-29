import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Filter state kept in the URL query string, so filtered views can be shared and
 * survive back/forward navigation. Changing any filter resets `page`.
 */
export function useFilters<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams()

  const values = useMemo(() => {
    const out = {} as Record<K, string>
    for (const k of keys) out[k] = params.get(k) ?? ''
    return out
  }, [params, keys.join(',')])

  const page = Math.max(1, Number(params.get('page')) || 1)

  const set = useCallback(
    (key: K | 'page', value: string | number) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const v = String(value)
          if (v && !(key === 'page' && v === '1')) next.set(key, v)
          else next.delete(key)
          if (key !== 'page') next.delete('page')
          return next
        },
        { replace: key !== 'page', preventScrollReset: true },
      )
    },
    [setParams],
  )

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true }), [setParams])
  const activeCount = keys.filter((k) => values[k]).length

  return { values, page, set, reset, activeCount }
}
