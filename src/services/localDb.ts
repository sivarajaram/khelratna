// Browser-only store used in demo mode (no Supabase configured).
// Seeded with clearly-marked placeholder content and persisted to localStorage per visitor.
import type { TableName } from '@/types/database'
import { demoData } from './demoData'
import { AppError } from './errors'

type Row = Record<string, unknown>
type Store = Record<TableName, Row[]>

const STORAGE_KEY = 'arjunabookofworldrecord-demo-db-v1'

const UNIQUE: Partial<Record<TableName, string[]>> = {
  competitions: ['slug'],
  athletes: ['slug'],
  world_records: ['slug'],
  news: ['slug'],
  certificates: ['certificate_number'],
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...structuredClone(demoData), ...(JSON.parse(raw) as Store) }
  } catch {
    /* storage unavailable: fall back to in-memory seed */
  }
  return structuredClone(demoData)
}

let store: Store = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Quota exceeded (usually large uploaded images) - data stays in memory for this session
  }
  listeners.forEach((l) => l())
}

function assertUnique(table: TableName, row: Row, ignoreIndex = -1) {
  for (const col of UNIQUE[table] ?? []) {
    const clash = store[table].some((r, i) => i !== ignoreIndex && r[col] != null && r[col] === row[col])
    if (clash) throw new AppError(`Another entry already uses this ${col.replace('_', ' ')}.`, '23505')
  }
}

export const localDb = {
  table(table: TableName): Row[] {
    return store[table]
  },

  insert(table: TableName, values: Row): Row {
    const now = new Date().toISOString()
    const row: Row = { id: crypto.randomUUID(), created_at: now, updated_at: now, ...values }
    assertUnique(table, row)
    store[table] = [...store[table], row]
    persist()
    return structuredClone(row)
  },

  update(table: TableName, pk: string, id: string | number, values: Row): Row {
    const idx = store[table].findIndex((r) => r[pk] === id)
    if (idx === -1) throw new AppError('The requested item could not be found.', 'PGRST116')
    const row = { ...store[table][idx], ...values, updated_at: new Date().toISOString() }
    assertUnique(table, row, idx)
    store[table] = store[table].map((r, i) => (i === idx ? row : r))
    persist()
    return structuredClone(row)
  },

  remove(table: TableName, pk: string, id: string | number) {
    store[table] = store[table].filter((r) => r[pk] !== id)
    persist()
  },

  reset() {
    store = structuredClone(demoData)
    persist()
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
