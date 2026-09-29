-- Minimal seed: creates the settings row so the site renders.
-- Every value below is a PLACEHOLDER. Replace it from Admin -> Site Settings.
-- No competitions, champions, records or awards are seeded: add real Khelratna data through the admin panel.
insert into public.site_settings (id, org_name, tagline, footer_text, seo_title, seo_description, about_summary, stats, core_values)
values (
  1,
  'Khelratna',
  'Karate championships, recognition and achievement.',
  '[PLACEHOLDER] Footer text - update in Admin > Site Settings.',
  'Khelratna | Karate Championships, Champions & Recognition',
  'Khelratna celebrates Karate excellence through competitions, championships, recognition, achievements and extraordinary sporting accomplishments.',
  '[PLACEHOLDER] Short introduction to Khelratna - update in Admin > Site Settings.',
  '[]'::jsonb,
  '[{"title":"Discipline","description":""},{"title":"Integrity","description":""},{"title":"Excellence","description":""},{"title":"Respect","description":""},{"title":"Recognition","description":""},{"title":"Unity","description":""}]'::jsonb
)
on conflict (id) do nothing;

-- Make yourself an admin (run once after creating your user in Authentication > Users):
-- insert into public.admins (user_id, email, full_name)
-- select id, email, 'Your Name' from auth.users where email = 'you@example.com';
