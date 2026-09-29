// =====================================================================
// PLACEHOLDER CONTENT — DEMO MODE ONLY
// Every name, date, place, number and record below is a stand-in used to
// preview the design. None of it is real Khelratna information. It is never
// written to Supabase; real content is entered through the admin panel.
// =====================================================================
import type {
  AdminUser,
  Athlete,
  Award,
  Certificate,
  Champion,
  Competition,
  Enquiry,
  GalleryItem,
  Milestone,
  NewsArticle,
  Official,
  SiteSettings,
  SocialLink,
  TableName,
  WorldRecord,
} from '@/types/database'

const T = '2026-01-01T00:00:00.000Z'
const stamps = { created_at: T, updated_at: T }
const id = (prefix: string, n: number) => `00000000-0000-4000-8000-${prefix}${String(n).padStart(12 - prefix.length, '0')}`

const settings: SiteSettings = {
  id: 1,
  org_name: 'Khelratna',
  tagline: 'Karate championships, recognition and achievement.',
  logo_url: null,
  favicon_url: null,
  phone: '+91 00000 00000',
  email: 'info@khelratna.example',
  whatsapp: '+91 00000 00000',
  address: '[Placeholder address] City, State, India',
  map_embed_url: null,
  footer_text: 'Khelratna celebrates Karate excellence through competitions, championships, recognition and extraordinary sporting accomplishments.',
  seo_title: 'Khelratna | Karate Championships, Champions & Recognition',
  seo_description:
    'Khelratna celebrates Karate excellence through competitions, championships, recognition, achievements and extraordinary sporting accomplishments.',
  og_image_url: null,
  hero_image_url: null,
  about_image_url: null,
  about_summary:
    '[Placeholder] Khelratna is a Karate organisation that conducts championships, recognises athletes and celebrates achievement in the sport. Replace this summary with Khelratna’s own introduction from Admin › Site Settings.',
  about_story:
    '[Placeholder] This is where Khelratna’s own story will appear — how the organisation began, the championships it has built and the athletes it has recognised.\n\nAll history, dates and achievements on this page must come from Khelratna. Edit this text in Admin › Site Settings.',
  mission: '[Placeholder] To conduct fair, well-organised Karate championships and give every athlete a stage on which discipline becomes achievement.',
  vision: '[Placeholder] To be a trusted name in Karate competition and recognition, nationally and internationally.',
  core_values: [
    { title: 'Discipline', description: 'Preparation, patience and respect for the art in every bout.' },
    { title: 'Integrity', description: 'Transparent judging, fair results and honest recognition.' },
    { title: 'Excellence', description: 'A standard of organisation worthy of the athletes who compete.' },
    { title: 'Respect', description: 'For opponents, officials, coaches and the traditions of Karate.' },
    { title: 'Recognition', description: 'Achievement deserves to be seen, documented and celebrated.' },
    { title: 'Unity', description: 'Clubs, associations and athletes brought together by the sport.' },
  ],
  stats: [
    { label: 'Years of Excellence', value: 10, suffix: '+' },
    { label: 'Championships', value: 50, suffix: '+' },
    { label: 'Athletes Recognised', value: 5000, suffix: '+' },
    { label: 'World Records', value: 3, suffix: '' },
  ],
  updated_at: T,
}

const social: SocialLink[] = [
  { id: id('51', 1), platform: 'instagram', url: 'https://www.instagram.com/', sort_order: 1, created_at: T },
  { id: id('51', 2), platform: 'facebook', url: 'https://www.facebook.com/', sort_order: 2, created_at: T },
  { id: id('51', 3), platform: 'youtube', url: 'https://www.youtube.com/', sort_order: 3, created_at: T },
]

const milestones: Milestone[] = [
  ['milestone', 'Organisation founded', 'Placeholder milestone — replace with Khelratna’s founding year and story.'],
  ['championship', 'First championship conducted', 'Placeholder — the first Khelratna championship.'],
  ['recognition', 'Major recognition received', 'Placeholder — a significant recognition for the organisation.'],
  ['world-record', 'World record moment', 'Placeholder — only verified records supplied by Khelratna belong here.'],
  ['international', 'International participation', 'Placeholder — the first international edition or delegation.'],
].map(([kind, title, description], i) => ({
  id: id('61', i + 1),
  year: 2016 + i * 2,
  title: `${title} (sample)`,
  description,
  kind: kind as Milestone['kind'],
  sort_order: i,
  status: 'published',
  ...stamps,
}))

const officials: Official[] = []

type CompSeed = [slug: string, name: string, level: string, status: Competition['status'], start: string, end: string, featured?: boolean]
const compSeeds: CompSeed[] = [
  ['sample-national-karate-championship-2026', 'Sample National Karate Championship 2026', 'National', 'upcoming', '2026-12-12', '2026-12-14', true],
  ['sample-international-open-2027', 'Sample International Karate Open 2027', 'International', 'upcoming', '2027-02-20', '2027-02-22'],
  ['sample-state-championship-2026', 'Sample State Karate Championship 2026', 'State', 'ongoing', '2026-09-27', '2026-10-01'],
  ['sample-open-karate-championship-2026', 'Sample Open Karate Championship 2026', 'Open', 'completed', '2026-05-09', '2026-05-11'],
  ['sample-national-karate-championship-2025', 'Sample National Karate Championship 2025', 'National', 'completed', '2025-11-14', '2025-11-16'],
  ['sample-international-open-2025', 'Sample International Karate Open 2025', 'International', 'completed', '2025-03-07', '2025-03-09'],
]

const competitions: Competition[] = compSeeds.map(([slug, name, level, status, start, end, featured], i) => ({
  id: id('11', i + 1),
  slug,
  name,
  level,
  cover_image_url: null,
  start_date: start,
  end_date: end,
  venue: 'Sample Indoor Stadium',
  location: ['City A, India', 'City B, India', 'City C, India'][i % 3],
  organizer: 'Khelratna',
  status,
  is_archived: false,
  is_featured: Boolean(featured),
  short_description: 'Placeholder description. A championship bringing together Kata and Kumite athletes across age groups and weight categories.',
  description:
    '[Placeholder] Detailed information about this championship will appear here — its format, the categories contested, rules, schedule and what makes this edition significant.\n\nReplace this text with official Khelratna information from the admin panel.',
  categories: ['Individual Kata', 'Team Kata', 'Kumite -60kg', 'Kumite -75kg', 'Kumite +75kg', 'Under-14', 'Under-18', 'Senior'],
  participant_count: status === 'completed' ? 400 + i * 50 : null,
  countries_count: level === 'International' ? 8 : null,
  awards_info: 'Medals and certificates for podium finishers in every category (placeholder).',
  results_summary: status === 'completed' ? 'Placeholder results summary.' : null,
  documents: status === 'upcoming' ? [{ name: 'Championship circular (sample)', url: '#' }] : [],
  registration_url: null,
  ...stamps,
}))

const athleteNames = ['Sample Athlete 01', 'Sample Athlete 02', 'Sample Athlete 03', 'Sample Athlete 04', 'Sample Athlete 05', 'Sample Athlete 06']
const athleteCats = ['Individual Kata', 'Kumite -60kg', 'Kumite -75kg', 'Individual Kata', 'Kumite +75kg', 'Team Kata']
const athletes: Athlete[] = athleteNames.map((name, i) => ({
  id: id('21', i + 1),
  slug: `sample-athlete-${String(i + 1).padStart(2, '0')}`,
  name,
  photo_url: null,
  country: 'India',
  gender: i % 2 === 0 ? 'female' : 'male',
  category: athleteCats[i],
  biography: '[Placeholder] Athlete biography — competitive background, style and journey in Karate. Real athlete profiles are added by Khelratna staff.',
  gold_count: 6 - i,
  silver_count: 2 + (i % 3),
  bronze_count: 1 + (i % 2),
  achievements: ['Sample achievement one', 'Sample achievement two'],
  is_featured: i < 4,
  status: 'published',
  ...stamps,
}))

const medals: Champion['medal'][] = ['gold', 'gold', 'silver', 'gold', 'bronze', 'gold', 'silver', 'gold', 'bronze', 'gold']
const champions: Champion[] = medals.map((medal, i) => {
  const athlete = athletes[i % athletes.length]
  const comp = competitions[3 + (i % 3)]
  return {
    id: id('31', i + 1),
    name: athlete.name,
    athlete_id: athlete.id,
    competition_id: comp.id,
    photo_url: null,
    country: 'India',
    category: athlete.category,
    age_group: ['Senior', 'Under-18', 'Under-14'][i % 3],
    gender: athlete.gender,
    position: medal === 'gold' ? 1 : medal === 'silver' ? 2 : 3,
    medal,
    year: Number(comp.start_date!.slice(0, 4)),
    achievements: null,
    biography: null,
    is_featured: i < 4,
    status: 'published',
    ...stamps,
  }
})

const records: WorldRecord[] = [1, 2, 3].map((n) => ({
  id: id('41', n),
  slug: `sample-world-record-${n}`,
  title: `Sample World Record Title ${n}`,
  description:
    'Placeholder. Only world records documented and verified by Khelratna will be displayed here, with the recognising organisation and supporting evidence.',
  story:
    '[Placeholder] The story behind this achievement — the preparation, the attempt and the moment it was confirmed.\n\nThis text, the record title, the recognising organisation and all evidence must be supplied by Khelratna.',
  athlete_id: athletes[n - 1].id,
  holder_name: athletes[n - 1].name,
  record_date: `202${3 + n}-0${n + 2}-15`,
  location: 'City A, India',
  category: ['Kata', 'Endurance', 'Group Demonstration'][n - 1],
  recognition_org: '[Recognition body to be provided]',
  cover_image_url: null,
  images: [],
  video_url: null,
  certificate_url: null,
  documents: [],
  is_featured: true,
  status: 'published',
  ...stamps,
}))

const awardSeeds: [Award['category'], string, string][] = [
  ['organization', 'Sample Organisation Award', 'Khelratna'],
  ['athlete', 'Sample Athlete of the Year', 'Sample Athlete 01'],
  ['championship', 'Sample Best Performing Team', 'Sample Karate Club'],
  ['special', 'Sample Special Recognition', 'Sample Official'],
  ['international', 'Sample International Recognition', 'Khelratna'],
  ['athlete', 'Sample Rising Athlete Award', 'Sample Athlete 04'],
]
const awards: Award[] = awardSeeds.map(([category, name, recipient], i) => ({
  id: id('71', i + 1),
  name,
  recipient,
  year: 2026 - (i % 3),
  category,
  description: 'Placeholder description of why this recognition was given.',
  image_url: null,
  competition_id: category === 'championship' ? competitions[3].id : null,
  is_featured: i < 4,
  status: 'published',
  ...stamps,
}))

const galleryCats: GalleryItem['category'][] = ['competitions', 'champions', 'awards', 'world-records', 'events']
const gallery: GalleryItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: id('81', i + 1),
  media_type: 'image',
  url: '',
  thumbnail_url: null,
  caption: `Placeholder photo ${i + 1} — replace with Khelratna photography`,
  alt: 'Placeholder image',
  category: galleryCats[i % galleryCats.length],
  competition_id: competitions[3 + (i % 3)].id,
  album: null,
  sort_order: i,
  status: 'published',
  ...stamps,
}))

const newsSeeds: [string, string][] = [
  ['Announcements', 'Sample announcement: National Championship 2026 dates confirmed'],
  ['Results', 'Sample results: champions crowned at the Open Championship'],
  ['Recognition', 'Sample story: athletes honoured at the annual awards'],
  ['Events', 'Sample update: preparations underway for the International Open'],
]
const news: NewsArticle[] = newsSeeds.map(([category, title], i) => ({
  id: id('91', i + 1),
  slug: `sample-news-${i + 1}`,
  title,
  category,
  cover_image_url: null,
  excerpt: 'Placeholder excerpt. News articles are written and published by Khelratna staff from the admin panel.',
  content:
    '## Placeholder article\n\nThis is **sample content** used to preview the news layout. Replace it with a real Khelratna article.\n\n- Paragraphs, headings and lists are supported\n- Links like [our competitions](/competitions) work too\n\n> Quotes can highlight words from officials or athletes.\n\nArticles are written in a simple formatting syntax in the admin panel.',
  author: 'Khelratna Media Team',
  publish_date: `2026-0${8 - i}-1${i}T09:00:00.000Z`,
  seo_title: null,
  seo_description: null,
  status: 'published',
  ...stamps,
}))

const certificates: Certificate[] = [
  {
    id: id('a1', 1),
    certificate_number: 'KR-DEMO-0001',
    holder_name: 'Sample Athlete 01',
    competition_id: competitions[3].id,
    competition_name: null,
    category: 'Individual Kata — Senior',
    award: 'Gold Medal',
    issue_date: '2026-05-11',
    document_url: null,
    status: 'valid',
    ...stamps,
  },
  {
    id: id('a1', 2),
    certificate_number: 'KR-DEMO-0002',
    holder_name: 'Sample Athlete 02',
    competition_id: competitions[4].id,
    competition_name: null,
    category: 'Kumite -60kg — Under-18',
    award: 'Silver Medal',
    issue_date: '2025-11-16',
    document_url: null,
    status: 'valid',
    ...stamps,
  },
]

const enquiries: Enquiry[] = [
  {
    id: id('b1', 1),
    name: 'Sample Visitor',
    email: 'visitor@example.com',
    phone: null,
    subject: 'Participation in the next championship',
    message: 'This is a sample enquiry shown in demo mode so the enquiry inbox can be reviewed.',
    status: 'new',
    ...stamps,
  },
]

const admins: AdminUser[] = [{ user_id: 'demo-admin', email: 'admin@khelratna.demo', full_name: 'Demo Administrator', role: 'admin', created_at: T }]

export const demoData: Record<TableName, Record<string, unknown>[]> = {
  site_settings: [settings],
  social_links: social,
  milestones,
  officials,
  competitions,
  athletes,
  champions,
  world_records: records,
  awards,
  gallery,
  news,
  certificates,
  enquiries,
  admins,
} as unknown as Record<TableName, Record<string, unknown>[]>
