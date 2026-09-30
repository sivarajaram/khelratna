// Writes dist/sitemap.xml and dist/robots.txt after `vite build`.
// Static routes are always included; when Supabase env vars are set, published
// competitions, athletes, world records and news are fetched with the public anon key.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  const env = { ...process.env }
  for (const file of ['.env', '.env.local', '.env.production']) {
    const path = resolve(file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
  return env
}

const env = loadEnv()
const site = (env.VITE_SITE_URL || 'https://www.arjunabookofworldrecord.example').replace(/\/$/, '')
const supabaseUrl = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY

const staticRoutes = [
  '/',
  '/about',
  '/competitions',
  '/champions',
  '/world-records',
  '/awards',
  '/gallery',
  '/news',
  '/certificates',
  '/contact',
  '/privacy',
  '/terms',
]

async function fetchSlugs(table, query, prefix) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=slug,updated_at&${query}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  })
  if (!res.ok) throw new Error(`${table}: ${res.status}`)
  const rows = await res.json()
  return rows.map((r) => ({ path: `${prefix}/${r.slug}`, lastmod: r.updated_at?.slice(0, 10) }))
}

const entries = staticRoutes.map((path) => ({ path }))
if (supabaseUrl && anonKey) {
  try {
    const nowIso = new Date().toISOString()
    const dynamic = await Promise.all([
      fetchSlugs('competitions', 'status=neq.draft&is_archived=is.false', '/competitions'),
      fetchSlugs('athletes', 'status=eq.published', '/athletes'),
      fetchSlugs('world_records', 'status=eq.published', '/world-records'),
      fetchSlugs('news', `status=eq.published&publish_date=lte.${encodeURIComponent(nowIso)}`, '/news'),
    ])
    entries.push(...dynamic.flat())
  } catch (err) {
    console.warn('[sitemap] could not load dynamic routes:', err.message)
  }
} else {
  console.warn('[sitemap] Supabase not configured - static routes only')
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url><loc>${site}${e.path}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`
const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${site}/sitemap.xml
`

if (!existsSync(resolve('dist'))) {
  console.error('[sitemap] dist/ not found - run vite build first')
  process.exit(1)
}
writeFileSync(resolve('dist/sitemap.xml'), xml)
writeFileSync(resolve('dist/robots.txt'), robots)
console.log(`[sitemap] wrote ${entries.length} URLs`)
