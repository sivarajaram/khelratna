import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { env } from '@/lib/env'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface SeoProps {
  title?: string
  description?: string | null
  image?: string | null
  type?: 'website' | 'article'
  /** Canonical path override; defaults to the current path without query string. */
  path?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string | null | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export const absoluteUrl = (path: string) => `${env.siteUrl || window.location.origin}${path.startsWith('/') ? path : `/${path}`}`

/** Sets title, description, canonical, Open Graph, Twitter and JSON-LD for the current page. */
export function Seo({ title, description, image, type = 'website', path, noindex, jsonLd }: SeoProps) {
  const { settings } = useSiteSettings()
  const location = useLocation()
  const org = settings?.org_name ?? 'Khelratna'
  const fullTitle = title ? `${title} | ${org}` : (settings?.seo_title ?? org)
  const desc = description ?? settings?.seo_description ?? ''
  const canonical = absoluteUrl(path ?? location.pathname)
  const img = image ?? settings?.og_image_url ?? null
  const ld = JSON.stringify(jsonLd ?? null)

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', canonical)
    upsertMeta('property', 'og:site_name', org)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', img && !img.startsWith('data:') ? (img.startsWith('http') ? img : absoluteUrl(img)) : null)
    upsertMeta('name', 'twitter:card', img ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)

    const existing = document.getElementById('kr-jsonld')
    const data = JSON.parse(ld) as unknown
    if (!data) {
      existing?.remove()
      return
    }
    const script = existing ?? Object.assign(document.createElement('script'), { id: 'kr-jsonld', type: 'application/ld+json' })
    script.textContent = ld
    if (!existing) document.head.appendChild(script)
  }, [fullTitle, desc, canonical, org, type, img, noindex, ld])

  return null
}
