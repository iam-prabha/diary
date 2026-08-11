import { useCallback, useRef, useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/upload'
import type { Media } from '@/types'
import { getOptimizedUrl } from './MediaGallery'

interface MediaUploaderProps {
  media: Media[]
  onChange: (media: Media[]) => void
}

interface UploadState {
  name: string
  progress: number
}

export function MediaUploader({ media, onChange }: MediaUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState<UploadState[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    for (const file of imageFiles) {
      const uploadState: UploadState = { name: file.name, progress: 0 }
      setUploading(u => [...u, uploadState])
      try {
        const url = await uploadImage(file, progress => {
          setUploading(u => u.map(x => x === uploadState ? { ...x, progress } : x))
        })
        const mediaItem: Media = {
          id: url,
          url,
          mimeType: file.type,
          size: file.size,
          cloudinaryId: url.split('/').pop() ?? url,
        }
        onChange([...media, mediaItem])
      } catch (e) {
        console.error('Upload failed', e)
      } finally {
        setUploading(u => u.filter(x => x !== uploadState))
      }
    }
  }, [media, onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  return (
    <div>
      {media.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {media.map((m, i) => (
            <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl border border-[rgb(var(--paper-line))]">
              <img src={getOptimizedUrl(m.url, 300)} alt="" className="size-full object-cover" />
              <button
                onClick={() => onChange(media.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading.length > 0 && (
        <div className="mb-3 space-y-2">
          {uploading.map((u, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-3">
              <Loader2 className="size-4 animate-spin text-[rgb(var(--accent))]" />
              <span className="flex-1 truncate text-sm text-[rgb(var(--ink-soft))]">{u.name}</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[rgb(var(--paper-line))]">
                <div className="h-full rounded-full bg-[rgb(var(--accent))] transition-all" style={{ width: `${u.progress}%` }} />
              </div>
              <span className="text-xs text-[rgb(var(--ink-faint))]">{u.progress}%</span>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent-soft))]'
            : 'border-[rgb(var(--paper-line))] hover:border-[rgb(var(--accent))]'
        }`}
      >
        <ImagePlus className="mb-2 size-8 text-[rgb(var(--ink-faint))]" />
        <p className="text-sm font-medium text-[rgb(var(--ink-soft))]">Drag & drop images, or click to browse</p>
        <p className="mt-1 text-xs text-[rgb(var(--ink-faint))]">You can also paste images directly into the editor</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) handleFiles(e.target.files) }}
        />
      </div>
    </div>
  )
}
