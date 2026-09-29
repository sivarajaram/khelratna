import { createContext, useContext, type ReactNode } from 'react'
import type { SiteSettings, SocialLink } from '@/types/database'
import { getSiteSettings } from '@/services/content'
import { useQuery } from './useQuery'

interface SiteSettingsValue {
  settings: SiteSettings | null
  social: SocialLink[]
  loading: boolean
  reload: () => void
}

const SiteSettingsContext = createContext<SiteSettingsValue>({ settings: null, social: [], loading: true, reload: () => {} })

export const SETTINGS_KEY = 'site-settings'

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const q = useQuery(SETTINGS_KEY, getSiteSettings)
  return (
    <SiteSettingsContext.Provider value={{ settings: q.data?.settings ?? null, social: q.data?.social ?? [], loading: q.loading, reload: q.reload }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export const useSiteSettings = () => useContext(SiteSettingsContext)
