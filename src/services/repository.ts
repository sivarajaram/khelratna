import { supabase } from '@/lib/supabase'
import type { TableMap, TableName } from '@/types/database'
import { localDb } from './localDb'
import { AppError } from './errors'

export type Primitive = string | number | boolean | null

export interface QueryOptions {
  /** Supabase column list, e.g. "id,name,slug". Ignored in demo mode (full rows returned). */
  select?: string
  eq?: Record<string, Primitive | undefined>
  neq?: Record<string, Primitive | undefined>
  in?: Record<string, Primitive[] | undefined>
  gte?: Record<string, string | number | undefined>
  lte?: Record<string, string | number | undefined>
  /** Array column contains every given value (Postgres @>). */
  contains?: Record<string, string[] | undefined>
  search?: { columns: string[]; term: string }
  order?: { column: string; ascending?: boolean }[]
  range?: { from: number; to: number }
}

export interface ListResult<T> {
  rows: T[]
  count: number
}

const PRIMARY_KEY: Partial<Record<TableName, string>> = { admins: 'user_id' }
export const primaryKeyOf = (table: TableName) => PRIMARY_KEY[table] ?? 'id'

const isSet = <V>(v: V | undefined | ''): v is V => v !== undefined && v !== ''

/** Strips characters that have meaning inside a PostgREST `or=(...)` filter. */
const sanitizeTerm = (term: string) => term.replace(/[,()*%\\:"]/g, ' ').trim()

export interface Repository<T> {
  list(opts?: QueryOptions): Promise<ListResult<T>>
  count(opts?: QueryOptions): Promise<number>
  findOne(column: string, value: Primitive, opts?: QueryOptions): Promise<T | null>
  insert(values: Partial<T>): Promise<T>
  insertMany(values: Partial<T>[]): Promise<T[]>
  update(id: string | number, values: Partial<T>): Promise<T>
  remove(id: string | number): Promise<void>
}

function supabaseRepo<K extends TableName>(table: K): Repository<TableMap[K]> {
  type Row = TableMap[K]
  const client = supabase!
  const pk = primaryKeyOf(table)

  function applyFilters(q: any, opts: QueryOptions) {
    for (const [k, v] of Object.entries(opts.eq ?? {})) if (isSet(v)) q = v === null ? q.is(k, null) : q.eq(k, v)
    for (const [k, v] of Object.entries(opts.neq ?? {})) if (isSet(v)) q = q.neq(k, v)
    for (const [k, v] of Object.entries(opts.in ?? {})) if (v) q = q.in(k, v)
    for (const [k, v] of Object.entries(opts.gte ?? {})) if (isSet(v)) q = q.gte(k, v)
    for (const [k, v] of Object.entries(opts.lte ?? {})) if (isSet(v)) q = q.lte(k, v)
    for (const [k, v] of Object.entries(opts.contains ?? {})) if (v?.length) q = q.contains(k, v)
    const term = opts.search ? sanitizeTerm(opts.search.term) : ''
    if (opts.search && term) {
      q = q.or(opts.search.columns.map((c) => `${c}.ilike.%${term}%`).join(','))
    }
    return q
  }

  return {
    async list(opts = {}) {
      let q = applyFilters(client.from(table).select(opts.select ?? '*', { count: 'exact' }), opts)
      for (const o of opts.order ?? []) q = q.order(o.column, { ascending: o.ascending ?? true, nullsFirst: false })
      if (opts.range) q = q.range(opts.range.from, opts.range.to)
      const { data, error, count } = await q
      if (error) throw AppError.from(error)
      return { rows: (data ?? []) as Row[], count: count ?? data?.length ?? 0 }
    },
    async count(opts = {}) {
      const q = applyFilters(client.from(table).select(pk, { count: 'exact', head: true }), opts)
      const { error, count } = await q
      if (error) throw AppError.from(error)
      return count ?? 0
    },
    async findOne(column, value, opts = {}) {
      const q = applyFilters(
        client
          .from(table)
          .select(opts.select ?? '*')
          .eq(column, value),
        opts,
      )
      const { data, error } = await q.maybeSingle()
      if (error) throw AppError.from(error)
      return (data as Row | null) ?? null
    },
    async insert(values) {
      const { data, error } = await client
        .from(table)
        .insert(values as Record<string, unknown>)
        .select()
        .single()
      if (error) throw AppError.from(error)
      return data as Row
    },
    async insertMany(values) {
      const { data, error } = await client
        .from(table)
        .insert(values as Record<string, unknown>[])
        .select()
      if (error) throw AppError.from(error)
      return (data ?? []) as Row[]
    },
    async update(id, values) {
      const { data, error } = await client
        .from(table)
        .update(values as Record<string, unknown>)
        .eq(pk, id)
        .select()
        .single()
      if (error) throw AppError.from(error)
      return data as Row
    },
    async remove(id) {
      const { error } = await client.from(table).delete().eq(pk, id)
      if (error) throw AppError.from(error)
    },
  }
}

/** Orders a cell against a bound; nulls never satisfy a range filter. ISO dates compare as strings. */
function compareTo(cell: unknown, bound: string | number): number | null {
  if (cell == null) return null
  if (typeof bound === 'number') return Number(cell) - bound
  const s = String(cell)
  return s < bound ? -1 : s.slice(0, bound.length) > bound ? 1 : 0
}

function localRepo<K extends TableName>(table: K): Repository<TableMap[K]> {
  type Row = TableMap[K]
  const pk = primaryKeyOf(table)

  const matches = (row: Record<string, unknown>, opts: QueryOptions): boolean => {
    for (const [k, v] of Object.entries(opts.eq ?? {})) if (isSet(v) && row[k] !== v && !(v === null && row[k] == null)) return false
    for (const [k, v] of Object.entries(opts.neq ?? {})) if (isSet(v) && row[k] === v) return false
    for (const [k, v] of Object.entries(opts.in ?? {})) if (v && !v.includes(row[k] as Primitive)) return false
    for (const [k, v] of Object.entries(opts.gte ?? {})) if (isSet(v) && !((compareTo(row[k], v) ?? -1) >= 0)) return false
    for (const [k, v] of Object.entries(opts.lte ?? {})) if (isSet(v) && !((compareTo(row[k], v) ?? 1) <= 0)) return false
    for (const [k, v] of Object.entries(opts.contains ?? {})) {
      if (v?.length && !v.every((x) => ((row[k] as string[]) ?? []).includes(x))) return false
    }
    const term = opts.search?.term.trim().toLowerCase()
    if (opts.search && term) {
      if (
        !opts.search.columns.some((c) =>
          String(row[c] ?? '')
            .toLowerCase()
            .includes(term),
        )
      )
        return false
    }
    return true
  }

  const compare = (a: Record<string, unknown>, b: Record<string, unknown>, order: QueryOptions['order'] = []) => {
    for (const o of order) {
      const av = a[o.column]
      const bv = b[o.column]
      if (av === bv) continue
      if (av == null) return 1 // nulls last
      if (bv == null) return -1
      const r = av < bv ? -1 : 1
      return o.ascending === false ? -r : r
    }
    return 0
  }

  const rowsOf = () => localDb.table(table) as unknown as Record<string, unknown>[]

  return {
    async list(opts = {}) {
      const all = rowsOf()
        .filter((r) => matches(r, opts))
        .sort((a, b) => compare(a, b, opts.order))
      const rows = opts.range ? all.slice(opts.range.from, opts.range.to + 1) : all
      return { rows: structuredClone(rows) as unknown as Row[], count: all.length }
    },
    async count(opts = {}) {
      return rowsOf().filter((r) => matches(r, opts)).length
    },
    async findOne(column, value, opts = {}) {
      const row = rowsOf().find((r) => r[column] === value && matches(r, opts))
      return row ? (structuredClone(row) as unknown as Row) : null
    },
    async insert(values) {
      return localDb.insert(table, values as Record<string, unknown>) as unknown as Row
    },
    async insertMany(values) {
      return values.map((v) => localDb.insert(table, v as Record<string, unknown>)) as unknown as Row[]
    },
    async update(id, values) {
      return localDb.update(table, pk, id, values as Record<string, unknown>) as unknown as Row
    },
    async remove(id) {
      localDb.remove(table, pk, id)
    },
  }
}

const cache = new Map<TableName, Repository<unknown>>()

export function repo<K extends TableName>(table: K): Repository<TableMap[K]> {
  let r = cache.get(table)
  if (!r) {
    r = (supabase ? supabaseRepo(table) : localRepo(table)) as Repository<unknown>
    cache.set(table, r)
  }
  return r as Repository<TableMap[K]>
}
