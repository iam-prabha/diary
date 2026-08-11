import { useState } from 'react'
import type { Media } from '@/types'

export function getOptimizedUrl(url: string, width: number): string {
  if (url.includes('cloudinary.com')) {
    return url.replace('/image/upload/', `/image/upload/w_${width},q_auto,f_auto/`)
  }
  return url
}

export function MediaGallery({ media }: { media: Media[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (media.length === 0) return null

  const isImage = (m: Media) => m.mimeType.startsWith('image/')

  const prev = () => setActiveIndex(i => i !== null && i > 0 ? i - 1 : i)
  const next = () => setActiveIndex(i => i !== null && i < media.length - 1 ? i + 1 : i)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setActiveIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[rgb(var(--paper-line))]"
            aria-label="View image"
          >
            {isImage(m) ? (
              <img
                src={getOptimizedUrl(m.url, 400)}
                alt=""
                loading="lazy"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="grid size-full place-items-center bg-[rgb(var(--paper-line))]/30 text-2xl">📄</div>
            )}
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={getOptimizedUrl(media[activeIndex].url, 1200)}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="absolute bottom-4 flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="rounded-full bg-white/20 px-4 py-2 text-white hover:bg-white/30"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="rounded-full bg-white/20 px-4 py-2 text-white hover:bg-white/30"
              aria-label="Next image"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
