import { useEffect, useMemo, useRef } from 'react'
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldDef, ResourceConfig, Row } from '@/admin/types'
import { buildSchema, toFormValues } from '@/admin/schema'
import { useQuery } from '@/hooks/useQuery'
import { repo } from '@/services/repository'
import { slugify } from '@/utils/format'
import { cn } from '@/utils/cn'
import { FormField } from '@/components/common/FormField'
import { DocumentsInput, FileInput, ImageInput, ImagesInput, MarkdownInput, TagsInput } from './Inputs'

interface ResourceFormProps {
  config: ResourceConfig
  row: Row
  isNew: boolean
  formId: string
  onSubmit: (values: Row) => Promise<void>
  onDirtyChange?: (dirty: boolean) => void
}

function useRelationOptions(table: 'competitions' | 'athletes' | undefined) {
  return useQuery(table ? `admin:options:${table}` : null, async () => {
    const { rows } = await repo(table!).list({ order: [{ column: table === 'competitions' ? 'start_date' : 'name', ascending: table !== 'competitions' }] })
    return rows as unknown as Row[]
  })
}

function RelationSelect({
  field,
  value,
  onChange,
  onPick,
  invalid,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
  onPick: (row: Row) => void
  invalid?: boolean
}) {
  const q = useRelationOptions(field.relation)
  return (
    <select
      className="input"
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(e) => {
        onChange(e.target.value)
        const picked = q.data?.find((r) => r.id === e.target.value)
        if (picked) onPick(picked)
      }}
    >
      <option value="">{q.loading && !q.data ? 'Loading…' : '— None —'}</option>
      {(q.data ?? []).map((r) => (
        <option key={String(r.id)} value={String(r.id)}>
          {String(r.name)}
          {r.start_date ? ` (${String(r.start_date).slice(0, 4)})` : ''}
        </option>
      ))}
    </select>
  )
}

/** Groups fields into titled cards using each field's `section` marker. */
function groupFields(fields: FieldDef[]) {
  const groups: { title?: string; fields: FieldDef[] }[] = []
  for (const f of fields) {
    if (f.section || !groups.length) groups.push({ title: f.section, fields: [] })
    groups[groups.length - 1].fields.push(f)
  }
  return groups
}

export function ResourceForm({ config, row, isNew, formId, onSubmit, onDirtyChange }: ResourceFormProps) {
  const schema = useMemo(() => buildSchema(config), [config])
  const defaults = useMemo(() => toFormValues(config, row), [config, row])
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<Row>({ resolver: zodResolver(schema) as unknown as Resolver<Row>, defaultValues: defaults })

  useEffect(() => reset(defaults), [defaults, reset])
  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange])

  // Auto-generate the slug from its source field until the slug is edited by hand
  const slugField = config.fields.find((f) => f.type === 'slug')
  const slugTouched = useRef(!isNew)
  const slugSource = useWatch({ control, name: slugField?.slugFrom ?? '__none__' }) as string | undefined
  useEffect(() => {
    if (slugField && !slugTouched.current && typeof slugSource === 'string') {
      setValue(slugField.name, slugify(slugSource), { shouldDirty: true, shouldValidate: true })
    }
  }, [slugSource, slugField, setValue])

  const autofill = (fieldName: string, related: Row) => {
    const fill = config.autofill?.[fieldName]?.(related)
    if (!fill) return
    for (const [k, v] of Object.entries(fill)) {
      const current = getValues(k)
      if ((current === '' || current == null) && v != null) setValue(k, String(v), { shouldDirty: true })
    }
  }

  const errorOf = (name: string) => {
    const e = errors[name] as { message?: string } | { message?: string }[] | undefined
    if (!e) return undefined
    if (Array.isArray(e)) return 'Check the entries below'
    return e.message ?? 'Invalid value'
  }

  const renderControl = (f: FieldDef) => {
    const invalid = !!errors[f.name]
    switch (f.type) {
      case 'textarea':
        return <textarea {...register(f.name)} rows={f.maxLength && f.maxLength <= 400 ? 3 : 6} className="input" maxLength={f.maxLength} />
      case 'number':
      case 'year':
        return <input {...register(f.name)} type="number" inputMode="numeric" className="input" min={0} />
      case 'date':
        return <input {...register(f.name)} type="date" className="input" />
      case 'datetime':
        return <input {...register(f.name)} type="datetime-local" className="input" />
      case 'email':
        return <input {...register(f.name)} type="email" className="input" placeholder={f.placeholder} />
      case 'url':
        return <input {...register(f.name)} type="url" className="input" placeholder={f.placeholder ?? 'https://'} />
      case 'slug':
        return <input {...register(f.name, { onChange: () => (slugTouched.current = true) })} className="input font-mono" spellCheck={false} />
      case 'select':
        return (
          <select {...register(f.name)} className="input">
            {!f.required && <option value="">— None —</option>}
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )
      case 'boolean':
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(field.value)}
                onClick={() => field.onChange(!field.value)}
                className={cn('relative inline-flex h-6 w-11 shrink-0 rounded-full transition', field.value ? 'bg-navy-900' : 'bg-line')}
              >
                <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition', Boolean(field.value) && 'translate-x-5')} />
              </button>
            )}
          />
        )
      case 'relation':
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => (
              <RelationSelect field={f} value={String(field.value ?? '')} onChange={field.onChange} onPick={(r) => autofill(f.name, r)} invalid={invalid} />
            )}
          />
        )
      case 'image':
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => (
              <ImageInput value={String(field.value ?? '')} onChange={field.onChange} bucket={f.bucket ?? 'site-assets'} accept={f.accept} invalid={invalid} />
            )}
          />
        )
      case 'file':
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => (
              <FileInput value={String(field.value ?? '')} onChange={field.onChange} bucket={f.bucket ?? 'documents'} accept={f.accept} invalid={invalid} />
            )}
          />
        )
      case 'images':
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => <ImagesInput value={(field.value as string[]) ?? []} onChange={field.onChange} bucket={f.bucket ?? 'site-assets'} />}
          />
        )
      case 'documents':
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => (
              <DocumentsInput value={(field.value as { name: string; url: string }[]) ?? []} onChange={field.onChange} bucket={f.bucket ?? 'documents'} />
            )}
          />
        )
      case 'tags':
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => <TagsInput value={(field.value as string[]) ?? []} onChange={field.onChange} placeholder={f.placeholder} />}
          />
        )
      case 'markdown':
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => <MarkdownInput value={String(field.value ?? '')} onChange={field.onChange} invalid={invalid} />}
          />
        )
      default:
        return <input {...register(f.name)} className="input" placeholder={f.placeholder} maxLength={f.maxLength} />
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit((values) => onSubmit(config.beforeSave ? config.beforeSave(values) : values))} noValidate className="space-y-6">
      {groupFields(config.fields).map((g, gi) => (
        <fieldset key={gi} className="rounded-xl border border-line bg-white p-5 sm:p-6">
          {g.title && <legend className="-ml-1 px-1 font-display text-sm font-semibold text-ink">{g.title}</legend>}
          <div className="grid gap-5 md:grid-cols-2">
            {g.fields.map((f) =>
              f.type === 'boolean' ? (
                <div key={f.name} className={cn('flex items-start justify-between gap-4 rounded-lg bg-paper p-3', f.full && 'md:col-span-2')}>
                  <div>
                    <p className="text-sm font-medium text-ink">{f.label}</p>
                    {f.help && <p className="text-xs text-muted">{f.help}</p>}
                  </div>
                  {renderControl(f)}
                </div>
              ) : (
                <FormField key={f.name} label={f.label} required={f.required} hint={f.help} error={errorOf(f.name)} className={cn(f.full && 'md:col-span-2')}>
                  {renderControl(f)}
                </FormField>
              ),
            )}
          </div>
        </fieldset>
      ))}
    </form>
  )
}
