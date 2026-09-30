import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, SearchX, ShieldCheck } from 'lucide-react'
import type { CertificateVerification } from '@/types/database'
import { verifyCertificate } from '@/services/forms'
import { errorMessage } from '@/services/errors'
import { formatDate } from '@/utils/format'
import { isDemoMode } from '@/lib/env'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/components/public/PageHero'
import { Button } from '@/components/common/Button'

const schema = z.object({
  number: z
    .string()
    .trim()
    .min(4, 'Enter the full certificate number')
    .max(40, 'Certificate numbers are at most 40 characters')
    .regex(/^[A-Za-z0-9][A-Za-z0-9\-/]*$/, 'Use only letters, numbers, hyphens and slashes'),
})
type FormValues = z.infer<typeof schema>

type Result = { kind: 'found'; data: CertificateVerification } | { kind: 'missing'; number: string } | { kind: 'error'; message: string }

export default function CertificatesPage() {
  const [result, setResult] = useState<Result | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ number }: FormValues) => {
    setResult(null)
    try {
      const data = await verifyCertificate(number)
      setResult(data ? { kind: 'found', data } : { kind: 'missing', number })
    } catch (err) {
      setResult({ kind: 'error', message: errorMessage(err) })
    }
  }

  return (
    <>
      <Seo title="Certificate Verification" description="Verify the authenticity of a certificate issued by Arjuna Book of World Record using its certificate number." />
      <PageHero
        eyebrow="Verification"
        title="Certificate verification"
        description="Confirm that a certificate was genuinely issued by Arjuna Book of World Record. Enter the certificate number printed on the document."
        crumbs={[{ label: 'Certificate Verification' }]}
      />

      <section className="bg-paper py-16 lg:py-24">
        <div className="container-page max-w-3xl">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="-mt-28 rounded-3xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(11,31,51,0.35)] ring-1 ring-line sm:p-10 lg:-mt-36"
          >
            <label htmlFor="cert-number" className="block font-display text-lg font-semibold text-navy-900">
              Certificate number
            </label>
            <p className="mt-1 text-sm text-muted">For example: KR-2026-000123{isDemoMode && ' — in demo mode try KR-DEMO-0001'}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                id="cert-number"
                {...register('number')}
                autoComplete="off"
                spellCheck={false}
                placeholder="Enter certificate number"
                aria-invalid={errors.number ? true : undefined}
                aria-describedby={errors.number ? 'cert-error' : undefined}
                className="h-13 flex-1 rounded-full border border-line px-6 font-mono text-base tracking-wider uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15 focus:outline-none aria-[invalid=true]:border-red-600"
              />
              <Button type="submit" size="lg" loading={isSubmitting} icon={!isSubmitting && <ShieldCheck className="size-4" aria-hidden />}>
                Verify certificate
              </Button>
            </div>
            {errors.number && (
              <p id="cert-error" className="mt-3 text-sm font-medium text-red-600" role="alert">
                {errors.number.message}
              </p>
            )}
          </form>

          <div aria-live="polite" className="mt-8">
            <AnimatePresence mode="wait">
              {result?.kind === 'found' && (
                <motion.div
                  key="found"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden rounded-3xl bg-white ring-1 ring-emerald-600/25"
                >
                  <div className="flex items-center gap-4 bg-emerald-50 px-6 py-5 sm:px-10">
                    <BadgeCheck className="size-8 text-emerald-600" aria-hidden />
                    <div>
                      <p className="font-display text-xl font-bold tracking-wide text-emerald-800 uppercase">✓ Verified</p>
                      <p className="text-sm text-emerald-800/80">This certificate was issued by Arjuna Book of World Record.</p>
                    </div>
                  </div>
                  <dl className="grid gap-6 px-6 py-8 sm:grid-cols-2 sm:px-10">
                    {[
                      ['Certificate ID', result.data.certificate_number],
                      ['Holder name', result.data.holder_name],
                      ['Competition', result.data.competition],
                      ['Category', result.data.category],
                      ['Award', result.data.award],
                      ['Issue date', formatDate(result.data.issue_date, true)],
                    ]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{k}</dt>
                          <dd className="mt-1 font-medium text-ink">{v}</dd>
                        </div>
                      ))}
                  </dl>
                </motion.div>
              )}
              {result?.kind === 'missing' && (
                <motion.div
                  key="missing"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-4 rounded-3xl bg-white p-6 ring-1 ring-red-600/20 sm:p-10"
                >
                  <SearchX className="size-8 shrink-0 text-red-600" aria-hidden />
                  <div>
                    <p className="font-display text-xl font-bold tracking-wide text-red-700 uppercase">Certificate not found</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      No valid certificate matches <span className="font-mono font-semibold text-ink">{result.number.toUpperCase()}</span>. Check the number and
                      try again, or contact Arjuna Book of World Record if you believe this is an error.
                    </p>
                  </div>
                </motion.div>
              )}
              {result?.kind === 'error' && (
                <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-red-50 p-5 text-sm text-red-700" role="alert">
                  {result.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-10 text-center text-xs leading-5 text-muted">
            Verification shows only the details needed to confirm authenticity. Personal contact information is never displayed.
          </p>
        </div>
      </section>
    </>
  )
}
