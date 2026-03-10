'use client'
import { useState, useEffect } from 'react'
import { useAppStore }         from '@/store/appStore'
import Badge                   from '@/components/ui/Badge'
import Spinner                 from '@/components/ui/Spinner'
import {
  Download, Heart, Trash2,
  Clock, X, Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageHistory() {
  const {
    imageHistory, setImageHistory,
    deleteImageFromHistory,
    toggleImageFavorite,
  } = useAppStore()

  const [loading,     setLoading]     = useState(false)
  const [lightbox,    setLightbox]    = useState(null)
  const [filterFav,   setFilterFav]   = useState(false)

  // ── Fetch history on mount ─────────────────────
  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    setLoading(true)
    try {
      const res  = await fetch('/api/image/history?limit=30')
      const data = await res.json()
      if (data.images) setImageHistory(data.images)
    } catch (err) {
      console.error('Fetch image history error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Toggle favorite ───────────────────────────
  async function handleFavorite(e, id) {
    e.stopPropagation()
    try {
      await fetch('/api/image/history', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      toggleImageFavorite(id)
    } catch (err) {
      toast.error('Failed to update favorite')
    }
  }

  // ── Delete image ──────────────────────────────
  async function handleDelete(e, id) {
    e.stopPropagation()
    try {
      deleteImageFromHistory(id)
      toast.success('Image removed')
    } catch (err) {
      toast.error('Failed to delete image')
    }
  }

  // ── Download ──────────────────────────────────
  function handleDownload(e, image) {
    e.stopPropagation()
    const a    = document.createElement('a')
    a.href     = image.imageUrl
    a.download = `nexai-${Date.now()}.jpg`
    a.click()
  }

  // ── Filtered list ─────────────────────────────
  const displayed = filterFav
    ? imageHistory.filter((img) => img.isFavorite)
    : imageHistory

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="
          text-sm font-semibold text-[var(--text)]
          flex items-center gap-2
        ">
          <ImageIcon size={16} className="text-[#6c63ff]" />
          History
          {imageHistory.length > 0 && (
            <Badge variant="primary" size="xs">
              {imageHistory.length}
            </Badge>
          )}
        </h3>

        <button
          onClick={() => setFilterFav((f) => !f)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5
            rounded-xl text-xs font-medium
            border transition-all cursor-pointer
            ${filterFav
              ? 'bg-[#ff658422] text-[#ff6584] border-[#ff658433]'
              : 'bg-[var(--panel)] text-[var(--muted)] border-[var(--border)] hover:border-[#ff658433]'
            }
          `}
        >
          <Heart size={12} />
          Favorites
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      )}

      {/* Empty */}
      {!loading && displayed.length === 0 && (
        <div className="
          flex flex-col items-center justify-center
          py-12 text-center
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl
        ">
          <ImageIcon size={32} className="text-[var(--subtle)] mb-3" />
          <p className="text-sm text-[var(--muted)]">
            {filterFav
              ? 'No favorites yet'
              : 'No images generated yet'
            }
          </p>
          <p className="text-xs text-[var(--subtle)] mt-1">
            {filterFav
              ? 'Heart an image to save it here'
              : 'Generate an image above to see it here'
            }
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && displayed.length > 0 && (
        <div className="
          grid grid-cols-2 sm:grid-cols-3
          md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4
          gap-3
        ">
          {displayed.map((image) => (
            <div
              key={image._id}
              onClick={() => setLightbox(image)}
              className="
                group relative aspect-square
                rounded-xl overflow-hidden cursor-pointer
                border border-[var(--border)]
                hover:border-[#6c63ff44]
                transition-all duration-200
                hover:shadow-[0_0_20px_#6c63ff22]
              "
            >
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="
                  w-full h-full object-cover
                  transition-transform duration-300
                  group-hover:scale-105
                "
              />

              {/* Overlay on hover */}
              <div className="
                absolute inset-0
                bg-gradient-to-t from-black/70 via-transparent to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                flex flex-col justify-end p-2
              ">
                <p className="
                  text-white text-[10px] line-clamp-2
                  leading-tight mb-2
                ">
                  {image.prompt}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleFavorite(e, image._id)}
                    className={`
                      p-1.5 rounded-lg transition-all
                      ${image.isFavorite
                        ? 'bg-[#ff658433] text-[#ff6584]'
                        : 'bg-black/40 text-white hover:bg-[#ff658433] hover:text-[#ff6584]'
                      }
                    `}
                  >
                    <Heart
                      size={12}
                      fill={image.isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, image)}
                    className="
                      p-1.5 rounded-lg bg-black/40
                      text-white hover:bg-white/20
                      transition-all
                    "
                  >
                    <Download size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, image._id)}
                    className="
                      p-1.5 rounded-lg bg-black/40
                      text-white hover:bg-[#f8717133] hover:text-[#f87171]
                      transition-all
                    "
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Favorite indicator */}
              {image.isFavorite && (
                <div className="
                  absolute top-2 right-2
                  w-5 h-5 rounded-full
                  bg-[#ff6584] flex items-center justify-center
                ">
                  <Heart size={10} fill="white" className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Lightbox ──────────────────────────── */}
      {lightbox && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/85 backdrop-blur-sm
            flex items-center justify-center p-4
          "
          onClick={() => setLightbox(null)}
        >
          <div
            className="
              relative max-w-3xl w-full
              bg-[var(--panel)] border border-[var(--border)]
              rounded-2xl overflow-hidden
              shadow-[0_20px_80px_rgba(0,0,0,0.6)]
              animate-fade-up
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="
                absolute top-3 right-3 z-10
                w-8 h-8 rounded-xl
                bg-black/50 text-white
                flex items-center justify-center
                hover:bg-black/70 transition-all cursor-pointer
              "
            >
              <X size={16} />
            </button>

            {/* Image */}
            <img
              src={lightbox.imageUrl}
              alt={lightbox.prompt}
              className="w-full max-h-[60vh] object-contain"
            />

            {/* Info */}
            <div className="p-4 flex flex-col gap-3">
              <p className="text-sm text-[var(--text)]">
                {lightbox.prompt}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary" size="sm">
                  {lightbox.style}
                </Badge>
                <Badge variant="default" size="sm">
                  {lightbox.size}
                </Badge>
                {lightbox.generationTime && (
                  <Badge variant="default" size="sm">
                    <Clock size={10} className="inline mr-1" />
                    {(lightbox.generationTime / 1000).toFixed(1)}s
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { handleFavorite(e, lightbox._id); setLightbox({ ...lightbox, isFavorite: !lightbox.isFavorite }) }}
                  className={`
                    flex items-center gap-2 px-4 py-2
                    rounded-xl text-sm font-medium
                    border transition-all cursor-pointer flex-1 justify-center
                    ${lightbox.isFavorite
                      ? 'bg-[#ff658422] text-[#ff6584] border-[#ff658433]'
                      : 'bg-[var(--border)] text-[var(--muted)] border-[var(--border)]'
                    }
                  `}
                >
                  <Heart
                    size={14}
                    fill={lightbox.isFavorite ? 'currentColor' : 'none'}
                  />
                  {lightbox.isFavorite ? 'Favorited' : 'Favorite'}
                </button>
                <button
                  onClick={(e) => handleDownload(e, lightbox)}
                  className="
                    flex items-center gap-2 px-4 py-2
                    rounded-xl text-sm font-medium
                    bg-[#6c63ff] text-white
                    hover:bg-[#7c74ff] transition-all
                    cursor-pointer flex-1 justify-center
                  "
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
