import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { galleryCategoryOptions } from '@/admin/resources'
import type { GalleryItem } from '@/types/database'
import { useQuery } from '@/hooks/useQuery'
import { repo } from '@/services/repository'
import { uploadFile } from '@/services/storage'
import { errorMessage } from '@/services/errors'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { FormField } from '@/components/common/FormField'
import { useToast } from '@/components/common/Toast'

interface Props {
  open: boolean
  onClose: () => void
  onDone: () => void
}

/** Uploads many gallery images at once with a shared category, event and caption. */
export function BulkUploadDialog({ open, onClose, onDone }: Props) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [category, setCategory] = useState('events')
  const [competition, setCompetition] = useState('')
  const [caption, setCaption] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const competitions = useQuery(
    open ? 'admin:options:competitions-all' : null,
    async () => (await repo('competitions').list({ select: 'id,name', order: [{ column: 'start_date', ascending: false }] })).rows,
  )

  const close = () => {
    if (progress !== null) return
    setFiles([])
    setCaption('')
    onClose()
  }

  const start = async () => {
    setProgress(0)
    let done = 0
    let failed = 0
    const { count } = await repo('gallery').list({ range: { from: 0, to: 0 } })
    for (const [i, file] of files.entries()) {
      try {
        const url = await uploadFile('gallery', file)
        const row: Partial<GalleryItem> = {
          url,
          media_type: 'image',
          category: category as GalleryItem['category'],
          competition_id: competition || null,
          caption: caption || null,
          alt: caption || null,
          sort_order: count + i,
          status: 'published',
        }
        await repo('gallery').insert(row)
        done++
      } catch (err) {
        failed++
        console.error(err)
        if (failed === 1) toast.error(errorMessage(err))
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }
    setProgress(null)
    setFiles([])
    if (done) toast.success(`${done} image${done === 1 ? '' : 's'} uploaded${failed ? `, ${failed} failed` : ''}`)
    onDone()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Bulk upload images"
      description="Images are resized and converted to WebP before upload."
      size="lg"
      footer={
        <>
          <Button variant="ghost" caps={false} size="sm" onClick={close} disabled={progress !== null}>
            Cancel
          </Button>
          <Button variant="navy" caps={false} size="sm" onClick={start} disabled={!files.length} loading={progress !== null}>
            {progress !== null ? `Uploading… ${progress}%` : `Upload ${files.length || ''} image${files.length === 1 ? '' : 's'}`}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line p-8 text-sm text-muted hover:border-navy-600 hover:bg-paper"
        >
          <ImagePlus className="size-7" aria-hidden />
          <span className="font-medium text-ink">Choose images</span>
          <span>JPG, PNG or WebP · select as many as you like</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const picked = [...(e.target.files ?? [])]
            e.target.value = ''
            setFiles((f) => [...f, ...picked])
          }}
        />

        {files.length > 0 && (
          <ul className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
            {files.map((f, i) => (
              <li key={f.name + i} className="relative aspect-square overflow-hidden rounded-lg bg-paper">
                <img src={URL.createObjectURL(f)} alt={f.name} className="size-full object-cover" onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} />
                {progress === null && (
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, k) => k !== i))}
                    className="absolute top-1 right-1 rounded-full bg-navy-950/70 p-0.5 text-white"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="size-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Category">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {galleryCategoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Event">
            <select className="input" value={competition} onChange={(e) => setCompetition(e.target.value)}>
              <option value="">— None —</option>
              {(competitions.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Caption for all images" hint="Also used as alt text. You can edit each image afterwards." className="sm:col-span-2">
            <input className="input" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </FormField>
        </div>
      </div>
    </Modal>
  )
}
