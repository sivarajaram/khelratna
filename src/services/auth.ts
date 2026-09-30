import { supabase } from '@/lib/supabase'
import { AppError } from './errors'

export interface AuthUser {
  id: string
  email: string
}

const DEMO_KEY = 'arjunabookofworldrecord-demo-session'
export const DEMO_CREDENTIALS = { email: 'admin@arjunabookofworldrecord.demo', password: 'demo1234' }
const demoListeners = new Set<(u: AuthUser | null) => void>()

function readDemoSession(): AuthUser | null {
  try {
    return sessionStorage.getItem(DEMO_KEY) ? { id: 'demo-admin', email: DEMO_CREDENTIALS.email } : null
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return readDemoSession()
  const { data } = await supabase.auth.getSession()
  const u = data.session?.user
  return u ? { id: u.id, email: u.email ?? '' } : null
}

export function onAuthChange(cb: (u: AuthUser | null) => void): () => void {
  if (!supabase) {
    demoListeners.add(cb)
    return () => demoListeners.delete(cb)
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user
    cb(u ? { id: u.id, email: u.email ?? '' } : null)
  })
  return () => data.subscription.unsubscribe()
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (!supabase) {
    if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      throw new AppError('Incorrect email or password.')
    }
    try {
      sessionStorage.setItem(DEMO_KEY, '1')
    } catch {
      /* ignore */
    }
    const u = { id: 'demo-admin', email: DEMO_CREDENTIALS.email }
    demoListeners.forEach((l) => l(u))
    return u
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error || !data.user) {
    // Never reveal whether the account exists
    throw new AppError(error?.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : 'Incorrect email or password.', 'auth', error)
  }
  return { id: data.user.id, email: data.user.email ?? '' }
}

export async function signOut() {
  if (!supabase) {
    try {
      sessionStorage.removeItem(DEMO_KEY)
    } catch {
      /* ignore */
    }
    demoListeners.forEach((l) => l(null))
    return
  }
  await supabase.auth.signOut()
}

/** True when the signed-in user has a row in public.admins (checked in the database). */
export async function checkIsAdmin(): Promise<boolean> {
  if (!supabase) return readDemoSession() !== null
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw AppError.from(error)
  return data === true
}

export async function sendPasswordReset(email: string) {
  if (!supabase) return
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/admin/login?reset=1`,
  })
  if (error) throw AppError.from(error)
}

/** Sets a new password for the user signed in through a reset link. */
export async function updatePassword(password: string) {
  if (!supabase) return
  const { error } = await supabase.auth.updateUser({ password })
  if (error)
    throw new AppError(
      error.message.includes('different') ? 'Choose a password different from your current one.' : 'Could not update the password. Request a new reset link.',
      'auth',
      error,
    )
}
