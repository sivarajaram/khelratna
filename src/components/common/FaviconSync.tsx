import { useEffect } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

/** Applies the favicon uploaded in Site Settings (falls back to /favicon.png). */
export function FaviconSync() {
  const { settings } = useSiteSettings()
  const href = settings?.favicon_url
  useEffect(() => {
    if (!href) return
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (link) link.href = href
  }, [href])
  return null
}
