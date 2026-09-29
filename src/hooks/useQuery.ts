import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '@/services/errors'
import { localDb } from '@/services/localDb'

interface Entry {
  data: unknown
  at: number
}

const TTL = 60_000
const cache = new Map<string, Entry>()

type Matcher = (key: string) => boolean
const listeners = new Set<(match: Matcher) => void>()

/**
 * Drops cached results whose key starts with any prefix (or everything) and makes
 * mounted queries with a matching key refetch. Call after admin writes.
 */
export function invalidateQueries(...prefixes: string[]) {
  const match: Matcher = (key) => !prefixes.length || prefixes.some((p) => key.startsWith(p))
  for (const key of [...cache.keys()]) if (match(key)) cache.delete(key)
  listeners.forEach((l) => l(match))
}

// In demo mode every local write invalidates everything - the store is tiny.
localDb.subscribe(() => invalidateQueries())

export interface QueryState<T> {
  data: T | undefined
  error: string | null
  loading: boolean
  reload: () => void
}

/**
 * Minimal cached async query. `key` identifies the request (include every filter);
 * pass null to skip. Previous data is kept while a new key loads so filters don't flash.
 */
export function useQuery<T>(key: string | null, fn: () => Promise<T>): QueryState<T> {
  const fnRef = useRef(fn)
  fnRef.current = fn
  const [nonce, setNonce] = useState(0)
  const keyRef = useRef(key)
  keyRef.current = key

  useEffect(() => {
    const listener = (match: Matcher) => {
      if (keyRef.current && match(keyRef.current)) setNonce((n) => n + 1)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])
  const [state, setState] = useState<{ data: T | undefined; error: string | null; loading: boolean }>(() => {
    const hit = key ? cache.get(key) : undefined
    return { data: hit?.data as T | undefined, error: null, loading: key !== null && !hit }
  })

  useEffect(() => {
    if (key === null) return
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < TTL) {
      setState({ data: hit.data as T, error: null, loading: false })
      return
    }
    let active = true
    setState((s) => ({ ...s, error: null, loading: true }))
    fnRef.current().then(
      (data) => {
        cache.set(key, { data, at: Date.now() })
        if (active) setState({ data, error: null, loading: false })
      },
      (err: unknown) => {
        if (active) setState((s) => ({ ...s, error: errorMessage(err), loading: false }))
      },
    )
    return () => {
      active = false
    }
  }, [key, nonce])

  const reload = useCallback(() => {
    if (key) cache.delete(key)
    setNonce((n) => n + 1)
  }, [key])

  return { ...state, reload }
}
