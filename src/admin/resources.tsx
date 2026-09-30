import { Award, BadgeCheck, CalendarRange, Flag, Images, Medal, Newspaper, Trophy, UserRound, UsersRound } from 'lucide-react'
import type { Option, ResourceConfig, Row } from './types'
import { StatusPill, TitleCell, dateCell, textCell } from '@/components/admin/Cells'
import { formatDateRange, titleCase } from '@/utils/format'

const opts = (...values: string[]): Option[] => values.map((v) => ({ value: v, label: titleCase(v) }))
const contentStatus = opts('draft', 'published', 'archived')
const contentArchive = { field: 'status', value: 'archived', restore: 'draft' }
const medalOptions = opts('gold', 'silver', 'bronze')
const genderOptions = opts('female', 'male')

const statusField = (help = 'Only published items appear on the public website.') => ({
  name: 'status',
  label: 'Status',
  type: 'select' as const,
  required: true,
  options: contentStatus,
  help,
})
const featuredField = { name: 'is_featured', label: 'Feature on homepage', type: 'boolean' as const, help: 'Featured items are shown first on the homepage.' }

// --------------------------------------------------------------- competitions
const competitions: ResourceConfig = {
  key: 'competitions',
  table: 'competitions',
  singular: 'Competition',
  plural: 'Competitions',
  description: 'Championships and competitions, with their categories, documents and results.',
  icon: CalendarRange,
  titleField: 'name',
  searchColumns: ['name', 'location', 'venue'],
  defaultOrder: [{ column: 'start_date', ascending: false }],
  statusField: 'status',
  statusOptions: opts('draft', 'upcoming', 'ongoing', 'completed', 'cancelled'),
  archive: { field: 'is_archived', value: true, restore: false },
  publicPath: (r) => (r.status !== 'draft' && !r.is_archived ? `/competitions/${r.slug}` : null),
  defaults: { status: 'draft', is_archived: false, is_featured: false, categories: [], documents: [], organizer: 'Arjuna Book of World Record' },
  fields: [
    { section: 'Basics', name: 'name', label: 'Competition name', type: 'text', required: true, full: true, maxLength: 160 },
    { name: 'slug', label: 'URL slug', type: 'slug', slugFrom: 'name', help: 'Used in the page address: /competitions/your-slug' },
    { name: 'level', label: 'Level / category', type: 'text', placeholder: 'National, International, Open…' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: opts('draft', 'upcoming', 'ongoing', 'completed', 'cancelled'),
      help: 'Draft competitions are hidden from the public site.',
    },
    featuredField,
    { name: 'cover_image_url', label: 'Cover image', type: 'image', bucket: 'competition-images', full: true },
    { section: 'Date & place', name: 'start_date', label: 'Start date', type: 'date' },
    { name: 'end_date', label: 'End date', type: 'date' },
    { name: 'venue', label: 'Venue', type: 'text' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'City, State, Country' },
    { name: 'organizer', label: 'Organiser', type: 'text' },
    {
      section: 'Description',
      name: 'short_description',
      label: 'Short description',
      type: 'textarea',
      full: true,
      maxLength: 300,
      help: 'Shown on cards (max 300 characters).',
    },
    { name: 'description', label: 'Full description', type: 'textarea', full: true, help: 'Separate paragraphs with a blank line.' },
    { name: 'categories', label: 'Event categories', type: 'tags', full: true, placeholder: 'e.g. Individual Kata — press Enter to add' },
    { section: 'Highlights & results', name: 'participant_count', label: 'Participants', type: 'number' },
    { name: 'countries_count', label: 'Countries', type: 'number' },
    { name: 'awards_info', label: 'Awards information', type: 'text', full: true },
    {
      name: 'results_summary',
      label: 'Results summary',
      type: 'textarea',
      full: true,
      help: 'Winners are added under Champions and linked to this competition.',
    },
    { name: 'documents', label: 'Documents', type: 'documents', bucket: 'documents', full: true, help: 'Circulars, schedules, rules (PDF).' },
  ],
  validate: (v) => (v.start_date && v.end_date && String(v.end_date) < String(v.start_date) ? { end_date: 'End date cannot be before the start date' } : null),
  columns: [
    { key: 'name', label: 'Competition', render: (r) => <TitleCell title={r.name} subtitle={r.level} image={r.cover_image_url} featured={r.is_featured} /> },
    {
      key: 'start_date',
      label: 'Dates',
      render: (r) => <span className="whitespace-nowrap text-muted">{formatDateRange(r.start_date as string | null, r.end_date as string | null)}</span>,
    },
    { key: 'location', label: 'Location', render: (r) => textCell(r.location) },
    { key: 'status', label: 'Status', render: (r) => (r.is_archived ? <StatusPill status="archived" /> : <StatusPill status={r.status} />) },
  ],
}

// ------------------------------------------------------------------- athletes
const athletes: ResourceConfig = {
  key: 'athletes',
  table: 'athletes',
  singular: 'Athlete',
  plural: 'Athletes',
  description: 'Athlete profiles with biography, medal tally and achievements.',
  icon: UserRound,
  titleField: 'name',
  searchColumns: ['name', 'country', 'category'],
  defaultOrder: [{ column: 'name' }],
  statusField: 'status',
  statusOptions: contentStatus,
  archive: contentArchive,
  publicPath: (r) => (r.status === 'published' ? `/athletes/${r.slug}` : null),
  defaults: { status: 'draft', is_featured: false, gold_count: 0, silver_count: 0, bronze_count: 0, achievements: [] },
  fields: [
    { section: 'Profile', name: 'name', label: 'Full name', type: 'text', required: true, maxLength: 120 },
    { name: 'slug', label: 'URL slug', type: 'slug', slugFrom: 'name' },
    { name: 'photo_url', label: 'Profile photo', type: 'image', bucket: 'athlete-images', full: true },
    { name: 'country', label: 'Country', type: 'text' },
    { name: 'gender', label: 'Gender', type: 'select', options: genderOptions },
    { name: 'category', label: 'Primary category', type: 'text', placeholder: 'e.g. Individual Kata' },
    statusField(),
    featuredField,
    { name: 'biography', label: 'Biography', type: 'textarea', full: true },
    { section: 'Career highlights', name: 'gold_count', label: 'Gold medals', type: 'number', required: true },
    { name: 'silver_count', label: 'Silver medals', type: 'number', required: true },
    { name: 'bronze_count', label: 'Bronze medals', type: 'number', required: true },
    { name: 'achievements', label: 'Achievements', type: 'tags', full: true, placeholder: 'Add an achievement and press Enter' },
  ],
  columns: [
    { key: 'name', label: 'Athlete', render: (r) => <TitleCell title={r.name} subtitle={r.category} image={r.photo_url} featured={r.is_featured} square /> },
    { key: 'country', label: 'Country', render: (r) => textCell(r.country) },
    {
      key: 'medals',
      label: 'G / S / B',
      render: (r) => <span className="text-muted tabular-nums">{`${r.gold_count} / ${r.silver_count} / ${r.bronze_count}`}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

// ------------------------------------------------------------------ champions
const champions: ResourceConfig = {
  key: 'champions',
  table: 'champions',
  singular: 'Champion',
  plural: 'Champions',
  description: 'Winners and results. Link each to a competition and, optionally, an athlete profile.',
  icon: Medal,
  titleField: 'name',
  searchColumns: ['name', 'category', 'country'],
  defaultOrder: [{ column: 'year', ascending: false }, { column: 'position' }],
  statusField: 'status',
  statusOptions: contentStatus,
  archive: contentArchive,
  defaults: { status: 'draft', is_featured: false, year: String(new Date().getFullYear()), position: '1', medal: 'gold' },
  autofill: {
    athlete_id: (a) => ({ name: a.name, photo_url: a.photo_url, country: a.country, gender: a.gender, category: a.category }),
  },
  fields: [
    { section: 'Result', name: 'competition_id', label: 'Competition', type: 'relation', relation: 'competitions' },
    {
      name: 'athlete_id',
      label: 'Athlete profile',
      type: 'relation',
      relation: 'athletes',
      help: 'Optional. Picking an athlete fills in the empty fields below.',
    },
    { name: 'name', label: 'Champion name', type: 'text', required: true },
    { name: 'photo_url', label: 'Photo', type: 'image', bucket: 'athlete-images', full: true },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Kumite -60kg' },
    { name: 'age_group', label: 'Age group', type: 'text', placeholder: 'e.g. Under-18' },
    { name: 'gender', label: 'Gender', type: 'select', options: genderOptions },
    { name: 'country', label: 'Country', type: 'text' },
    { name: 'position', label: 'Position', type: 'number', help: '1 = first place' },
    { name: 'medal', label: 'Medal', type: 'select', options: medalOptions },
    { name: 'year', label: 'Year', type: 'year' },
    statusField(),
    featuredField,
    { section: 'Story', name: 'achievements', label: 'Achievements', type: 'textarea', full: true },
    { name: 'biography', label: 'Biography', type: 'textarea', full: true },
  ],
  columns: [
    {
      key: 'name',
      label: 'Champion',
      render: (r) => (
        <TitleCell title={r.name} subtitle={[r.category, r.age_group].filter(Boolean).join(' · ')} image={r.photo_url} featured={r.is_featured} square />
      ),
    },
    { key: 'medal', label: 'Medal', render: (r) => textCell(r.medal ? titleCase(String(r.medal)) : null) },
    { key: 'year', label: 'Year', render: (r) => textCell(r.year) },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

// -------------------------------------------------------------- world records
const worldRecords: ResourceConfig = {
  key: 'world-records',
  table: 'world_records',
  singular: 'World Record',
  plural: 'World Records',
  description: 'Only records documented and verified by Arjuna Book of World Record, with the recognising organisation and evidence.',
  icon: Trophy,
  titleField: 'title',
  searchColumns: ['title', 'holder_name', 'location'],
  defaultOrder: [{ column: 'record_date', ascending: false }],
  statusField: 'status',
  statusOptions: contentStatus,
  archive: contentArchive,
  publicPath: (r) => (r.status === 'published' ? `/world-records/${r.slug}` : null),
  defaults: { status: 'draft', is_featured: false, images: [], documents: [] },
  autofill: { athlete_id: (a) => ({ holder_name: a.name }) },
  fields: [
    { section: 'Record', name: 'title', label: 'Record title', type: 'text', required: true, full: true },
    { name: 'slug', label: 'URL slug', type: 'slug', slugFrom: 'title' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'athlete_id', label: 'Athlete profile', type: 'relation', relation: 'athletes' },
    { name: 'holder_name', label: 'Record holder (as displayed)', type: 'text', required: true },
    { name: 'record_date', label: 'Date', type: 'date' },
    { name: 'location', label: 'Location', type: 'text' },
    {
      name: 'recognition_org',
      label: 'Recognition organisation',
      type: 'text',
      required: true,
      full: true,
      help: 'The body that officially recognised this record.',
    },
    statusField('Publish only once the record and its evidence are verified.'),
    featuredField,
    { name: 'cover_image_url', label: 'Cover image', type: 'image', bucket: 'record-images', full: true },
    { section: 'Story', name: 'description', label: 'Short description', type: 'textarea', full: true, maxLength: 400 },
    { name: 'story', label: 'Achievement story', type: 'textarea', full: true },
    {
      section: 'Evidence & media',
      name: 'certificate_url',
      label: 'Record certificate',
      type: 'file',
      bucket: 'documents',
      accept: 'application/pdf,image/*',
      full: true,
    },
    { name: 'documents', label: 'Supporting documents', type: 'documents', bucket: 'documents', full: true },
    { name: 'images', label: 'Images', type: 'images', bucket: 'record-images', full: true },
    { name: 'video_url', label: 'Video URL', type: 'url', full: true, help: 'YouTube link or a direct video file URL.' },
  ],
  columns: [
    { key: 'title', label: 'Record', render: (r) => <TitleCell title={r.title} subtitle={r.holder_name} image={r.cover_image_url} featured={r.is_featured} /> },
    { key: 'record_date', label: 'Date', render: (r) => dateCell(r.record_date) },
    { key: 'recognition_org', label: 'Recognised by', render: (r) => textCell(r.recognition_org) },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

// --------------------------------------------------------------------- awards
const awards: ResourceConfig = {
  key: 'awards',
  table: 'awards',
  singular: 'Award',
  plural: 'Awards',
  description: 'Organisation awards, athlete awards and special or international recognition.',
  icon: Award,
  titleField: 'name',
  searchColumns: ['name', 'recipient'],
  defaultOrder: [{ column: 'year', ascending: false }],
  statusField: 'status',
  statusOptions: contentStatus,
  archive: contentArchive,
  defaults: { status: 'draft', is_featured: false, category: 'special', year: String(new Date().getFullYear()) },
  fields: [
    { name: 'name', label: 'Award name', type: 'text', required: true, full: true },
    { name: 'recipient', label: 'Recipient', type: 'text' },
    { name: 'year', label: 'Year', type: 'year' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'organization', label: 'Organisation Award' },
        { value: 'athlete', label: 'Athlete Award' },
        { value: 'championship', label: 'Championship Achievement' },
        { value: 'special', label: 'Special Recognition' },
        { value: 'international', label: 'International Recognition' },
      ],
    },
    { name: 'competition_id', label: 'Related competition', type: 'relation', relation: 'competitions' },
    statusField(),
    featuredField,
    { name: 'image_url', label: 'Image', type: 'image', bucket: 'award-images', full: true },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
  ],
  columns: [
    { key: 'name', label: 'Award', render: (r) => <TitleCell title={r.name} subtitle={r.recipient} image={r.image_url} featured={r.is_featured} square /> },
    { key: 'category', label: 'Category', render: (r) => textCell(titleCase(String(r.category))) },
    { key: 'year', label: 'Year', render: (r) => textCell(r.year) },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

// -------------------------------------------------------------------- gallery
export const galleryCategoryOptions: Option[] = [
  { value: 'competitions', label: 'Competitions' },
  { value: 'champions', label: 'Champions' },
  { value: 'awards', label: 'Awards' },
  { value: 'world-records', label: 'World Records' },
  { value: 'events', label: 'Events' },
]

const gallery: ResourceConfig = {
  key: 'gallery',
  table: 'gallery',
  singular: 'Gallery item',
  plural: 'Gallery',
  description: 'Photos and videos. Use bulk upload to add many images at once; use the arrows to reorder.',
  icon: Images,
  titleField: 'caption',
  searchColumns: ['caption', 'album'],
  defaultOrder: [{ column: 'sort_order' }, { column: 'created_at', ascending: false }],
  statusField: 'status',
  statusOptions: contentStatus,
  archive: contentArchive,
  reorderable: true,
  defaults: { status: 'published', media_type: 'image', category: 'events', sort_order: '0' },
  fields: [
    {
      name: 'media_type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video file' },
        { value: 'youtube', label: 'YouTube video' },
      ],
    },
    { name: 'category', label: 'Category', type: 'select', required: true, options: galleryCategoryOptions },
    {
      name: 'url',
      label: 'Image / video',
      type: 'image',
      bucket: 'gallery',
      accept: 'image/*,video/mp4,video/webm',
      required: true,
      full: true,
      help: 'For YouTube, paste the video link instead of uploading.',
    },
    { name: 'thumbnail_url', label: 'Thumbnail (videos)', type: 'image', bucket: 'gallery', full: true },
    { name: 'caption', label: 'Caption', type: 'text', full: true },
    { name: 'alt', label: 'Alt text', type: 'text', full: true, help: 'Describe the image for visitors using screen readers.' },
    { name: 'competition_id', label: 'Event', type: 'relation', relation: 'competitions' },
    { name: 'album', label: 'Album', type: 'text' },
    { name: 'sort_order', label: 'Sort order', type: 'number', help: 'Lower numbers appear first.' },
    statusField(),
  ],
  columns: [
    {
      key: 'caption',
      label: 'Item',
      render: (r) => (
        <TitleCell
          title={r.caption || 'Untitled'}
          subtitle={titleCase(String(r.media_type))}
          image={r.thumbnail_url || (r.media_type === 'image' ? r.url : null)}
        />
      ),
    },
    { key: 'category', label: 'Category', render: (r) => textCell(titleCase(String(r.category))) },
    { key: 'sort_order', label: 'Order', render: (r) => textCell(r.sort_order) },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

// ----------------------------------------------------------------------- news
const news: ResourceConfig = {
  key: 'news',
  table: 'news',
  singular: 'Article',
  plural: 'News',
  description: 'News articles, announcements and stories.',
  icon: Newspaper,
  titleField: 'title',
  searchColumns: ['title', 'excerpt'],
  defaultOrder: [{ column: 'publish_date', ascending: false }],
  statusField: 'status',
  statusOptions: contentStatus,
  archive: contentArchive,
  publicPath: (r) => (r.status === 'published' ? `/news/${r.slug}` : null),
  defaults: { status: 'draft', publish_date: new Date().toISOString() },
  fields: [
    { section: 'Article', name: 'title', label: 'Title', type: 'text', required: true, full: true, maxLength: 200 },
    { name: 'slug', label: 'URL slug', type: 'slug', slugFrom: 'title' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'Announcements, Results…' },
    { name: 'author', label: 'Author', type: 'text' },
    { name: 'publish_date', label: 'Publish date', type: 'datetime', required: true, help: 'Future dates stay hidden until then.' },
    statusField(),
    { name: 'cover_image_url', label: 'Cover image', type: 'image', bucket: 'news', full: true },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true, maxLength: 300 },
    { name: 'content', label: 'Content', type: 'markdown', full: true },
    { section: 'Search engines (optional)', name: 'seo_title', label: 'SEO title', type: 'text', full: true, maxLength: 70 },
    { name: 'seo_description', label: 'SEO description', type: 'textarea', full: true, maxLength: 160 },
  ],
  columns: [
    { key: 'title', label: 'Article', render: (r) => <TitleCell title={r.title} subtitle={r.category} image={r.cover_image_url} /> },
    { key: 'publish_date', label: 'Publish date', render: (r) => dateCell(r.publish_date) },
    { key: 'author', label: 'Author', render: (r) => textCell(r.author) },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

// --------------------------------------------------------------- certificates
const certificates: ResourceConfig = {
  key: 'certificates',
  table: 'certificates',
  singular: 'Certificate',
  plural: 'Certificates',
  description: 'Issued certificates. Only “valid” certificates pass public verification.',
  icon: BadgeCheck,
  titleField: 'certificate_number',
  searchColumns: ['certificate_number', 'holder_name'],
  defaultOrder: [{ column: 'issue_date', ascending: false }],
  statusField: 'status',
  statusOptions: opts('valid', 'revoked', 'archived'),
  archive: { field: 'status', value: 'archived', restore: 'valid' },
  defaults: { status: 'valid' },
  fields: [
    {
      name: 'certificate_number',
      label: 'Certificate ID',
      type: 'text',
      required: true,
      maxLength: 40,
      help: 'Letters, numbers, hyphens and slashes. Stored in upper case.',
    },
    { name: 'holder_name', label: 'Holder name', type: 'text', required: true },
    { name: 'competition_id', label: 'Competition', type: 'relation', relation: 'competitions' },
    { name: 'competition_name', label: 'Competition name (if not listed)', type: 'text' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'award', label: 'Award', type: 'text', placeholder: 'e.g. Gold Medal' },
    { name: 'issue_date', label: 'Issue date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: opts('valid', 'revoked', 'archived') },
    {
      name: 'document_url',
      label: 'Certificate document',
      type: 'file',
      bucket: 'certificates',
      accept: 'application/pdf,image/*',
      full: true,
      help: 'Stored privately — only admins can open it.',
    },
  ],
  validate: (v) =>
    v.certificate_number && !/^[A-Za-z0-9][A-Za-z0-9\-/]*$/.test(String(v.certificate_number))
      ? { certificate_number: 'Use only letters, numbers, hyphens and slashes' }
      : null,
  beforeSave: (v) => ({ ...v, certificate_number: String(v.certificate_number).trim().toUpperCase() }),
  columns: [
    { key: 'certificate_number', label: 'Certificate', render: (r) => <TitleCell title={r.certificate_number} subtitle={r.holder_name} /> },
    { key: 'award', label: 'Award', render: (r) => textCell(r.award) },
    { key: 'issue_date', label: 'Issued', render: (r) => dateCell(r.issue_date) },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

// ----------------------------------------------------------- about: timeline
const milestones: ResourceConfig = {
  key: 'milestones',
  table: 'milestones',
  singular: 'Milestone',
  plural: 'Timeline',
  description: 'Milestones shown on the About page timeline.',
  icon: Flag,
  titleField: 'title',
  searchColumns: ['title'],
  defaultOrder: [{ column: 'year' }, { column: 'sort_order' }],
  statusField: 'status',
  statusOptions: contentStatus,
  archive: contentArchive,
  defaults: { status: 'published', kind: 'milestone', sort_order: '0' },
  fields: [
    { name: 'year', label: 'Year', type: 'year', required: true },
    { name: 'kind', label: 'Type', type: 'select', required: true, options: opts('milestone', 'championship', 'recognition', 'world-record', 'international') },
    { name: 'title', label: 'Title', type: 'text', required: true, full: true },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
    { name: 'sort_order', label: 'Order within year', type: 'number' },
    statusField(),
  ],
  columns: [
    { key: 'year', label: 'Year', render: (r) => <span className="font-semibold tabular-nums">{String(r.year)}</span> },
    { key: 'title', label: 'Milestone', render: (r) => <TitleCell title={r.title} subtitle={titleCase(String(r.kind))} /> },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

const officials: ResourceConfig = {
  key: 'officials',
  table: 'officials',
  singular: 'Official',
  plural: 'Officials',
  description: 'Leadership and officials shown on the About page (hidden when empty).',
  icon: UsersRound,
  titleField: 'name',
  searchColumns: ['name', 'role'],
  defaultOrder: [{ column: 'sort_order' }],
  statusField: 'status',
  statusOptions: contentStatus,
  archive: contentArchive,
  reorderable: true,
  defaults: { status: 'published', sort_order: '0' },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'role', label: 'Role / title', type: 'text', required: true },
    { name: 'photo_url', label: 'Photo', type: 'image', bucket: 'site-assets', full: true },
    { name: 'bio', label: 'Short bio', type: 'textarea', full: true },
    { name: 'sort_order', label: 'Order', type: 'number' },
    statusField(),
  ],
  columns: [
    { key: 'name', label: 'Name', render: (r) => <TitleCell title={r.name} subtitle={r.role} image={r.photo_url} square /> },
    { key: 'sort_order', label: 'Order', render: (r) => textCell(r.sort_order) },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ],
}

export const resources: Record<string, ResourceConfig> = Object.fromEntries(
  [competitions, champions, athletes, worldRecords, awards, gallery, news, certificates, milestones, officials].map((r) => [r.key, r]),
)

export const rowTitle = (config: ResourceConfig, row: Row) => String(row[config.titleField] ?? '') || `Untitled ${config.singular.toLowerCase()}`
