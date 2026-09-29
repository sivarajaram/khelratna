import type { ComponentType, ReactNode } from 'react'
import type { TableName } from '@/types/database'
import type { Bucket } from '@/services/storage'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'markdown'
  | 'number'
  | 'year'
  | 'date'
  | 'datetime'
  | 'select'
  | 'boolean'
  | 'image'
  | 'file'
  | 'images'
  | 'documents'
  | 'tags'
  | 'slug'
  | 'relation'
  | 'url'
  | 'email'

export interface Option {
  value: string
  label: string
}

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  help?: string
  placeholder?: string
  options?: Option[]
  /** For relation fields: which table to pick from. */
  relation?: 'competitions' | 'athletes'
  bucket?: Bucket
  accept?: string
  /** For slug fields: the field the slug is generated from. */
  slugFrom?: string
  /** Occupies the full form width (default: half on wide screens). */
  full?: boolean
  /** Starts a new titled group in the form. */
  section?: string
  maxLength?: number
}

export type Row = Record<string, unknown>

export interface ColumnDef {
  key: string
  label: string
  render?: (row: Row) => ReactNode
  className?: string
}

export interface ResourceConfig {
  key: string
  table: TableName
  singular: string
  plural: string
  description: string
  icon: ComponentType<{ className?: string }>
  titleField: string
  fields: FieldDef[]
  columns: ColumnDef[]
  searchColumns: string[]
  defaultOrder: { column: string; ascending?: boolean }[]
  /** Status filter shown above the list. */
  statusField?: string
  statusOptions?: Option[]
  /** How "archive" is expressed for this table. */
  archive?: { field: string; value: unknown; restore: unknown }
  defaults: Row
  publicPath?: (row: Row) => string | null
  reorderable?: boolean
  /** Fill empty fields from a picked related row (e.g. athlete -> champion name/photo). */
  autofill?: Partial<Record<string, (related: Row) => Row>>
  /** Extra cross-field validation, returning field -> message. */
  validate?: (values: Row) => Record<string, string> | null
  /** Final transform before saving. */
  beforeSave?: (values: Row) => Row
}
