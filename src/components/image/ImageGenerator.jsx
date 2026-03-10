'use client'
import { useState }       from 'react'
import { useAppStore }    from '@/store/appStore'
import Button             from '@/components/ui/Button'
import Badge              from '@/components/ui/Badge'
import { IMAGE_STYLES, IMAGE_SIZES } from '@/constants/imageStyles'
import {
  Sparkles, Download, RefreshCw,
  Clock, Image as ImageIcon, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageGenerator() {
  const {
    imagePrompt, setImagePrompt,
    imageStyle,  setImageStyle,
    imageSize,   setImageSize,
    addImageToHistory,
  } = useAppStore()

  const [loading,       setLoading]       = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [genTime,       setGenTime]       = useState(null)
  const [showStyles,    setShowStyles]    = useState(false)
  const [showSizes,     setShowSizes]     = useState(false)
  const [retryCount,    setRetryCount]    = useState(0)

  const currentStyle = IMAGE_STYLES.find((s) => s.id === imageStyle) || IMAGE_STYLES[0]
  const currentSize  = IMAGE_SIZES.find((s)  => s.id === imageSize)  || IMAGE_SIZES[0]

  // ── Generate ─────────────────────────────────────
  async function handleGenerate() {
    if (!imagePrompt.trim() || loading) return

    setLoading(true)
    setGeneratedImage(null)

    const toastId = toast.loading('Generating image...')

    try {
      const res  = await fetch('/api/image', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          style:  imageStyle,
          size:   imageSize,
        }),
      })

      const data = await res.json()

      // ── Model still loading (503) ──────────────
      if (res.status === 503 && data.retry) {
        toast.error(
          'Model is warming up — wait 20 seconds and try again',
          { id: toastId, duration: 5000 }
        )
        setRetryCount((c) => c + 1)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setGeneratedImage(data.imageUrl)
      setGenTime(data.generationTime)
      setRetryCount(0)

      // Add to store history
      addImageToHistory({
        _id:       data.id,
        prompt:    data.prompt,
        imageUrl:  data.imageUrl,
        style:     data.style,
        size:      data.size,
        createdAt: new Date(),
      })

      toast.success('Image generated!', { id: toastId })
    } catch (err) {
      console.error('Image gen error:', err)
      toast.error(
        err.message || 'Generation failed. Please try again.',
        { id: toastId }
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Download ──────────────────────────────────────
  function handleDownload() {
    if (!generatedImage) return
    const a       = document.createElement('a')
    a.href        = generatedImage
    a.download    = `nexai-${Date.now()}.jpg`
    a.click()
  }

  // ── Enter key ──────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">

      {/* ── Left — Controls ──────────────────────── */}
      <div className="
        lg:w-80 shrink-0 flex flex-col gap-4
      ">

        {/* Prompt */}
        <div className="
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl p-4 flex flex-col gap-3
        ">
          <label className="
            text-sm font-semibold text-[var(--text)]
            flex items-center gap-2
          ">
            <ImageIcon size={16} className="text-[#6c63ff]" />
            Describe your image
          </label>

          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="A futuristic city at sunset with flying cars..."
            rows={4}
            className="
              w-full bg-[var(--input)] text-[var(--text)]
              border border-[var(--border)] rounded-xl
              px-4 py-3 text-sm resize-none outline-none
              placeholder:text-[var(--muted)]
              focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_#6c63ff22]
              transition-all duration-200
            "
          />

          <Button
            onClick={handleGenerate}
            loading={loading}
            disabled={!imagePrompt.trim()}
            fullWidth
            icon={<Sparkles size={16} />}
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </Button>

          {retryCount > 0 && (
            <p className="text-xs text-[#f59e0b] text-center">
              Model warming up... try again in 20s
            </p>
          )}
        </div>

        {/* Style selector */}
        <div className="
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl p-4 flex flex-col gap-3
        ">
          <button
            onClick={() => setShowStyles((s) => !s)}
            className="
              flex items-center justify-between
              text-sm font-semibold text-[var(--text)]
              cursor-pointer w-full
            "
          >
            <span className="flex items-center gap-2">
              <span>{currentStyle.emoji}</span>
              Style: {currentStyle.label}
            </span>
            <ChevronDown
              size={16}
              className={`
                text-[var(--muted)] transition-transform duration-200
                ${showStyles ? 'rotate-180' : ''}
              `}
            />
          </button>

          {showStyles && (
            <div className="grid grid-cols-2 gap-2 animate-fade-in">
              {IMAGE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => { setImageStyle(style.id); setShowStyles(false) }}
                  className={`
                    flex items-center gap-2
                    px-3 py-2 rounded-xl text-sm
                    transition-all duration-150 cursor-pointer text-left
                    ${imageStyle === style.id
                      ? 'bg-[#6c63ff22] border border-[#6c63ff44] text-[#6c63ff]'
                      : 'bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }
                  `}
                >
                  <span>{style.emoji}</span>
                  <span className="text-xs font-medium truncate">
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Size selector */}
        <div className="
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl p-4 flex flex-col gap-3
        ">
          <button
            onClick={() => setShowSizes((s) => !s)}
            className="
              flex items-center justify-between
              text-sm font-semibold text-[var(--text)]
              cursor-pointer w-full
            "
          >
            <span className="flex items-center gap-2">
              <span>{currentSize.emoji}</span>
              Size: {currentSize.label}
              <Badge variant="default" size="xs">{currentSize.aspect}</Badge>
            </span>
            <ChevronDown
              size={16}
              className={`
                text-[var(--muted)] transition-transform duration-200
                ${showSizes ? 'rotate-180' : ''}
              `}
            />
          </button>

          {showSizes && (
            <div className="flex flex-col gap-2 animate-fade-in">
              {IMAGE_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => { setImageSize(size.id); setShowSizes(false) }}
                  className={`
                    flex items-center justify-between
                    px-3 py-2 rounded-xl text-sm
                    transition-all duration-150 cursor-pointer
                    ${imageSize === size.id
                      ? 'bg-[#6c63ff22] border border-[#6c63ff44] text-[#6c63ff]'
                      : 'bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span>{size.emoji}</span>
                    <span className="font-medium">{size.label}</span>
                    {size.slow && (
                      <Badge variant="warning" size="xs">Slow</Badge>
                    )}
                  </span>
                  <Badge variant="default" size="xs">{size.aspect}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right — Result ───────────────────────── */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="
          flex-1
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl overflow-hidden
          flex items-center justify-center
          min-h-[300px] relative
        ">

          {/* Loading state */}
          {loading && (
            <div className="
              absolute inset-0 flex flex-col items-center justify-center
              gap-4 bg-[var(--panel)]
            ">
              <div className="relative">
                <div className="
                  w-20 h-20 rounded-2xl
                  bg-gradient-to-br from-[#6c63ff22] to-[#ff658422]
                  border border-[#6c63ff33]
                  flex items-center justify-center
                ">
                  <Sparkles
                    size={36}
                    className="text-[#6c63ff] animate-pulse-slow"
                  />
                </div>
                {/* Spinning ring */}
                <div className="
                  absolute inset-0 rounded-2xl
                  border-2 border-transparent
                  border-t-[#6c63ff]
                  animate-spin
                " />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text)]">
                  Generating your image...
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  This may take 20-60 seconds
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !generatedImage && (
            <div className="
              flex flex-col items-center justify-center
              gap-4 text-center p-8
            ">
              <div className="
                w-20 h-20 rounded-2xl
                bg-[var(--border)]
                flex items-center justify-center
              ">
                <ImageIcon size={36} className="text-[var(--subtle)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--muted)]">
                  Your image will appear here
                </p>
                <p className="text-xs text-[var(--subtle)] mt-1">
                  Enter a prompt and click Generate
                </p>
              </div>
            </div>
          )}

          {/* Generated image */}
          {!loading && generatedImage && (
            <div className="
              w-full h-full flex items-center justify-center p-4
            ">
              <img
                src={generatedImage}
                alt={imagePrompt}
                className="
                  max-w-full max-h-full object-contain
                  rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]
                  animate-fade-in
                "
              />
            </div>
          )}
        </div>

        {/* Actions bar — shown after generation */}
        {generatedImage && !loading && (
          <div className="
            flex items-center justify-between
            bg-[var(--panel)] border border-[var(--border)]
            rounded-2xl px-4 py-3
            animate-fade-up
          ">
            <div className="flex items-center gap-3">
              {genTime && (
                <span className="
                  flex items-center gap-1.5
                  text-xs text-[var(--muted)]
                ">
                  <Clock size={12} />
                  {(genTime / 1000).toFixed(1)}s
                </span>
              )}
              <Badge variant="default" size="sm">
                {currentStyle.emoji} {currentStyle.label}
              </Badge>
              <Badge variant="default" size="sm">
                {currentSize.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerate}
                variant="secondary"
                size="sm"
                icon={<RefreshCw size={14} />}
              >
                Regenerate
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                icon={<Download size={14} />}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}