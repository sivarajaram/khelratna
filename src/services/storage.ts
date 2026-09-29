import { supabase } from '@/lib/supabase'
import { AppError } from './errors'

export type Bucket =
  'site-assets' | 'competition-images' | 'athlete-images' | 'record-images' | 'award-images' | 'gallery' | 'news' | 'documents' | 'certificates'

/** Private buckets store a "bucket:path" reference instead of a public URL. */
const PRIVATE_BUCKETS: Bucket[] = ['certificates']
const MAX_UPLOAD_MB = 15

/**
 * Resizes large images and re-encodes them as WebP. Keeps the original when it is
 * already small, is an SVG/GIF, or the browser cannot encode WebP.
 */
export async function optimizeImage(file: File, maxDimension = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/') || /svg|gif/.test(file.type)) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 400 * 1024) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', quality))
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
  } catch {
    return file
  }
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Uploads a file and returns the value to store in the database (public URL or private reference). */
export async function uploadFile(bucket: Bucket, file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new AppError(`File is too large. The maximum size is ${MAX_UPLOAD_MB} MB.`)
  }
  const isImage = file.type.startsWith('image/')

  if (!supabase) {
    // Demo mode: keep a small inline copy in the browser
    const small = isImage ? await optimizeImage(file, 1200, 0.75) : file
    if (small.size > 1.5 * 1024 * 1024) throw new AppError('In demo mode files must be under 1.5 MB after compression.')
    return readAsDataUrl(small)
  }

  const prepared = isImage ? await optimizeImage(file) : file
  const ext = prepared.name.includes('.') ? prepared.name.split('.').pop()!.toLowerCase() : 'bin'
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, prepared, {
    cacheControl: '31536000',
    contentType: prepared.type || undefined,
    upsert: false,
  })
  if (error) throw new AppError('Upload failed. Please try again.', 'upload', error)

  if (PRIVATE_BUCKETS.includes(bucket)) return `${bucket}:${path}`
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export const isPrivateRef = (value: string | null | undefined) => !!value && PRIVATE_BUCKETS.some((b) => value.startsWith(`${b}:`))

/** Resolves a stored file value to a URL that can be opened (signed URL for private files). */
export async function resolveFileUrl(value: string): Promise<string> {
  if (!isPrivateRef(value) || !supabase) return value
  const [bucket, ...rest] = value.split(':')
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(rest.join(':'), 60 * 10)
  if (error || !data) throw new AppError('Could not open the file.', 'storage', error)
  return data.signedUrl
}
