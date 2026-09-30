-- Minimal seed: creates the settings row so the site renders.
-- Every value below is a PLACEHOLDER. Replace it from Admin -> Site Settings.
-- No competitions, champions, records or awards are seeded: add real Arjuna Book of World Record data through the admin panel.
insert into public.site_settings (id, org_name, phone, tagline, footer_text, seo_title, seo_description, about_summary, stats, core_values)
values (
  1,
  'Arjuna Book of World Record',
  '94881 46504, 94886 64045',
  'Karate championships, recognition and achievement.',
  '[PLACEHOLDER] Footer text - update in Admin > Site Settings.',
  'Arjuna Book of World Record | Karate Championships, Champions & Recognition',
  'Arjuna Book of World Record celebrates Karate excellence through competitions, championships, recognition, achievements and extraordinary sporting accomplishments.',
  '[PLACEHOLDER] Short introduction to Arjuna Book of World Record - update in Admin > Site Settings.',
  '[]'::jsonb,
  '[{"title":"Discipline","description":""},{"title":"Integrity","description":""},{"title":"Excellence","description":""},{"title":"Respect","description":""},{"title":"Recognition","description":""},{"title":"Unity","description":""}]'::jsonb
)
on conflict (id) do nothing;

-- Make yourself an admin (run once after creating your user in Authentication > Users):
-- insert into public.admins (user_id, email, full_name)
-- select id, email, 'Your Name' from auth.users where email = 'you@example.com';
