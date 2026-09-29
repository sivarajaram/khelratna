import { useId, useRef, useState, type KeyboardEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bold,
  ExternalLink,
  Eye,
  FileText,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  Loader2,
  Pencil,
  Plus,
  Quote,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import type { DocumentLink } from '@/types/database'
import { uploadFile, isPrivateRef, resolveFileUrl, type Bucket } from '@/services/storage'
import { errorMessage } from '@/services/errors'
import { useToast } from '@/components/common/Toast'
import { Markdown } from '@/components/common/Markdown'
import { cn } from '@/utils/cn'

const smallBtn =
  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-line ring-inset transition hover:bg-paper disabled:opacity-50'

function useUploader(bucket: Bucket) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const upload = async (files: File[]): Promise<string[]> => {
    setBusy(true)
    const urls: string[] = []
    try {
      for (const f of files) urls.push(await uploadFile(bucket, f))
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
    return urls
  }
  return { busy, upload }
}

/** Opens a stored file; private references get a short-lived signed URL. */
export async function openStoredFile(value: string) {
  if (!isPrivateRef(value) && !value.startsWith('data:')) {
    window.open(value, '_blank', 'noopener')
    return
  }
  // Open the tab synchronously (popup blockers), then point it at the resolved URL
  const win = window.open('about:blank', '_blank')
  try {
    const url = value.startsWith('data:') ? URL.createObjectURL(await (await fetch(value)).blob()) : await resolveFileUrl(value)
    if (win) {
      win.opener = null
      win.location.href = url
    }
  } catch {
    win?.close()
  }
}

// --------------------------------------------------------------------- image
interface SingleProps {
  value: string
  onChange: (v: string) => void
  bucket: Bucket
  accept?: string
  id?: string
  invalid?: boolean
}

export function ImageInput({ value, onChange, bucket, accept = 'image/*', id, invalid }: SingleProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { busy, upload } = useUploader(bucket)
  const [showUrl, setShowUrl] = useState(false)
  const isVideo = /\.(mp4|webm)(\?|$)/i.test(value) || value.startsWith('data:video')
  const isYoutube = /youtu\.?be/.test(value)

  return (
    <div className={cn('rounded-xl border border-dashed p-3', invalid ? 'border-red-600' : 'border-line')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid aspect-[4/3] w-full shrink-0 place-items-center overflow-hidden rounded-lg bg-paper sm:w-40">
          {busy ? (
            <Loader2 className="size-5 animate-spin text-muted" aria-label="Uploading" />
          ) : value && isVideo ? (
            <video src={value} className="size-full object-cover" muted />
          ) : value && !isYoutube ? (
            <img src={value} alt="Preview" className="size-full object-cover" />
          ) : value ? (
            <span className="px-2 text-center text-xs text-muted">YouTube link</span>
          ) : (
            <ImagePlus className="size-6 text-muted-light" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={smallBtn} onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="size-3.5" aria-hidden /> {value ? 'Replace' : 'Upload'}
            </button>
            <button type="button" className={smallBtn} onClick={() => setShowUrl((s) => !s)}>
              <Link2 className="size-3.5" aria-hidden /> Use a link
            </button>
            {value && (
              <button type="button" className={cn(smallBtn, 'text-red-600')} onClick={() => onChange('')}>
                <Trash2 className="size-3.5" aria-hidden /> Remove
              </button>
            )}
          </div>
          {(showUrl || (value && !value.startsWith('data:'))) && (
            <input
              id={id}
              className="input"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
              aria-invalid={invalid || undefined}
            />
          )}
          <p className="text-xs text-muted">Large images are resized and converted to WebP automatically.</p>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          const [url] = await upload([file])
          if (url) onChange(url)
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------- file
export function FileInput({ value, onChange, bucket, accept = 'application/pdf', invalid }: SingleProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { busy, upload } = useUploader(bucket)
  const name = value ? (isPrivateRef(value) ? 'Private file' : decodeURIComponent(value.split('/').pop()?.split('?')[0] ?? 'File')) : ''

  return (
    <div className={cn('flex flex-wrap items-center gap-3 rounded-xl border border-dashed p-3', invalid ? 'border-red-600' : 'border-line')}>
      <FileText className="size-5 text-muted" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-sm text-ink">
        {busy ? 'Uploading…' : value ? value.startsWith('data:') ? 'Uploaded file' : name : <span className="text-muted">No file</span>}
      </span>
      {value && (
        <button type="button" className={smallBtn} onClick={() => openStoredFile(value)}>
          <ExternalLink className="size-3.5" aria-hidden /> Open
        </button>
      )}
      <button type="button" className={smallBtn} onClick={() => fileRef.current?.click()} disabled={busy}>
        <Upload className="size-3.5" aria-hidden /> {value ? 'Replace' : 'Upload'}
      </button>
      {value && (
        <button type="button" className={cn(smallBtn, 'text-red-600')} onClick={() => onChange('')} aria-label="Remove file">
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          const [url] = await upload([file])
          if (url) onChange(url)
        }}
      />
    </div>
  )
}

// -------------------------------------------------------------------- images
export function ImagesInput({ value, onChange, bucket }: { value: string[]; onChange: (v: string[]) => void; bucket: Bucket }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { busy, upload } = useUploader(bucket)
  const move = (i: number, d: number) => {
    const next = [...value]
    const j = i + d
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="rounded-xl border border-dashed border-line p-3">
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {value.map((url, i) => (
          <li key={url + i} className="group relative aspect-square overflow-hidden rounded-lg bg-paper">
            <img src={url} alt={`Image ${i + 1}`} className="size-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-navy-950/70 p-1 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} className="rounded p-1 text-white hover:bg-white/20" aria-label="Move left">
                <ArrowLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, k) => k !== i))}
                className="rounded p-1 text-white hover:bg-red-600"
                aria-label="Remove image"
              >
                <Trash2 className="size-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="rounded p-1 text-white hover:bg-white/20" aria-label="Move right">
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="grid aspect-square w-full place-items-center rounded-lg bg-paper text-muted ring-1 ring-line ring-inset hover:bg-navy-50 hover:text-navy-800"
          >
            {busy ? <Loader2 className="size-5 animate-spin" aria-label="Uploading" /> : <Plus className="size-5" aria-label="Add images" />}
          </button>
        </li>
      </ul>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])]
          e.target.value = ''
          if (!files.length) return
          const urls = await upload(files)
          if (urls.length) onChange([...value, ...urls])
        }}
      />
    </div>
  )
}

// ----------------------------------------------------------------- documents
export function DocumentsInput({ value, onChange, bucket }: { value: DocumentLink[]; onChange: (v: DocumentLink[]) => void; bucket: Bucket }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { busy, upload } = useUploader(bucket)
  const update = (i: number, patch: Partial<DocumentLink>) => onChange(value.map((d, k) => (k === i ? { ...d, ...patch } : d)))

  return (
    <div className="space-y-2">
      {value.map((d, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl bg-paper p-3 sm:flex-row sm:items-center">
          <input
            className="input sm:w-56"
            value={d.name}
            onChange={(e) => update(i, { name: e.target.value })}
            placeholder="Document name"
            aria-label={`Document ${i + 1} name`}
          />
          <input
            className="input flex-1"
            value={d.url.startsWith('data:') ? '(uploaded file)' : d.url}
            readOnly={d.url.startsWith('data:')}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="https://…"
            aria-label={`Document ${i + 1} link`}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, k) => k !== i))}
            className="self-end rounded-lg p-2 text-red-600 hover:bg-red-50 sm:self-auto"
            aria-label={`Remove document ${i + 1}`}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={smallBtn} onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Upload className="size-3.5" aria-hidden />} Upload document
        </button>
        <button type="button" className={smallBtn} onClick={() => onChange([...value, { name: '', url: '' }])}>
          <Link2 className="size-3.5" aria-hidden /> Add link
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/*,.doc,.docx"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])]
          e.target.value = ''
          if (!files.length) return
          const urls = await upload(files)
          onChange([...value, ...urls.map((url, i) => ({ name: files[i].name.replace(/\.[^.]+$/, ''), url }))])
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------- tags
export function TagsInput({ value, onChange, placeholder, id }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; id?: string }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const parts = draft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))])
    setDraft('')
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-white p-1.5 focus-within:border-navy-600 focus-within:ring-2 focus-within:ring-navy-600/15">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-navy-50 py-1 pr-1 pl-2 text-xs font-medium text-navy-800">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="rounded p-0.5 hover:bg-navy-100" aria-label={`Remove ${t}`}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="min-w-40 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none"
      />
    </div>
  )
}

// ------------------------------------------------------------------ markdown
export function MarkdownInput({ value, onChange, id, invalid }: { value: string; onChange: (v: string) => void; id?: string; invalid?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [preview, setPreview] = useState(false)
  const helpId = useId()

  const wrap = (before: string, after = before, placeholder = 'text') => {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const selected = value.slice(s, e) || placeholder
    const next = value.slice(0, s) + before + selected + after + value.slice(e)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + before.length, s + before.length + selected.length)
    })
  }
  const linePrefix = (prefix: string) => {
    const el = ref.current
    if (!el) return
    const start = value.lastIndexOf('\n', el.selectionStart - 1) + 1
    onChange(value.slice(0, start) + prefix + value.slice(start))
    requestAnimationFrame(() => el.focus())
  }

  const tools = [
    { icon: Heading2, label: 'Heading', run: () => linePrefix('## ') },
    { icon: Bold, label: 'Bold', run: () => wrap('**') },
    { icon: Italic, label: 'Italic', run: () => wrap('*') },
    { icon: Link2, label: 'Link', run: () => wrap('[', '](https://)', 'link text') },
    { icon: List, label: 'Bullet list', run: () => linePrefix('- ') },
    { icon: Quote, label: 'Quote', run: () => linePrefix('> ') },
  ]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-white focus-within:ring-2 focus-within:ring-navy-600/15',
        invalid ? 'border-red-600' : 'border-line focus-within:border-navy-600',
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-line bg-paper px-1.5 py-1">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.run}
            disabled={preview}
            className="rounded-md p-1.5 text-muted hover:bg-white hover:text-ink disabled:opacity-40"
            aria-label={t.label}
            title={t.label}
          >
            <t.icon className="size-4" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-navy-800 hover:bg-white"
        >
          {preview ? <Pencil className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <div className="min-h-64 p-5">
          {value ? <Markdown source={value} className="prose-kr text-base" /> : <p className="text-sm text-muted">Nothing to preview.</p>}
        </div>
      ) : (
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          aria-describedby={helpId}
          className="block w-full resize-y px-4 py-3 font-mono text-sm leading-6 outline-none"
        />
      )}
      <p id={helpId} className="border-t border-line bg-paper px-3 py-1.5 text-[0.7rem] text-muted">
        ## Heading · **bold** · *italic* · [link](https://…) · - list · &gt; quote · ![caption](image-url) · blank line = new paragraph
      </p>
    </div>
  )
}
