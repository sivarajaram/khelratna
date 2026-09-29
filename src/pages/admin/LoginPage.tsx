import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Info, Lock } from 'lucide-react'
import { signIn, sendPasswordReset, updatePassword, DEMO_CREDENTIALS } from '@/services/auth'
import { errorMessage } from '@/services/errors'
import { useAuth } from '@/hooks/useAuth'
import { isDemoMode } from '@/lib/env'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/common/Button'
import { Logo } from '@/components/common/Logo'

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard'
  const [params] = useSearchParams()
  const resetting = params.get('reset') === '1' && !!user

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    document.title = 'Admin login | Khelratna'
  }, [])

  useEffect(() => {
    if (!loading && user && isAdmin && !resetting) navigate(from, { replace: true })
  }, [loading, user, isAdmin, from, navigate, resetting])

  const onSubmit = async ({ email, password }: FormValues) => {
    setError(null)
    setNotice(null)
    try {
      await signIn(email, password)
      // Redirect happens in the effect once the admin check resolves
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const onForgot = async () => {
    const email = getValues('email')
    if (!email || !z.string().email().safeParse(email).success) {
      setError('Enter your email address above first, then choose “Forgot password”.')
      return
    }
    try {
      await sendPasswordReset(email)
      setNotice('If an account exists for this email, a password reset link has been sent.')
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grain" aria-hidden />
        <div className="absolute -right-32 -bottom-32 size-[30rem] rounded-full bg-navy-700/50 blur-3xl" aria-hidden />
        <Logo tone="light" className="relative" />
        <div className="relative">
          <p className="font-display text-4xl leading-tight font-bold uppercase">
            Content
            <br />
            management
          </p>
          <p className="mt-4 max-w-sm text-white/60">Manage competitions, champions, records, awards, gallery and news for the Khelratna website.</p>
        </div>
        <p className="relative text-xs text-white/40">Authorised Khelratna staff only.</p>
      </div>

      <main className="flex items-center justify-center bg-paper p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-10 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
            <ArrowLeft className="size-3.5" aria-hidden /> Back to website
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 font-display text-2xl font-semibold text-ink lg:mt-0">Sign in to admin</h1>
          <p className="mt-1 text-sm text-muted">Use your Khelratna administrator account.</p>

          {isDemoMode && (
            <div className="mt-6 flex gap-3 rounded-xl bg-gold-50 p-4 text-sm text-gold-700 ring-1 ring-gold-500/30">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="font-medium">Demo mode (Supabase not connected)</p>
                <p className="mt-1">
                  Email <code className="font-mono">{DEMO_CREDENTIALS.email}</code>, password <code className="font-mono">{DEMO_CREDENTIALS.password}</code>
                </p>
                <button
                  type="button"
                  className="mt-2 font-semibold underline underline-offset-2"
                  onClick={() => {
                    setValue('email', DEMO_CREDENTIALS.email)
                    setValue('password', DEMO_CREDENTIALS.password)
                  }}
                >
                  Fill in demo credentials
                </button>
              </div>
            </div>
          )}

          {resetting ? (
            <ResetPasswordForm onDone={() => navigate('/admin/dashboard', { replace: true })} />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
              <FormField label="Email" error={errors.email?.message} required>
                <input {...register('email')} type="email" autoComplete="username" className="input h-11" />
              </FormField>
              <FormField label="Password" error={errors.password?.message} required>
                <input {...register('password')} type="password" autoComplete="current-password" className="input h-11" />
              </FormField>
              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">
                  {notice}
                </p>
              )}
              <Button
                type="submit"
                variant="navy"
                caps={false}
                className="h-11 w-full"
                loading={isSubmitting || (loading && !!user)}
                icon={<Lock className="size-4" aria-hidden />}
              >
                Sign in
              </Button>
              {!isDemoMode && (
                <button type="button" onClick={onForgot} className="w-full text-center text-sm font-medium text-navy-700 hover:underline">
                  Forgot password?
                </button>
              )}
            </form>
          )}
          {user && !loading && !isAdmin && (
            <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">
              {user.email} is signed in but does not have admin access.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

const resetSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })

function ResetPasswordForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) })

  return (
    <form
      noValidate
      className="mt-8 space-y-5"
      onSubmit={handleSubmit(async ({ password }) => {
        setError(null)
        try {
          await updatePassword(password)
          onDone()
        } catch (err) {
          setError(errorMessage(err))
        }
      })}
    >
      <p className="rounded-lg bg-navy-50 p-3 text-sm text-navy-800">Choose a new password for your account.</p>
      <FormField label="New password" error={errors.password?.message} required>
        <input {...register('password')} type="password" autoComplete="new-password" className="input h-11" />
      </FormField>
      <FormField label="Confirm password" error={errors.confirm?.message} required>
        <input {...register('confirm')} type="password" autoComplete="new-password" className="input h-11" />
      </FormField>
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" variant="navy" caps={false} className="h-11 w-full" loading={isSubmitting}>
        Save new password
      </Button>
    </form>
  )
}
