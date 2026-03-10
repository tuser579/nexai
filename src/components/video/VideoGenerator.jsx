'use client'
import { useState, useRef } from 'react'
import { useAppStore }      from '@/store/appStore'
import Button               from '@/components/ui/Button'
import Badge                from '@/components/ui/Badge'
import {
  VIDEO_STYLES,
  VIDEO_DURATIONS,
  VIDEO_QUALITY,
  VIDEO_GENERATION_STAGES,
} from '@/constants/videoStyles'
import {
  Video, Play, Download, RefreshCw,
  ChevronDown, Clock, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function VideoGenerator() {
  const {
    videoPrompt,    setVideoPrompt,
    videoStyle,     setVideoStyle,
    videoDuration,  setVideoDuration,
    videoQuality,   setVideoQuality,
  } = useAppStore()

  const [loading,        setLoading]        = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [progress,       setProgress]       = useState(0)
  const [stage,          setStage]          = useState('')
  const [genTime,        setGenTime]        = useState(null)
  const [showStyles,     setShowStyles]     = useState(false)
  const [showDurations,  setShowDurations]  = useState(false)
  const [showQuality,    setShowQuality]    = useState(false)

  const videoRef     = useRef(null)
  const progressRef  = useRef(null)

  const currentStyle    = VIDEO_STYLES.find((s) => s.id === videoStyle)       || VIDEO_STYLES[0]
  const currentDuration = VIDEO_DURATIONS.find((d) => d.id === videoDuration) || VIDEO_DURATIONS[1]
  const currentQuality  = VIDEO_QUALITY.find((q) => q.id === videoQuality)    || VIDEO_QUALITY[1]

  // ── Simulate progress stages ───────────────────
  function startProgressSimulation() {
    let   stageIndex = 0
    const totalStages = VIDEO_GENERATION_STAGES.length
    const interval    = setInterval(() => {
      if (stageIndex < totalStages) {
        setStage(VIDEO_GENERATION_STAGES[stageIndex])
        setProgress(Math.round(((stageIndex + 1) / totalStages) * 90))
        stageIndex++
      }
    }, 4000)
    progressRef.current = interval
    return interval
  }

  function stopProgressSimulation(interval) {
    clearInterval(interval)
    clearInterval(progressRef.current)
    setProgress(100)
    setStage('✅ Complete!')
  }

  // ── Generate ───────────────────────────────────
  async function handleGenerate() {
    if (!videoPrompt.trim() || loading) return

    setLoading(true)
    setGeneratedVideo(null)
    setProgress(0)
    setStage(VIDEO_GENERATION_STAGES[0])

    const interval = startProgressSimulation()
    const toastId  = toast.loading('Generating video — this takes 1-3 minutes...')
    const start    = Date.now()

    try {
      const res  = await fetch('/api/video', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:   videoPrompt.trim(),
          style:    videoStyle,
          duration: videoDuration,
          quality:  videoQuality,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Video generation failed')
      }

      stopProgressSimulation(interval)

      setGeneratedVideo(data.videoUrl)
      setGenTime(Date.now() - start)

      toast.success('Video generated!', { id: toastId })
    } catch (err) {
      clearInterval(interval)
      setProgress(0)
      setStage('')
      console.error('Video gen error:', err)
      toast.error(
        err.message || 'Generation failed. Please try again.',
        { id: toastId }
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Download ───────────────────────────────────
  function handleDownload() {
    if (!generatedVideo) return
    const a    = document.createElement('a')
    a.href     = generatedVideo
    a.download = `nexai-video-${Date.now()}.mp4`
    a.click()
  }

  // ── Enter key ──────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">

      {/* ── Left — Controls ──────────────────────── */}
      <div className="lg:w-80 shrink-0 flex flex-col gap-4">

        {/* Prompt */}
        <div className="
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl p-4 flex flex-col gap-3
        ">
          <label className="
            text-sm font-semibold text-[var(--text)]
            flex items-center gap-2
          ">
            <Video size={16} className="text-[#6c63ff]" />
            Describe your video
          </label>

          <textarea
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="A majestic eagle soaring over snow-capped mountains..."
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
            disabled={!videoPrompt.trim()}
            fullWidth
            icon={<Sparkles size={16} />}
          >
            {loading ? 'Generating...' : 'Generate Video'}
          </Button>

          <p className="text-xs text-[var(--muted)] text-center">
            ⏱️ Takes 1–3 minutes · Uses Replicate credits
          </p>
        </div>

        {/* Style */}
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
              {VIDEO_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => { setVideoStyle(style.id); setShowStyles(false) }}
                  className={`
                    flex items-center gap-2
                    px-3 py-2 rounded-xl text-sm
                    transition-all duration-150 cursor-pointer text-left
                    ${videoStyle === style.id
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

        {/* Duration */}
        <div className="
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl p-4 flex flex-col gap-3
        ">
          <button
            onClick={() => setShowDurations((s) => !s)}
            className="
              flex items-center justify-between
              text-sm font-semibold text-[var(--text)]
              cursor-pointer w-full
            "
          >
            <span className="flex items-center gap-2">
              <Clock size={14} className="text-[#6c63ff]" />
              Duration: {currentDuration.label}
            </span>
            <ChevronDown
              size={16}
              className={`
                text-[var(--muted)] transition-transform duration-200
                ${showDurations ? 'rotate-180' : ''}
              `}
            />
          </button>

          {showDurations && (
            <div className="flex flex-col gap-2 animate-fade-in">
              {VIDEO_DURATIONS.map((dur) => (
                <button
                  key={dur.id}
                  onClick={() => { setVideoDuration(dur.id); setShowDurations(false) }}
                  className={`
                    flex items-center justify-between
                    px-3 py-2 rounded-xl text-sm
                    transition-all duration-150 cursor-pointer
                    ${videoDuration === dur.id
                      ? 'bg-[#6c63ff22] border border-[#6c63ff44] text-[#6c63ff]'
                      : 'bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }
                  `}
                >
                  <span className="font-medium">{dur.label}</span>
                  <Badge
                    variant={
                      dur.credits === 'Low'      ? 'success' :
                      dur.credits === 'Medium'   ? 'info'    :
                      dur.credits === 'High'     ? 'warning' :
                      'danger'
                    }
                    size="xs"
                  >
                    {dur.credits} credits
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quality */}
        <div className="
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl p-4 flex flex-col gap-3
        ">
          <button
            onClick={() => setShowQuality((s) => !s)}
            className="
              flex items-center justify-between
              text-sm font-semibold text-[var(--text)]
              cursor-pointer w-full
            "
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#6c63ff]" />
              Quality: {currentQuality.label}
            </span>
            <ChevronDown
              size={16}
              className={`
                text-[var(--muted)] transition-transform duration-200
                ${showQuality ? 'rotate-180' : ''}
              `}
            />
          </button>

          {showQuality && (
            <div className="flex flex-col gap-2 animate-fade-in">
              {VIDEO_QUALITY.map((q) => (
                <button
                  key={q.id}
                  onClick={() => { setVideoQuality(q.id); setShowQuality(false) }}
                  className={`
                    flex items-center justify-between
                    px-3 py-2.5 rounded-xl text-sm
                    transition-all duration-150 cursor-pointer
                    ${videoQuality === q.id
                      ? 'bg-[#6c63ff22] border border-[#6c63ff44] text-[#6c63ff]'
                      : 'bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }
                  `}
                >
                  <div>
                    <p className="font-medium text-left">{q.label}</p>
                    <p className="text-xs opacity-70 text-left">
                      {q.description}
                    </p>
                  </div>
                  <Badge variant="default" size="xs">
                    {q.steps} steps
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right — Result ───────────────────────── */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="
          flex-1 min-h-[300px]
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl overflow-hidden
          flex items-center justify-center
          relative
        ">

          {/* Loading / Progress */}
          {loading && (
            <div className="
              absolute inset-0 flex flex-col items-center justify-center
              gap-6 p-8 bg-[var(--panel)]
            ">
              {/* Animated icon */}
              <div className="relative">
                <div className="
                  w-24 h-24 rounded-2xl
                  bg-gradient-to-br from-[#6c63ff22] to-[#ff658422]
                  border border-[#6c63ff33]
                  flex items-center justify-center
                ">
                  <Video
                    size={40}
                    className="text-[#6c63ff] animate-pulse-slow"
                  />
                </div>
                <div className="
                  absolute inset-0 rounded-2xl
                  border-2 border-transparent border-t-[#6c63ff]
                  animate-spin
                " />
              </div>

              {/* Stage text */}
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text)] mb-1">
                  {stage}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  This takes 1–3 minutes — please wait
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-sm">
                <div className="
                  flex items-center justify-between mb-2
                ">
                  <span className="text-xs text-[var(--muted)]">
                    Progress
                  </span>
                  <span className="text-xs font-mono text-[#6c63ff]">
                    {progress}%
                  </span>
                </div>
                <div className="
                  w-full h-2 bg-[var(--border)] rounded-full
                  overflow-hidden
                ">
                  <div
                    className="
                      h-full rounded-full
                      bg-gradient-to-r from-[#6c63ff] to-[#ff6584]
                      transition-all duration-1000 ease-out
                    "
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stage list */}
              <div className="
                w-full max-w-sm
                flex flex-col gap-1.5
              ">
                {VIDEO_GENERATION_STAGES.map((s, i) => {
                  const currentStageIndex = VIDEO_GENERATION_STAGES.indexOf(stage)
                  const isDone    = i < currentStageIndex
                  const isCurrent = i === currentStageIndex

                  return (
                    <div
                      key={i}
                      className={`
                        flex items-center gap-2
                        text-xs transition-all duration-300
                        ${isDone    ? 'text-[#4ade80]'       : ''}
                        ${isCurrent ? 'text-[var(--text)]'   : ''}
                        ${!isDone && !isCurrent ? 'text-[var(--subtle)]' : ''}
                      `}
                    >
                      <span className="shrink-0">
                        {isDone    ? '✅' : isCurrent ? '⚡' : '⬜'}
                      </span>
                      <span>{s.replace(/^[^\s]+\s/, '')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !generatedVideo && (
            <div className="
              flex flex-col items-center justify-center
              gap-4 text-center p-8
            ">
              <div className="
                w-20 h-20 rounded-2xl bg-[var(--border)]
                flex items-center justify-center
              ">
                <Video size={36} className="text-[var(--subtle)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--muted)]">
                  Your video will appear here
                </p>
                <p className="text-xs text-[var(--subtle)] mt-1">
                  Enter a prompt and click Generate
                </p>
              </div>

              {/* Tips */}
              <div className="
                w-full max-w-sm mt-4
                bg-[var(--border)] rounded-xl p-4
                text-left
              ">
                <p className="
                  text-xs font-semibold text-[var(--text)] mb-2
                ">
                  💡 Tips for better videos
                </p>
                <ul className="text-xs text-[var(--muted)] flex flex-col gap-1">
                  <li>• Be specific about motion and movement</li>
                  <li>• Describe lighting and atmosphere</li>
                  <li>• Mention camera angle if needed</li>
                  <li>• Keep prompts under 100 words</li>
                </ul>
              </div>
            </div>
          )}

          {/* Generated video */}
          {!loading && generatedVideo && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <video
                ref={videoRef}
                src={generatedVideo}
                controls
                autoPlay
                loop
                className="
                  max-w-full max-h-full rounded-xl
                  shadow-[0_20px_60px_rgba(0,0,0,0.4)]
                  animate-fade-in
                "
              />
            </div>
          )}
        </div>

        {/* Actions bar */}
        {generatedVideo && !loading && (
          <div className="
            flex items-center justify-between
            bg-[var(--panel)] border border-[var(--border)]
            rounded-2xl px-4 py-3
            animate-fade-up
          ">
            <div className="flex items-center gap-3 flex-wrap">
              {genTime && (
                <span className="
                  flex items-center gap-1.5 text-xs text-[var(--muted)]
                ">
                  <Clock size={12} />
                  {(genTime / 1000).toFixed(0)}s
                </span>
              )}
              <Badge variant="default" size="sm">
                {currentStyle.emoji} {currentStyle.label}
              </Badge>
              <Badge variant="default" size="sm">
                {currentDuration.label}
              </Badge>
              <Badge variant="default" size="sm">
                {currentQuality.label}
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
