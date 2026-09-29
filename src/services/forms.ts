import { supabase } from '@/lib/supabase'
import type { Certificate, CertificateVerification, Enquiry } from '@/types/database'
import { AppError } from './errors'
import { getCompetitionIndex } from './content'
import { localDb } from './localDb'
import { repo } from './repository'

export type EnquiryInput = Pick<Enquiry, 'name' | 'email' | 'subject' | 'message'> & { phone?: string | null }

export async function submitEnquiry(input: EnquiryInput): Promise<void> {
  const row = { ...input, phone: input.phone || null, status: 'new' as const }
  if (!supabase) {
    await repo('enquiries').insert(row)
    return
  }
  // Insert without reading the row back: visitors are not allowed to select enquiries.
  const { error } = await supabase.from('enquiries').insert(row)
  if (error) throw AppError.from(error)
}

export async function verifyCertificate(certificateNumber: string): Promise<CertificateVerification | null> {
  const number = certificateNumber.trim()
  if (supabase) {
    const { data, error } = await supabase.rpc('verify_certificate', { p_number: number })
    if (error) throw AppError.from(error)
    return ((data as CertificateVerification[] | null) ?? [])[0] ?? null
  }
  const cert = (localDb.table('certificates') as unknown as Certificate[]).find(
    (c) => c.certificate_number.toUpperCase() === number.toUpperCase() && c.status === 'valid',
  )
  if (!cert) return null
  const comps = await getCompetitionIndex()
  return {
    certificate_number: cert.certificate_number,
    holder_name: cert.holder_name,
    competition: comps.find((c) => c.id === cert.competition_id)?.name ?? cert.competition_name,
    category: cert.category,
    award: cert.award,
    issue_date: cert.issue_date,
  }
}

export async function inviteAdmin(email: string, fullName: string): Promise<void> {
  if (!supabase) {
    await repo('admins').insert({ user_id: crypto.randomUUID(), email, full_name: fullName || null, role: 'admin' })
    return
  }
  const { data, error } = await supabase.functions.invoke('invite-admin', {
    body: { email, full_name: fullName || null, redirect_to: `${window.location.origin}/admin/login?reset=1` },
  })
  const message = (data as { error?: string } | null)?.error
  if (error || message) {
    throw new AppError(message ?? 'Could not send the invitation. Is the invite-admin function deployed?', 'invite', error)
  }
}
