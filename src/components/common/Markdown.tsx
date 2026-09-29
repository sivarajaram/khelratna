import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router'

// Lightweight, safe markdown for admin-authored content (news, stories).
// Supports: ## / ### headings, paragraphs, - lists, 1. lists, > quotes, --- rules,
// ![alt](url) images, **bold**, *italic*, [links](url). Output is React elements only;
// raw HTML is never interpreted.

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i
const safeUrl = (url: string) => (SAFE_URL.test(url.trim()) ? url.trim() : '#')

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyPrefix}-${i++}`
    if (m[2]) out.push(<strong key={key}>{m[2]}</strong>)
    else if (m[3]) out.push(<em key={key}>{m[3]}</em>)
    else if (m[4]) {
      const href = safeUrl(m[5])
      out.push(
        href.startsWith('/') ? (
          <Link key={key} to={href}>
            {m[4]}
          </Link>
        ) : (
          <a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
            {m[4]}
          </a>
        ),
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source, className }: { source: string | null | undefined; className?: string }) {
  if (!source) return null
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let k = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    const key = `b${k++}`

    if (!trimmed) {
      i++
      continue
    }
    if (/^###\s+/.test(trimmed)) {
      blocks.push(<h3 key={key}>{inline(trimmed.replace(/^###\s+/, ''), key)}</h3>)
      i++
    } else if (/^##?\s+/.test(trimmed)) {
      blocks.push(<h2 key={key}>{inline(trimmed.replace(/^##?\s+/, ''), key)}</h2>)
      i++
    } else if (/^---+$/.test(trimmed)) {
      blocks.push(<hr key={key} />)
      i++
    } else if (/^!\[[^\]]*\]\([^)]+\)$/.test(trimmed)) {
      const [, alt, url] = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)!
      blocks.push(
        <figure key={key}>
          <img src={safeUrl(url)} alt={alt} loading="lazy" />
          {alt && <figcaption className="mt-2 text-center text-sm text-muted">{alt}</figcaption>}
        </figure>,
      )
      i++
    } else if (/^>\s?/.test(trimmed)) {
      const quote: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) quote.push(lines[i++].trim().replace(/^>\s?/, ''))
      blocks.push(<blockquote key={key}>{inline(quote.join(' '), key)}</blockquote>)
    } else if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^[-*]\s+/, ''))
      blocks.push(
        <ul key={key}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `${key}-${j}`)}</li>
          ))}
        </ul>,
      )
    } else if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+[.)]\s+/, ''))
      blocks.push(
        <ol key={key}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `${key}-${j}`)}</li>
          ))}
        </ol>,
      )
    } else {
      const para: string[] = []
      while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|>|[-*]\s|\d+[.)]\s|---|!\[)/.test(lines[i].trim())) para.push(lines[i++].trim())
      if (!para.length) para.push(lines[i++].trim())
      blocks.push(
        <p key={key}>
          {para.map((p, j) => (
            <Fragment key={j}>
              {j > 0 && ' '}
              {inline(p, `${key}-${j}`)}
            </Fragment>
          ))}
        </p>,
      )
    }
  }

  return <div className={className}>{blocks}</div>
}

/** Plain-text paragraphs (split on blank lines) for simple multi-paragraph fields. */
export function Paragraphs({ text, className }: { text: string | null | undefined; className?: string }) {
  if (!text) return null
  return (
    <div className={className}>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  )
}
