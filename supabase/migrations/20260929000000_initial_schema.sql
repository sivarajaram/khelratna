-- =====================================================================
-- KHELRATNA — initial schema
-- Tables, row level security, storage buckets and storage policies.
--
-- Access model
--   * anon / public visitors  : read published public content only,
--                                insert contact enquiries,
--                                verify a certificate through verify_certificate().
--   * admins (rows in public.admins) : full read/write on everything.
--   * service_role (Edge Functions only, never the browser) : bypasses RLS.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- security definer so policies can call it without recursive RLS checks
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Site settings (singleton row id = 1) and social links
-- ---------------------------------------------------------------------
create table public.site_settings (
  id               int primary key default 1 check (id = 1),
  org_name         text not null default 'Khelratna',
  tagline          text,
  logo_url         text,
  favicon_url      text,
  phone            text,
  email            text,
  whatsapp         text,
  address          text,
  map_embed_url    text,
  footer_text      text,
  seo_title        text,
  seo_description  text,
  og_image_url     text,
  hero_image_url   text,
  about_image_url  text,
  about_summary    text,
  about_story      text,
  mission          text,
  vision           text,
  core_values      jsonb not null default '[]'::jsonb,  -- [{ "title": "", "description": "" }]
  stats            jsonb not null default '[]'::jsonb,  -- [{ "label": "", "value": 10, "suffix": "+" }]
  updated_at       timestamptz not null default now()
);

create table public.social_links (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null check (platform in ('instagram','facebook','youtube','x','linkedin','whatsapp','website')),
  url         text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- About page: timeline milestones and officials
-- ---------------------------------------------------------------------
create table public.milestones (
  id          uuid primary key default gen_random_uuid(),
  year        int not null,
  title       text not null,
  description text,
  kind        text not null default 'milestone'
              check (kind in ('milestone','championship','recognition','world-record','international')),
  sort_order  int not null default 0,
  status      text not null default 'published' check (status in ('draft','published','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.officials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  photo_url   text,
  bio         text,
  sort_order  int not null default 0,
  status      text not null default 'published' check (status in ('draft','published','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Competitions
-- ---------------------------------------------------------------------
create table public.competitions (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  level              text,                         -- e.g. National / International / Open / State
  cover_image_url    text,
  start_date         date,
  end_date           date,
  venue              text,
  location           text,
  organizer          text,
  status             text not null default 'draft'
                     check (status in ('draft','upcoming','ongoing','completed','cancelled')),
  is_archived        boolean not null default false,
  is_featured        boolean not null default false,
  short_description  text,
  description        text,
  categories         text[] not null default '{}',
  participant_count  int,
  countries_count    int,
  awards_info        text,
  results_summary    text,
  documents          jsonb not null default '[]'::jsonb, -- [{ "name": "", "url": "" }]
  registration_url   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint competitions_dates_check check (end_date is null or start_date is null or end_date >= start_date)
);
create index competitions_start_date_idx on public.competitions (start_date desc);
create index competitions_status_idx on public.competitions (status);

-- ---------------------------------------------------------------------
-- Athletes
-- ---------------------------------------------------------------------
create table public.athletes (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  photo_url     text,
  country       text,
  gender        text check (gender in ('male','female')),
  category      text,
  biography     text,
  gold_count    int not null default 0,
  silver_count  int not null default 0,
  bronze_count  int not null default 0,
  achievements  text[] not null default '{}',
  is_featured   boolean not null default false,
  status        text not null default 'draft' check (status in ('draft','published','archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Champions (= competition results / winners)
-- Competition -> Champions (results) -> Athletes
-- ---------------------------------------------------------------------
create table public.champions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  athlete_id      uuid references public.athletes (id) on delete set null,
  competition_id  uuid references public.competitions (id) on delete set null,
  photo_url       text,
  country         text,
  category        text,
  age_group       text,
  gender          text check (gender in ('male','female')),
  position        int check (position between 1 and 10),
  medal           text check (medal in ('gold','silver','bronze')),
  year            int,
  achievements    text,
  biography       text,
  is_featured     boolean not null default false,
  status          text not null default 'draft' check (status in ('draft','published','archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index champions_competition_idx on public.champions (competition_id);
create index champions_athlete_idx on public.champions (athlete_id);
create index champions_year_idx on public.champions (year desc);

-- ---------------------------------------------------------------------
-- World records (only records supplied and verified by Khelratna)
-- ---------------------------------------------------------------------
create table public.world_records (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  description       text,
  story             text,
  athlete_id        uuid references public.athletes (id) on delete set null,
  holder_name       text,
  record_date       date,
  location          text,
  category          text,
  recognition_org   text,
  cover_image_url   text,
  images            text[] not null default '{}',
  video_url         text,
  certificate_url   text,
  documents         jsonb not null default '[]'::jsonb,
  is_featured       boolean not null default false,
  status            text not null default 'draft' check (status in ('draft','published','archived')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index world_records_athlete_idx on public.world_records (athlete_id);

-- ---------------------------------------------------------------------
-- Awards
-- ---------------------------------------------------------------------
create table public.awards (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  recipient       text,
  year            int,
  category        text not null default 'special'
                  check (category in ('organization','athlete','championship','special','international')),
  description     text,
  image_url       text,
  competition_id  uuid references public.competitions (id) on delete set null,
  is_featured     boolean not null default false,
  status          text not null default 'draft' check (status in ('draft','published','archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------
create table public.gallery (
  id              uuid primary key default gen_random_uuid(),
  media_type      text not null default 'image' check (media_type in ('image','video','youtube')),
  url             text not null,
  thumbnail_url   text,
  caption         text,
  alt             text,
  category        text not null default 'events'
                  check (category in ('competitions','champions','awards','world-records','events')),
  competition_id  uuid references public.competitions (id) on delete set null,
  album           text,
  sort_order      int not null default 0,
  status          text not null default 'published' check (status in ('draft','published','archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index gallery_category_idx on public.gallery (category);
create index gallery_competition_idx on public.gallery (competition_id);

-- ---------------------------------------------------------------------
-- News
-- ---------------------------------------------------------------------
create table public.news (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  category         text,
  cover_image_url  text,
  excerpt          text,
  content          text,          -- lightweight markdown
  author           text,
  publish_date     timestamptz not null default now(),
  seo_title        text,
  seo_description  text,
  status           text not null default 'draft' check (status in ('draft','published','archived')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index news_publish_idx on public.news (publish_date desc);

-- ---------------------------------------------------------------------
-- Certificates (never publicly listable; verified via RPC)
-- ---------------------------------------------------------------------
create table public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  certificate_number  text not null unique,
  holder_name         text not null,
  competition_id      uuid references public.competitions (id) on delete set null,
  competition_name    text,
  category            text,
  award               text,
  issue_date          date,
  document_url        text,
  status              text not null default 'valid' check (status in ('valid','revoked','archived')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Enquiries (contact form)
-- ---------------------------------------------------------------------
create table public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (char_length(email) <= 200),
  phone       text check (char_length(phone) <= 30),
  subject     text not null check (char_length(subject) between 2 and 200),
  message     text not null check (char_length(message) between 10 and 5000),
  status      text not null default 'new' check (status in ('new','read','responded','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['site_settings','milestones','officials','competitions','athletes','champions',
                           'world_records','awards','gallery','news','certificates','enquiries']
  loop
    execute format('create trigger %I_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- =====================================================================
-- Row level security
-- =====================================================================
alter table public.admins         enable row level security;
alter table public.site_settings  enable row level security;
alter table public.social_links   enable row level security;
alter table public.milestones     enable row level security;
alter table public.officials      enable row level security;
alter table public.competitions   enable row level security;
alter table public.athletes       enable row level security;
alter table public.champions      enable row level security;
alter table public.world_records  enable row level security;
alter table public.awards         enable row level security;
alter table public.gallery        enable row level security;
alter table public.news           enable row level security;
alter table public.certificates   enable row level security;
alter table public.enquiries      enable row level security;

-- Admin: full access to every content table
do $$
declare t text;
begin
  foreach t in array array['site_settings','social_links','milestones','officials','competitions','athletes',
                           'champions','world_records','awards','gallery','news','certificates','enquiries']
  loop
    execute format('create policy "admins manage %1$s" on public.%1$I for all to authenticated
                    using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Admins table: admins can see the list and remove others (not themselves).
-- New admins are added by the invite-admin Edge Function (service role).
create policy "admins read admins" on public.admins
  for select to authenticated using (public.is_admin());
create policy "admins remove other admins" on public.admins
  for delete to authenticated using (public.is_admin() and user_id <> auth.uid());

-- Public read policies (published content only)
create policy "public read settings"     on public.site_settings for select using (true);
create policy "public read social links" on public.social_links  for select using (true);
create policy "public read milestones"   on public.milestones    for select using (status = 'published');
create policy "public read officials"    on public.officials     for select using (status = 'published');
create policy "public read competitions" on public.competitions  for select using (status <> 'draft' and not is_archived);
create policy "public read athletes"     on public.athletes      for select using (status = 'published');
create policy "public read champions"    on public.champions     for select using (status = 'published');
create policy "public read records"      on public.world_records for select using (status = 'published');
create policy "public read awards"       on public.awards        for select using (status = 'published');
create policy "public read gallery"      on public.gallery       for select using (status = 'published');
create policy "public read news"         on public.news          for select using (status = 'published' and publish_date <= now());

-- Contact form: anyone may submit a new enquiry, nobody but admins may read it
create policy "public submit enquiries" on public.enquiries
  for insert to anon, authenticated with check (status = 'new');

-- Certificates: no public select policy. Verification goes through this function,
-- which returns only the fields needed to confirm authenticity.
create or replace function public.verify_certificate(p_number text)
returns table (
  certificate_number text,
  holder_name        text,
  competition        text,
  category           text,
  award              text,
  issue_date         date
)
language sql
stable
security definer
set search_path = public
as $$
  select c.certificate_number,
         c.holder_name,
         coalesce(comp.name, c.competition_name),
         c.category,
         c.award,
         c.issue_date
  from public.certificates c
  left join public.competitions comp on comp.id = c.competition_id
  where upper(c.certificate_number) = upper(trim(p_number))
    and c.status = 'valid'
  limit 1;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- =====================================================================
-- Storage
-- =====================================================================
insert into storage.buckets (id, name, public)
values
  ('site-assets',        'site-assets',        true),
  ('competition-images', 'competition-images', true),
  ('athlete-images',     'athlete-images',     true),
  ('record-images',      'record-images',      true),
  ('award-images',       'award-images',       true),
  ('gallery',            'gallery',            true),
  ('news',               'news',               true),
  ('documents',          'documents',          true),
  ('certificates',       'certificates',       false)  -- private: admin only
on conflict (id) do nothing;

-- Public buckets are readable by anyone
create policy "public read public buckets" on storage.objects
  for select using (
    bucket_id in ('site-assets','competition-images','athlete-images','record-images',
                  'award-images','gallery','news','documents')
  );

-- Admins manage every Khelratna bucket, including the private certificates bucket
create policy "admins read all buckets" on storage.objects
  for select to authenticated using (public.is_admin());
create policy "admins upload" on storage.objects
  for insert to authenticated with check (public.is_admin());
create policy "admins update" on storage.objects
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete" on storage.objects
  for delete to authenticated using (public.is_admin());
