// Supabase Edge Function: invite-admin
// Creating auth users needs the service_role key, which must never reach the browser,
// so this is the one operation that runs server-side.
//
// Deploy:  supabase functions deploy invite-admin
// The function verifies the caller's JWT and checks they are already an admin.
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Identify the caller with their own token and confirm they are an admin
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: isAdmin, error: adminErr } = await caller.rpc('is_admin')
  if (adminErr || !isAdmin) return json({ error: 'Not authorised' }, 403)

  let payload: { email?: string; full_name?: string; redirect_to?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }
  const email = payload.email?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'A valid email is required' }, 400)

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: payload.redirect_to,
  })
  if (inviteErr || !invited.user) return json({ error: inviteErr?.message ?? 'Invite failed' }, 400)

  const { error: insertErr } = await admin
    .from('admins')
    .upsert({ user_id: invited.user.id, email, full_name: payload.full_name ?? null })
  if (insertErr) return json({ error: 'User invited but could not be granted admin access' }, 500)

  return json({ ok: true, user_id: invited.user.id })
})
