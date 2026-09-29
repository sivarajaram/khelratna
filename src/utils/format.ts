const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const longDateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

function parse(value: string): Date | null {
  // Plain dates (YYYY-MM-DD) are treated as local calendar dates, not UTC midnight
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(value: string | null | undefined, long = false): string {
  if (!value) return ''
  const d = parse(value)
  return d ? (long ? longDateFmt : dateFmt).format(d) : ''
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Date to be announced'
  if (!end || end === start) return formatDate(start, true)
  const s = parse(start)
  const e = parse(end)
  if (!s || !e) return formatDate(start, true)
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${longDateFmt.format(e)}`
  }
  return `${formatDate(start)} – ${formatDate(end)}`
}

export function yearOf(value: string | null | undefined): number | null {
  if (!value) return null
  const d = parse(value)
  return d ? d.getFullYear() : null
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function truncate(text: string | null | undefined, max: number): string {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

export function titleCase(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/** Extracts the video id from common YouTube URL shapes. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  return m ? m[1] : null
}
