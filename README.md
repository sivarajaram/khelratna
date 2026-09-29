# Khelratna — Karate Championships, Recognition & Achievement

Public website + admin CMS for Khelratna, a Karate competition, awards and recognition organisation.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS 4 · React Router 7 · Framer Motion · Lucide · React Hook Form + Zod · Supabase (Postgres, Auth, Storage, RLS, one Edge Function)

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Without Supabase credentials the site runs in **demo mode**: a gold banner is shown, all content is clearly marked placeholder data stored in your browser, and the admin panel works at `/admin/login` with `admin@khelratna.demo` / `demo1234`. "Reset demo data" in the admin header restores the placeholders.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Typecheck, production build, then `dist/sitemap.xml` + `dist/robots.txt` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript only |
| `npm run format` | Prettier |

## Connecting Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/20260929000000_initial_schema.sql` in the SQL editor (or `supabase db push`). It creates all tables, RLS policies, storage buckets and storage policies.
3. Run `supabase/seed.sql` (creates the settings row with placeholder text only — no fake competitions, records or awards).
4. Create your first user in **Authentication › Users**, then make it an admin:
   ```sql
   insert into public.admins (user_id, email, full_name)
   select id, email, 'Your Name' from auth.users where email = 'you@example.com';
   ```
5. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_SITE_URL`.
6. Optional — to invite further admins from **Admin › Admin Users**, deploy the Edge Function:
   ```bash
   supabase functions deploy invite-admin
   ```
7. In **Authentication › URL Configuration**, add `https://your-domain/admin/login` as a redirect URL (used by password reset and invitations).

> Never put the `service_role` key in `.env` or any `VITE_` variable. The browser only uses the anon key; access is enforced by row level security. The service role key is used solely inside the `invite-admin` Edge Function, where Supabase provides it automatically.

## Security model

- **Visitors (anon):** read published content only (drafts, archived items and future-dated news are hidden by RLS), submit contact enquiries (insert-only), verify certificates through the `verify_certificate()` function, which returns only the fields needed to confirm authenticity. The certificates table itself is not publicly readable.
- **Admins:** a signed-in user with a row in `public.admins` (checked by the `is_admin()` security-definer function) can read and write everything. Every `/admin` route checks both the session and admin status.
- **Storage:** public-read buckets for images/documents; the `certificates` bucket is private (opened via short-lived signed URLs). Only admins can upload, replace or delete files.

## Project structure

```
src/
  admin/              Resource configs (fields, columns, validation) that drive the generic CMS
  components/
    common/           Button, Badge, Media, Modal, ConfirmDialog, Toast, FormField, FilterBar, SearchBar,
                      Pagination, States (loading/empty/error), Seo, Markdown, Reveal, …
    public/           Navbar, Footer, PageHero, cards, GalleryGrid + ImageLightbox, StatCounter
    admin/            DataTable, ResourceForm, upload inputs, BulkUploadDialog
  layouts/            PublicLayout, AdminLayout
  pages/public|admin/ One lazily loaded chunk per page
  services/           repository (Supabase or demo store), content queries, auth, storage, forms
  hooks/              useQuery (cached queries), useFilters (URL filter state), useAuth, useSiteSettings
supabase/             Migration, seed, invite-admin Edge Function
scripts/              Sitemap generator
```

Adding a field to a content type means updating the migration, `src/types/database.ts`, and the resource config in `src/admin/resources.tsx`. The admin form, validation and table follow from the config.

## Content rules

All names, dates, numbers, records and awards in demo mode are **placeholders**. Real content — especially world records and their recognising organisations, statistics, history and leadership — must come from Khelratna and is entered through the admin panel. The privacy policy and terms pages carry placeholder text that Khelratna must replace.

## Deployment

Any static host works. SPA fallbacks are included for Vercel (`vercel.json`) and Netlify (`public/_redirects`). Set the three `VITE_` environment variables in the host before building.
