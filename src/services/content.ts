// Public read queries. Every query adds explicit visibility filters: RLS already hides
// drafts from anonymous visitors, but a signed-in admin browsing the public site
// must also only see published content.
import type {
  Athlete,
  Award,
  Champion,
  Competition,
  GalleryItem,
  Milestone,
  NewsArticle,
  Official,
  SiteSettings,
  SocialLink,
  WorldRecord,
} from '@/types/database'
import { repo, type QueryOptions } from './repository'

export const PAGE_SIZE = 12

const published = { eq: { status: 'published' } } satisfies QueryOptions
const publicCompetitions = { neq: { status: 'draft' }, eq: { is_archived: false } } satisfies QueryOptions

const pageRange = (page: number, size = PAGE_SIZE) => ({ from: (page - 1) * size, to: page * size - 1 })

/** Drops undefined entries so an unset filter can never overwrite a visibility filter. */
const defined = <V>(obj: Record<string, V | undefined> | undefined) =>
  Object.fromEntries(Object.entries(obj ?? {}).filter(([, v]) => v !== undefined)) as Record<string, V>

function merge(...parts: QueryOptions[]): QueryOptions {
  const out: QueryOptions = {}
  for (const p of parts) {
    out.select = p.select ?? out.select
    out.eq = { ...out.eq, ...defined(p.eq) }
    out.neq = { ...out.neq, ...defined(p.neq) }
    out.in = { ...out.in, ...defined(p.in) }
    out.gte = { ...out.gte, ...defined(p.gte) }
    out.lte = { ...out.lte, ...defined(p.lte) }
    out.contains = { ...out.contains, ...defined(p.contains) }
    out.search = p.search ?? out.search
    out.order = p.order ?? out.order
    out.range = p.range ?? out.range
  }
  return out
}

// ---------------------------------------------------------------- settings
export async function getSiteSettings(): Promise<{ settings: SiteSettings | null; social: SocialLink[] }> {
  const [settings, social] = await Promise.all([repo('site_settings').findOne('id', 1), repo('social_links').list({ order: [{ column: 'sort_order' }] })])
  return { settings, social: social.rows }
}

// ------------------------------------------------------------ competitions
export type CompetitionRef = Pick<Competition, 'id' | 'name' | 'slug' | 'start_date' | 'location' | 'level' | 'status'>

/** Small lookup of every public competition, used for joins and filter options. */
export async function getCompetitionIndex(): Promise<CompetitionRef[]> {
  const { rows } = await repo('competitions').list(
    merge(publicCompetitions, {
      select: 'id,name,slug,start_date,location,level,status',
      order: [{ column: 'start_date', ascending: false }],
    }),
  )
  return rows
}

export interface CompetitionFilters {
  status?: string
  year?: string
  location?: string
  level?: string
  search?: string
  page?: number
}

export async function listCompetitions(f: CompetitionFilters = {}) {
  const ascending = f.status === 'upcoming'
  return repo('competitions').list(
    merge(publicCompetitions, {
      eq: { status: f.status || undefined, location: f.location || undefined, level: f.level || undefined },
      gte: f.year ? { start_date: `${f.year}-01-01` } : undefined,
      lte: f.year ? { start_date: `${f.year}-12-31` } : undefined,
      search: f.search ? { columns: ['name', 'location', 'venue'], term: f.search } : undefined,
      order: [{ column: 'start_date', ascending }],
      range: pageRange(f.page ?? 1, 9),
    }),
  )
}

/** Upcoming and ongoing championships, soonest first (shown on the News page). */
export async function listUpcomingCompetitions(limit = 6): Promise<Competition[]> {
  const { rows } = await repo('competitions').list(
    merge(publicCompetitions, {
      in: { status: ['upcoming', 'ongoing'] },
      order: [{ column: 'start_date' }],
      range: { from: 0, to: limit - 1 },
    }),
  )
  return rows
}

export async function getCompetition(slug: string) {
  return repo('competitions').findOne('slug', slug, publicCompetitions)
}

// --------------------------------------------------------------- champions
export interface ChampionWithCompetition extends Champion {
  competition: CompetitionRef | null
}

async function attachCompetitions(rows: Champion[]): Promise<ChampionWithCompetition[]> {
  if (!rows.length) return []
  const index = await getCompetitionIndex()
  const byId = new Map(index.map((c) => [c.id, c]))
  return rows.map((r) => ({ ...r, competition: r.competition_id ? (byId.get(r.competition_id) ?? null) : null }))
}

export interface ChampionFilters {
  year?: string
  competition?: string
  category?: string
  gender?: string
  ageGroup?: string
  medal?: string
  search?: string
  page?: number
}

export async function listChampions(f: ChampionFilters = {}) {
  const res = await repo('champions').list(
    merge(published, {
      eq: {
        year: f.year ? Number(f.year) : undefined,
        competition_id: f.competition || undefined,
        category: f.category || undefined,
        gender: f.gender || undefined,
        age_group: f.ageGroup || undefined,
        medal: f.medal || undefined,
      },
      search: f.search ? { columns: ['name', 'category', 'country'], term: f.search } : undefined,
      order: [{ column: 'year', ascending: false }, { column: 'position' }],
      range: pageRange(f.page ?? 1),
    }),
  )
  return { rows: await attachCompetitions(res.rows), count: res.count }
}

export async function listFeaturedChampions(limit = 4) {
  const res = await repo('champions').list(
    merge(published, {
      order: [{ column: 'is_featured', ascending: false }, { column: 'year', ascending: false }, { column: 'position' }],
      range: { from: 0, to: limit - 1 },
    }),
  )
  return attachCompetitions(res.rows)
}

export async function listCompetitionResults(competitionId: string) {
  const res = await repo('champions').list(merge(published, { eq: { competition_id: competitionId }, order: [{ column: 'category' }, { column: 'position' }] }))
  return res.rows
}

/** Distinct values for champion filters, computed from a light projection of published rows. */
export async function getChampionFilterOptions() {
  const [{ rows }, competitions] = await Promise.all([
    repo('champions').list(merge(published, { select: 'year,category,age_group,competition_id' })),
    getCompetitionIndex(),
  ])
  const distinct = <V>(vals: (V | null)[]) => [...new Set(vals.filter((v): v is V => v != null && v !== ''))]
  const usedComps = new Set(rows.map((r) => r.competition_id))
  return {
    years: distinct(rows.map((r) => r.year)).sort((a, b) => b - a),
    categories: distinct(rows.map((r) => r.category)).sort(),
    ageGroups: distinct(rows.map((r) => r.age_group)).sort(),
    competitions: competitions.filter((c) => usedComps.has(c.id)),
  }
}

// ---------------------------------------------------------------- athletes
export async function getAthlete(slug: string) {
  const athlete = await repo('athletes').findOne('slug', slug, published)
  if (!athlete) return null
  const [results, records] = await Promise.all([
    repo('champions').list(merge(published, { eq: { athlete_id: athlete.id }, order: [{ column: 'year', ascending: false }] })),
    repo('world_records').list(merge(published, { eq: { athlete_id: athlete.id }, order: [{ column: 'record_date', ascending: false }] })),
  ])
  return { athlete, results: await attachCompetitions(results.rows), records: records.rows }
}

export async function getAthleteSlugs(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map()
  const { rows } = await repo('athletes').list(merge(published, { select: 'id,slug', in: { id: ids } }))
  return new Map(rows.map((a: Pick<Athlete, 'id' | 'slug'>) => [a.id, a.slug]))
}

// ----------------------------------------------------------- world records
export async function listWorldRecords(f: { category?: string; search?: string } = {}) {
  return repo('world_records').list(
    merge(published, {
      eq: { category: f.category || undefined },
      search: f.search ? { columns: ['title', 'holder_name', 'location'], term: f.search } : undefined,
      order: [
        { column: 'is_featured', ascending: false },
        { column: 'record_date', ascending: false },
      ],
    }),
  )
}

export async function listFeaturedRecords(limit = 3): Promise<WorldRecord[]> {
  const { rows } = await repo('world_records').list(
    merge(published, {
      order: [
        { column: 'is_featured', ascending: false },
        { column: 'record_date', ascending: false },
      ],
      range: { from: 0, to: limit - 1 },
    }),
  )
  return rows
}

export async function getWorldRecord(slug: string) {
  return repo('world_records').findOne('slug', slug, published)
}

// ------------------------------------------------------------------ awards
export async function listAwards(f: { category?: string; year?: string } = {}): Promise<Award[]> {
  const { rows } = await repo('awards').list(
    merge(published, {
      eq: { category: f.category || undefined, year: f.year ? Number(f.year) : undefined },
      order: [{ column: 'year', ascending: false }, { column: 'name' }],
    }),
  )
  return rows
}

export async function listFeaturedAwards(limit = 4): Promise<Award[]> {
  const { rows } = await repo('awards').list(
    merge(published, {
      order: [
        { column: 'is_featured', ascending: false },
        { column: 'year', ascending: false },
      ],
      range: { from: 0, to: limit - 1 },
    }),
  )
  return rows
}

// ----------------------------------------------------------------- gallery
export async function listGallery(f: { category?: string; competition?: string; page?: number; pageSize?: number } = {}) {
  return repo('gallery').list(
    merge(published, {
      eq: { category: f.category || undefined, competition_id: f.competition || undefined },
      order: [{ column: 'sort_order' }, { column: 'created_at', ascending: false }],
      range: pageRange(f.page ?? 1, f.pageSize ?? 18),
    }),
  ) as Promise<{ rows: GalleryItem[]; count: number }>
}

// -------------------------------------------------------------------- news
const publishedNews = (): QueryOptions => merge(published, { lte: { publish_date: new Date().toISOString() } })

export async function listNews(f: { category?: string; search?: string; page?: number; pageSize?: number } = {}) {
  return repo('news').list(
    merge(publishedNews(), {
      select: 'id,slug,title,category,cover_image_url,excerpt,author,publish_date,status,created_at,updated_at',
      eq: { category: f.category || undefined },
      search: f.search ? { columns: ['title', 'excerpt'], term: f.search } : undefined,
      order: [{ column: 'publish_date', ascending: false }],
      range: pageRange(f.page ?? 1, f.pageSize ?? 9),
    }),
  ) as Promise<{ rows: NewsArticle[]; count: number }>
}

export async function listNewsCategories(): Promise<string[]> {
  const { rows } = await repo('news').list(merge(publishedNews(), { select: 'category' }))
  return [...new Set(rows.map((r) => r.category).filter((c): c is string => !!c))].sort()
}

export async function getNewsArticle(slug: string) {
  const article = await repo('news').findOne('slug', slug, publishedNews())
  if (!article) return null
  const related = await repo('news').list(
    merge(publishedNews(), {
      neq: { id: article.id },
      eq: { category: article.category ?? undefined },
      order: [{ column: 'publish_date', ascending: false }],
      range: { from: 0, to: 2 },
    }),
  )
  return { article, related: related.rows }
}

// -------------------------------------------------------------------- about
export async function getAboutContent(): Promise<{ milestones: Milestone[]; officials: Official[] }> {
  const [m, o] = await Promise.all([
    repo('milestones').list(merge(published, { order: [{ column: 'year' }, { column: 'sort_order' }] })),
    repo('officials').list(merge(published, { order: [{ column: 'sort_order' }] })),
  ])
  return { milestones: m.rows, officials: o.rows }
}
