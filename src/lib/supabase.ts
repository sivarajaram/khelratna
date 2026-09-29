import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, isDemoMode } from './env'

// Only the public anon key is ever used in the browser. Access is enforced by RLS.
export const supabase: SupabaseClient | null = isDemoMode
  ? null
  : createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}
