import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { submitEnquiry } from '@/services/forms'
import { errorMessage } from '@/services/errors'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/common/Button'
import { SocialIcon, socialLabels } from '@/components/common/SocialIcon'
import { whatsappHref } from '@/components/public/Footer'

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => !v || /^\+?[\d\s()-]{7,20}$/.test(v), 'Enter a valid phone number'),
  subject: z.string().trim().min(2, 'Please add a subject').max(200),
  message: z.string().trim().min(10, 'Your message should be at least 10 characters').max(5000, 'Please keep your message under 5000 characters'),
  // Honeypot: real visitors never see or fill this
  website: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const input = 'input h-12 rounded-xl px-4 text-base'

export default function ContactPage() {
  const { settings, social } = useSiteSettings()
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', phone: '', subject: '', message: '', website: '' } })

  const onSubmit = async ({ website, ...values }: FormValues) => {
    setServerError(null)
    if (website) return setSent(true) // silently drop bots
    try {
      await submitEnquiry(values)
      reset()
      setSent(true)
    } catch (err) {
      setServerError(errorMessage(err))
    }
  }

  const channels = [
    settings?.phone && { icon: Phone, label: 'Phone', value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, '')}` },
    settings?.email && { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
    settings?.whatsapp && { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp, href: whatsappHref(settings.whatsapp) },
    settings?.address && { icon: MapPin, label: 'Address', value: settings.address },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[]

  return (
    <>
      <Seo title="Contact" description="Contact Khelratna about championships, participation, recognition, sponsorship or media enquiries." />
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about championships, participation, recognition, sponsorship or media — we will respond as soon as we can."
        crumbs={[{ label: 'Contact' }]}
      />

      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="display-md text-navy-900">{settings?.org_name ?? 'Khelratna'}</h2>
            <ul className="mt-8 divide-y divide-line rounded-2xl ring-1 ring-line">
              {channels.map((c) => (
                <li key={c.label} className="flex gap-4 p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-800">
                    <c.icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{c.label}</p>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="mt-0.5 block font-medium break-words text-ink hover:text-navy-600"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 font-medium whitespace-pre-line text-ink">{c.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {social.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Follow Khelratna</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {social.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-navy-900 ring-1 ring-line hover:bg-navy-900 hover:text-white"
                      >
                        <SocialIcon platform={s.platform} /> {socialLabels[s.platform]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {settings?.map_embed_url && (
              <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-line">
                <iframe
                  src={settings.map_embed_url}
                  title="Map showing Khelratna’s location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-paper p-6 sm:p-10">
              {sent ? (
                <div className="py-10 text-center" role="status">
                  <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden />
                  <h2 className="mt-5 font-display text-2xl font-semibold text-navy-900">Thank you — message received</h2>
                  <p className="mx-auto mt-3 max-w-md text-muted">Your enquiry has been sent to the Khelratna team. We will get back to you by email.</p>
                  <Button variant="outline" className="mt-8" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <h2 className="font-display text-2xl font-semibold text-navy-900">Send an enquiry</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Name" required error={errors.name?.message}>
                      <input {...register('name')} autoComplete="name" className={input} />
                    </FormField>
                    <FormField label="Email" required error={errors.email?.message}>
                      <input {...register('email')} type="email" autoComplete="email" className={input} />
                    </FormField>
                    <FormField label="Phone" hint="Optional" error={errors.phone?.message}>
                      <input {...register('phone')} type="tel" autoComplete="tel" className={input} />
                    </FormField>
                    <FormField label="Subject" required error={errors.subject?.message}>
                      <input {...register('subject')} className={input} />
                    </FormField>
                  </div>
                  <FormField label="Message" required error={errors.message?.message}>
                    <textarea {...register('message')} rows={6} className="input rounded-xl px-4 py-3 text-base" />
                  </FormField>
                  <div className="hidden" aria-hidden>
                    <label>
                      Website
                      <input {...register('website')} tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>
                  {serverError && (
                    <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">
                      {serverError}
                    </p>
                  )}
                  <Button type="submit" size="lg" loading={isSubmitting} icon={!isSubmitting && <Send className="size-4" aria-hidden />}>
                    Submit
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
