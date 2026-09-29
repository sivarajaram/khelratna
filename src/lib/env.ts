const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const env = {
  supabaseUrl: url?.trim() ?? '',
  supabaseAnonKey: anonKey?.trim() ?? '',
  siteUrl: ((import.meta.env.VITE_SITE_URL as string | undefined) ?? '').replace(/\/$/, ''),
}

/**
 * Demo mode runs the whole site against clearly-marked placeholder data kept in the
 * browser, so the design and admin panel can be reviewed before Supabase is connected.
 */
export const isDemoMode = !(env.supabaseUrl && env.supabaseAnonKey)
