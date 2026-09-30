import { useEffect, useId } from 'react'
import { Controller, useFieldArray, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react'
import type { SiteSettings, SocialLink, SocialPlatform } from '@/types/database'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { repo } from '@/services/repository'
import { errorMessage } from '@/services/errors'
import { splitPhones } from '@/utils/format'
import { PageHeader } from '@/components/admin/PageHeader'
import { ImageInput } from '@/components/admin/Inputs'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/common/Button'
import { ErrorState, LoadingState } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { socialLabels } from '@/components/common/SocialIcon'

const optionalText = (max = 500) => z.string().trim().max(max)
const optionalUrl = z
  .string()
  .trim()
  .refine((v) => !v || /^(https?:\/\/|\/|data:)/i.test(v), 'Enter a full URL starting with https://')
const PHONE = /^\+?[\d\s()-]{7,20}$/
const phone = z
  .string()
  .trim()
  .refine((v) => !v || PHONE.test(v), 'Enter a valid phone number')
// The main phone field may hold several numbers separated by commas
const phones = z
  .string()
  .trim()
  .refine((v) => !v || splitPhones(v).every((p) => PHONE.test(p)), 'Enter valid phone numbers, separated by commas')

const schema = z.object({
  org_name: z.string().trim().min(2, 'Organisation name is required').max(80),
  tagline: optionalText(160),
  logo_url: optionalUrl,
  favicon_url: optionalUrl,
  phone: phones,
  email: z
    .string()
    .trim()
    .refine((v) => !v || z.string().email().safeParse(v).success, 'Enter a valid email address'),
  whatsapp: phone,
  address: optionalText(300),
  map_embed_url: z
    .string()
    .trim()
    .refine(
      (v) => !v || /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(v),
      'Paste the “Embed a map” src URL from Google Maps (https://www.google.com/maps/embed?...)',
    ),
  footer_text: optionalText(400),
  seo_title: optionalText(70),
  seo_description: optionalText(160),
  og_image_url: optionalUrl,
  hero_image_url: optionalUrl,
  about_image_url: optionalUrl,
  about_summary: optionalText(600),
  about_story: optionalText(8000),
  mission: optionalText(600),
  vision: optionalText(600),
  core_values: z.array(z.object({ title: z.string().trim().min(1, 'Title required').max(40), description: optionalText(200) })).max(12),
  stats: z
    .array(
      z.object({
        label: z.string().trim().min(1, 'Label required').max(40),
        value: z.coerce.number({ message: 'Enter a number' }).int().min(0),
        suffix: z.string().trim().max(3),
      }),
    )
    .max(4, 'The homepage shows up to 4 statistics'),
  social: z.array(
    z.object({
      id: z.string().optional(),
      platform: z.string(),
      url: z
        .string()
        .trim()
        .regex(/^https?:\/\/\S+$/i, 'Enter a full URL starting with https://'),
    }),
  ),
})
type FormValues = z.infer<typeof schema>

const platforms = Object.keys(socialLabels) as SocialPlatform[]
const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim())

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <legend className="-ml-1 px-1 font-display text-sm font-semibold text-ink">{title}</legend>
      {description && <p className="-mt-1 mb-4 text-sm text-muted">{description}</p>}
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  )
}

const rowBtn = 'rounded-md p-2 text-muted hover:bg-paper hover:text-ink disabled:opacity-30'

export default function SettingsPage() {
  const toast = useToast()
  const formId = useId()
  const { reload: reloadPublicSettings } = useSiteSettings()
  const q = useQuery('admin:settings', async () => {
    const [settings, social] = await Promise.all([repo('site_settings').findOne('id', 1), repo('social_links').list({ order: [{ column: 'sort_order' }] })])
    return { settings, social: social.rows }
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as unknown as Resolver<FormValues> })

  const values = useFieldArray({ control, name: 'core_values' })
  const stats = useFieldArray({ control, name: 'stats' })
  const social = useFieldArray({ control, name: 'social', keyName: 'key' })

  useEffect(() => {
    if (!q.data) return
    const s = q.data.settings
    const str = (v: string | null | undefined) => v ?? ''
    reset({
      org_name: s?.org_name ?? 'Arjuna Book of World Record',
      tagline: str(s?.tagline),
      logo_url: str(s?.logo_url),
      favicon_url: str(s?.favicon_url),
      phone: str(s?.phone),
      email: str(s?.email),
      whatsapp: str(s?.whatsapp),
      address: str(s?.address),
      map_embed_url: str(s?.map_embed_url),
      footer_text: str(s?.footer_text),
      seo_title: str(s?.seo_title),
      seo_description: str(s?.seo_description),
      og_image_url: str(s?.og_image_url),
      hero_image_url: str(s?.hero_image_url),
      about_image_url: str(s?.about_image_url),
      about_summary: str(s?.about_summary),
      about_story: str(s?.about_story),
      mission: str(s?.mission),
      vision: str(s?.vision),
      core_values: (s?.core_values ?? []).map((v) => ({ title: v.title, description: v.description ?? '' })),
      stats: (s?.stats ?? []).map((v) => ({ label: v.label, value: v.value, suffix: v.suffix ?? '' })),
      social: q.data.social.map((l) => ({ id: l.id, platform: l.platform, url: l.url })),
    })
  }, [q.data, reset])

  const onSubmit = async (v: FormValues) => {
    try {
      const { social: links, ...rest } = v
      const payload: Partial<SiteSettings> = {
        org_name: rest.org_name.trim(),
        tagline: nullIfEmpty(rest.tagline),
        logo_url: nullIfEmpty(rest.logo_url),
        favicon_url: nullIfEmpty(rest.favicon_url),
        phone: nullIfEmpty(rest.phone),
        email: nullIfEmpty(rest.email),
        whatsapp: nullIfEmpty(rest.whatsapp),
        address: nullIfEmpty(rest.address),
        map_embed_url: nullIfEmpty(rest.map_embed_url),
        footer_text: nullIfEmpty(rest.footer_text),
        seo_title: nullIfEmpty(rest.seo_title),
        seo_description: nullIfEmpty(rest.seo_description),
        og_image_url: nullIfEmpty(rest.og_image_url),
        hero_image_url: nullIfEmpty(rest.hero_image_url),
        about_image_url: nullIfEmpty(rest.about_image_url),
        about_summary: nullIfEmpty(rest.about_summary),
        about_story: nullIfEmpty(rest.about_story),
        mission: nullIfEmpty(rest.mission),
        vision: nullIfEmpty(rest.vision),
        core_values: rest.core_values.map((c) => ({ title: c.title, description: c.description || undefined })),
        stats: rest.stats.map((s) => ({ label: s.label, value: s.value, suffix: s.suffix || '' })),
      }
      if (q.data?.settings) await repo('site_settings').update(1, payload)
      else await repo('site_settings').insert({ id: 1, ...payload })

      // Social links: update existing, insert new, delete removed
      const keep = new Set(links.map((l) => l.id).filter(Boolean))
      const existing = q.data?.social ?? []
      await Promise.all([
        ...existing.filter((l) => !keep.has(l.id)).map((l) => repo('social_links').remove(l.id)),
        ...links.map((l, i) => {
          const row: Partial<SocialLink> = { platform: l.platform as SocialPlatform, url: l.url, sort_order: i }
          return l.id ? repo('social_links').update(l.id, row) : repo('social_links').insert(row)
        }),
      ])

      toast.success('Site settings saved')
      invalidateQueries()
      reloadPublicSettings()
      q.reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  if (!q.data) return q.error ? <ErrorState message={q.error} onRetry={q.reload} /> : <LoadingState />

  const text = (name: keyof FormValues, label: string, opts: { hint?: string; full?: boolean; type?: string; rows?: number } = {}) => (
    <FormField
      label={label}
      hint={opts.hint}
      error={(errors[name] as { message?: string } | undefined)?.message}
      className={opts.full ? 'md:col-span-2' : undefined}
    >
      {opts.rows ? (
        <textarea {...register(name)} rows={opts.rows} className="input" />
      ) : (
        <input {...register(name)} type={opts.type ?? 'text'} className="input" />
      )}
    </FormField>
  )
  const image = (name: keyof FormValues, label: string, hint?: string) => (
    <FormField label={label} hint={hint} error={(errors[name] as { message?: string } | undefined)?.message} className="md:col-span-2">
      <Controller
        control={control}
        name={name}
        render={({ field }) => <ImageInput value={String(field.value ?? '')} onChange={field.onChange} bucket="site-assets" />}
      />
    </FormField>
  )

  return (
    <>
      <PageHeader title="Site settings" description="Organisation details, contact information, homepage content, statistics and SEO defaults." />
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Section title="Organisation">
          {text('org_name', 'Organisation name')}
          {text('tagline', 'Tagline')}
          {image('logo_url', 'Logo', 'Optional. When empty, the built-in Arjuna Book of World Record emblem is used.')}
          {image('favicon_url', 'Favicon', 'Square image, at least 64×64.')}
        </Section>

        <Section title="Contact details" description="Shown in the footer and on the contact page. Leave a field empty to hide it.">
          {text('phone', 'Phone numbers', { hint: 'Separate multiple numbers with commas.' })}
          {text('email', 'Email', { type: 'email' })}
          {text('whatsapp', 'WhatsApp number', { type: 'tel', hint: 'Include the country code, e.g. +91…' })}
          {text('map_embed_url', 'Google Maps embed URL', { hint: 'Google Maps › Share › Embed a map › copy the src URL.' })}
          {text('address', 'Address', { full: true, rows: 3 })}
        </Section>

        <Section title="Homepage">
          {image('hero_image_url', 'Hero image', 'A strong competition photograph, portrait orientation works best.')}
          {image('about_image_url', 'About section image')}
          {text('about_summary', 'About summary', { full: true, rows: 3, hint: 'Short introduction shown on the homepage.' })}
        </Section>

        <fieldset className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <legend className="-ml-1 px-1 font-display text-sm font-semibold text-ink">Homepage statistics</legend>
          <p className="-mt-1 mb-4 text-sm text-muted">
            Up to 4 figures shown below the hero. Only publish numbers Arjuna Book of World Record can stand behind.
          </p>
          <div className="space-y-3">
            {stats.fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[1fr_6rem_4rem_auto] items-start gap-2 sm:grid-cols-[1fr_8rem_5rem_auto]">
                <input
                  {...register(`stats.${i}.label`)}
                  className="input"
                  placeholder="Label, e.g. Championships"
                  aria-label={`Statistic ${i + 1} label`}
                  aria-invalid={!!errors.stats?.[i]?.label || undefined}
                />
                <input
                  {...register(`stats.${i}.value`)}
                  type="number"
                  min={0}
                  className="input"
                  placeholder="50"
                  aria-label={`Statistic ${i + 1} value`}
                  aria-invalid={!!errors.stats?.[i]?.value || undefined}
                />
                <input {...register(`stats.${i}.suffix`)} className="input" placeholder="+" aria-label={`Statistic ${i + 1} suffix`} />
                <div className="flex">
                  <button type="button" className={rowBtn} onClick={() => stats.move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" className={rowBtn} onClick={() => stats.move(i, i + 1)} disabled={i === stats.fields.length - 1} aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" className={`${rowBtn} hover:text-red-600`} onClick={() => stats.remove(i)} aria-label="Remove statistic">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            {errors.stats?.message && <p className="text-xs text-red-600">{errors.stats.message}</p>}
            {stats.fields.length < 4 && (
              <Button
                type="button"
                variant="outline"
                caps={false}
                size="sm"
                icon={<Plus className="size-4" aria-hidden />}
                onClick={() => stats.append({ label: '', value: 0, suffix: '+' })}
              >
                Add statistic
              </Button>
            )}
          </div>
        </fieldset>

        <Section title="About page">
          {text('about_story', 'Organisation story', { full: true, rows: 8, hint: 'Separate paragraphs with a blank line.' })}
          {text('mission', 'Mission', { rows: 4 })}
          {text('vision', 'Vision', { rows: 4 })}
        </Section>

        <fieldset className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <legend className="-ml-1 px-1 font-display text-sm font-semibold text-ink">Core values</legend>
          <div className="space-y-3">
            {values.fields.map((f, i) => (
              <div key={f.id} className="grid items-start gap-2 sm:grid-cols-[12rem_1fr_auto]">
                <input
                  {...register(`core_values.${i}.title`)}
                  className="input"
                  placeholder="Value"
                  aria-label={`Value ${i + 1} title`}
                  aria-invalid={!!errors.core_values?.[i]?.title || undefined}
                />
                <input
                  {...register(`core_values.${i}.description`)}
                  className="input"
                  placeholder="Short description (optional)"
                  aria-label={`Value ${i + 1} description`}
                />
                <button type="button" className={`${rowBtn} justify-self-end hover:text-red-600`} onClick={() => values.remove(i)} aria-label="Remove value">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              caps={false}
              size="sm"
              icon={<Plus className="size-4" aria-hidden />}
              onClick={() => values.append({ title: '', description: '' })}
            >
              Add value
            </Button>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <legend className="-ml-1 px-1 font-display text-sm font-semibold text-ink">Social links</legend>
          <div className="space-y-3">
            {social.fields.map((f, i) => (
              <div key={f.key}>
                <div className="grid items-start gap-2 sm:grid-cols-[11rem_1fr_auto]">
                  <select {...register(`social.${i}.platform`)} className="input" aria-label={`Link ${i + 1} platform`}>
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {socialLabels[p]}
                      </option>
                    ))}
                  </select>
                  <input
                    {...register(`social.${i}.url`)}
                    className="input"
                    placeholder="https://"
                    aria-label={`Link ${i + 1} URL`}
                    aria-invalid={!!errors.social?.[i]?.url || undefined}
                  />
                  <div className="flex justify-end">
                    <button type="button" className={rowBtn} onClick={() => social.move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                      <ArrowUp className="size-4" />
                    </button>
                    <button type="button" className={`${rowBtn} hover:text-red-600`} onClick={() => social.remove(i)} aria-label="Remove link">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                {errors.social?.[i]?.url && <p className="mt-1 text-xs text-red-600">{errors.social[i]?.url?.message}</p>}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              caps={false}
              size="sm"
              icon={<Plus className="size-4" aria-hidden />}
              onClick={() => social.append({ platform: 'instagram', url: '' })}
            >
              Add social link
            </Button>
          </div>
        </fieldset>

        <Section title="Footer & SEO defaults">
          {text('footer_text', 'Footer text', { full: true, rows: 3 })}
          {text('seo_title', 'Default page title', { full: true, hint: 'Up to 70 characters.' })}
          {text('seo_description', 'Default meta description', { full: true, rows: 2, hint: 'Up to 160 characters.' })}
          {image('og_image_url', 'Social sharing image', '1200×630 recommended. Used when pages are shared on social media.')}
        </Section>
      </form>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-end gap-3">
          {isDirty && <span className="mr-auto text-xs text-amber-700">Unsaved changes</span>}
          <Button type="submit" form={formId} variant="navy" caps={false} size="sm" loading={isSubmitting} icon={<Save className="size-4" aria-hidden />}>
            Save settings
          </Button>
        </div>
      </div>
    </>
  )
}
