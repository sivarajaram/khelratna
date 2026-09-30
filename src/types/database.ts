// Row types mirroring supabase/migrations/*_initial_schema.sql

export type ContentStatus = 'draft' | 'published' | 'archived'
export type CompetitionStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type Medal = 'gold' | 'silver' | 'bronze'
export type Gender = 'male' | 'female'
export type AwardCategory = 'organization' | 'athlete' | 'championship' | 'special' | 'international'
export type GalleryCategory = 'competitions' | 'champions' | 'awards' | 'world-records' | 'events'
export type EnquiryStatus = 'new' | 'read' | 'responded' | 'archived'
export type CertificateStatus = 'valid' | 'revoked' | 'archived'
export type SocialPlatform = 'instagram' | 'facebook' | 'youtube' | 'x' | 'linkedin' | 'whatsapp' | 'website'
export type MilestoneKind = 'milestone' | 'championship' | 'recognition' | 'world-record' | 'international'

export interface DocumentLink {
  name: string
  url: string
}

export interface StatItem {
  label: string
  value: number
  suffix?: string
}

export interface CoreValue {
  title: string
  description?: string
}

interface Timestamps {
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: 1
  org_name: string
  tagline: string | null
  logo_url: string | null
  favicon_url: string | null
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
  map_embed_url: string | null
  footer_text: string | null
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  hero_image_url: string | null
  about_image_url: string | null
  about_summary: string | null
  about_story: string | null
  mission: string | null
  vision: string | null
  core_values: CoreValue[]
  stats: StatItem[]
  updated_at: string
}

export interface SocialLink {
  id: string
  platform: SocialPlatform
  url: string
  sort_order: number
  created_at: string
}

export interface Milestone extends Timestamps {
  id: string
  year: number
  title: string
  description: string | null
  kind: MilestoneKind
  sort_order: number
  status: ContentStatus
}

export interface Official extends Timestamps {
  id: string
  name: string
  role: string
  photo_url: string | null
  bio: string | null
  sort_order: number
  status: ContentStatus
}

export interface Competition extends Timestamps {
  id: string
  slug: string
  name: string
  level: string | null
  cover_image_url: string | null
  start_date: string | null
  end_date: string | null
  venue: string | null
  location: string | null
  organizer: string | null
  status: CompetitionStatus
  is_archived: boolean
  is_featured: boolean
  short_description: string | null
  description: string | null
  categories: string[]
  participant_count: number | null
  countries_count: number | null
  awards_info: string | null
  results_summary: string | null
  documents: DocumentLink[]
}

export interface Athlete extends Timestamps {
  id: string
  slug: string
  name: string
  photo_url: string | null
  country: string | null
  gender: Gender | null
  category: string | null
  biography: string | null
  gold_count: number
  silver_count: number
  bronze_count: number
  achievements: string[]
  is_featured: boolean
  status: ContentStatus
}

export interface Champion extends Timestamps {
  id: string
  name: string
  athlete_id: string | null
  competition_id: string | null
  photo_url: string | null
  country: string | null
  category: string | null
  age_group: string | null
  gender: Gender | null
  position: number | null
  medal: Medal | null
  year: number | null
  achievements: string | null
  biography: string | null
  is_featured: boolean
  status: ContentStatus
}

export interface WorldRecord extends Timestamps {
  id: string
  slug: string
  title: string
  description: string | null
  story: string | null
  athlete_id: string | null
  holder_name: string | null
  record_date: string | null
  location: string | null
  category: string | null
  recognition_org: string | null
  cover_image_url: string | null
  images: string[]
  video_url: string | null
  certificate_url: string | null
  documents: DocumentLink[]
  is_featured: boolean
  status: ContentStatus
}

export interface Award extends Timestamps {
  id: string
  name: string
  recipient: string | null
  year: number | null
  category: AwardCategory
  description: string | null
  image_url: string | null
  competition_id: string | null
  is_featured: boolean
  status: ContentStatus
}

export interface GalleryItem extends Timestamps {
  id: string
  media_type: 'image' | 'video' | 'youtube'
  url: string
  thumbnail_url: string | null
  caption: string | null
  alt: string | null
  category: GalleryCategory
  competition_id: string | null
  album: string | null
  sort_order: number
  status: ContentStatus
}

export interface NewsArticle extends Timestamps {
  id: string
  slug: string
  title: string
  category: string | null
  cover_image_url: string | null
  excerpt: string | null
  content: string | null
  author: string | null
  publish_date: string
  seo_title: string | null
  seo_description: string | null
  status: ContentStatus
}

export interface Certificate extends Timestamps {
  id: string
  certificate_number: string
  holder_name: string
  competition_id: string | null
  competition_name: string | null
  category: string | null
  award: string | null
  issue_date: string | null
  document_url: string | null
  status: CertificateStatus
}

export interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: EnquiryStatus
  created_at: string
  updated_at: string
}

export interface AdminUser {
  user_id: string
  email: string
  full_name: string | null
  role: 'admin' | 'editor'
  created_at: string
}

export interface CertificateVerification {
  certificate_number: string
  holder_name: string
  competition: string | null
  category: string | null
  award: string | null
  issue_date: string | null
}

export interface TableMap {
  site_settings: SiteSettings
  social_links: SocialLink
  milestones: Milestone
  officials: Official
  competitions: Competition
  athletes: Athlete
  champions: Champion
  world_records: WorldRecord
  awards: Award
  gallery: GalleryItem
  news: NewsArticle
  certificates: Certificate
  enquiries: Enquiry
  admins: AdminUser
}

export type TableName = keyof TableMap
