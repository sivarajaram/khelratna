import { z } from 'zod'
import type { FieldDef, ResourceConfig, Row } from './types'

// Builds the Zod schema for a resource form from its field definitions.
// Form inputs hold strings; the schema converts them to database values
// (empty -> null, numeric strings -> numbers, local datetime -> ISO).

const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v)
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const URLISH = /^(https?:\/\/|\/|data:|[a-z-]+:)/i

function fieldSchema(f: FieldDef): z.ZodType {
  const req = f.required
  const text = (s: z.ZodString) => {
    const base = f.maxLength ? s.max(f.maxLength, `Maximum ${f.maxLength} characters`) : s
    return req ? base.min(1, `${f.label} is required`) : z.preprocess(emptyToNull, base.nullable())
  }

  switch (f.type) {
    case 'text':
    case 'textarea':
    case 'markdown':
      return text(z.string().trim())
    case 'email':
      return text(z.string().trim().email('Enter a valid email address'))
    case 'url':
      return text(
        z
          .string()
          .trim()
          .regex(/^https?:\/\/\S+$/i, 'Enter a full URL starting with https://'),
      )
    case 'slug':
      return z.string().trim().min(1, 'Slug is required').regex(SLUG, 'Use lowercase letters, numbers and hyphens only')
    case 'image':
    case 'file':
      return text(z.string().trim().regex(URLISH, 'Upload a file or enter a valid URL'))
    case 'select':
      return req ? z.string().min(1, `Choose a ${f.label.toLowerCase()}`) : z.preprocess(emptyToNull, z.string().nullable())
    case 'relation':
      return req ? z.string().min(1, `Choose a ${f.label.toLowerCase()}`) : z.preprocess(emptyToNull, z.string().nullable())
    case 'number':
    case 'year': {
      let n = z.coerce.number({ message: 'Enter a number' }).int('Enter a whole number')
      n = f.type === 'year' ? n.min(1900, 'Enter a valid year').max(2100, 'Enter a valid year') : n.min(0, 'Must be zero or more')
      return req ? z.preprocess(emptyToNull, n) : z.preprocess(emptyToNull, n.nullable())
    }
    case 'date': {
      const d = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
      return req ? d : z.preprocess(emptyToNull, d.nullable())
    }
    case 'datetime':
      return z.preprocess(
        (v) => (typeof v === 'string' && v ? new Date(v).toISOString() : v),
        req ? z.string({ message: `${f.label} is required` }).min(1, `${f.label} is required`) : z.string().nullable(),
      )
    case 'boolean':
      return z.boolean()
    case 'tags':
    case 'images':
      return z.array(z.string())
    case 'documents':
      return z.array(z.object({ name: z.string().trim().min(1, 'Name each document'), url: z.string().trim().min(1, 'Add a file or URL') }))
  }
}

export function buildSchema(config: ResourceConfig) {
  const shape: Record<string, z.ZodType> = {}
  for (const f of config.fields) shape[f.name] = fieldSchema(f)
  return z.object(shape).superRefine((values, ctx) => {
    const problems = config.validate?.(values as Row)
    for (const [path, message] of Object.entries(problems ?? {})) ctx.addIssue({ code: 'custom', path: [path], message })
  })
}

/** Converts a database row into form input values (null -> '', ISO -> datetime-local). */
export function toFormValues(config: ResourceConfig, row: Row): Row {
  const out: Row = {}
  for (const f of config.fields) {
    const v = row[f.name]
    switch (f.type) {
      case 'boolean':
        out[f.name] = Boolean(v)
        break
      case 'tags':
      case 'images':
      case 'documents':
        out[f.name] = Array.isArray(v) ? v : []
        break
      case 'datetime': {
        if (typeof v === 'string' && v) {
          const d = new Date(v)
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
          out[f.name] = local.toISOString().slice(0, 16)
        } else out[f.name] = ''
        break
      }
      default:
        out[f.name] = v == null ? '' : String(v)
    }
  }
  return out
}
