'use client'
import { useState, useRef, useCallback } from 'react'
import Badge           from '@/components/ui/Badge'
import Button          from '@/components/ui/Button'
import {
  ACCEPTED_FILE_TYPES,
  ACCEPT_STRING,
  MAX_FILE_SIZE_MB,
  getFileInfo,
  getFileCategory,
  QUICK_ACTIONS,
} from '@/constants/fileTypes'
import {
  Upload, X, FileText, Image,
  Video, Music, File, Sparkles,
} from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

// ── File type icon ─────────────────────────────────
function FileIcon({ mimeType, size = 24 }) {
  if (mimeType?.startsWith('image/')) return <Image  size={size} />
  if (mimeType?.startsWith('video/')) return <Video  size={size} />
  if (mimeType?.startsWith('audio/')) return <Music  size={size} />
  if (mimeType === 'application/pdf') return <FileText size={size} />
  return <File size={size} />
}

export default function MediaUpload({
  onFileSelect,
  onAnalyze,
  selectedFile,
  onClearFile,
  isAnalyzing = false,
  prompt,
  setPrompt,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview,    setPreview]    = useState(null)
  const fileInputRef                = useRef(null)

  // ── Drag handlers ──────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  // ── Process file ───────────────────────────────
  function processFile(file) {
    // Check file type
    if (!ACCEPTED_FILE_TYPES[file.type]) {
      alert(`File type "${file.type}" is not supported.`)
      return
    }

    // Check file size
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if (file.size > maxBytes) {
      alert(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    onFileSelect(file)
  }

  // ── Input change ───────────────────────────────
  function handleInputChange(e) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  // ── Clear file ─────────────────────────────────
  function handleClear() {
    setPreview(null)
    onClearFile()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ── Quick action ───────────────────────────────
  function handleQuickAction(text) {
    setPrompt(text)
  }

  const fileInfo = selectedFile
    ? getFileInfo(selectedFile.type)
    : null
  const category = selectedFile
    ? getFileCategory(selectedFile.type)
    : null
  const quickActions = category
    ? QUICK_ACTIONS[category] || QUICK_ACTIONS.other
    : []

  return (
    <div className="flex flex-col gap-4">

      {/* ── Drop Zone ──────────────────────────── */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center
            gap-4 p-10 rounded-2xl cursor-pointer
            border-2 border-dashed
            transition-all duration-200
            ${isDragging
              ? 'border-[#6c63ff] bg-[#6c63ff11] scale-[1.01]'
              : 'border-[var(--border)] bg-[var(--panel)] hover:border-[#6c63ff66] hover:bg-[#6c63ff08]'
            }
          `}
        >
          {/* Icon */}
          <div className={`
            w-16 h-16 rounded-2xl
            flex items-center justify-center
            transition-all duration-200
            ${isDragging
              ? 'bg-[#6c63ff33] text-[#6c63ff]'
              : 'bg-[var(--border)] text-[var(--muted)]'
            }
          `}>
            <Upload size={28} />
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text)]">
              {isDragging
                ? 'Drop your file here'
                : 'Drag & drop or click to upload'
              }
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Max {MAX_FILE_SIZE_MB}MB · Images, PDFs, Video, Audio
            </p>
          </div>

          {/* Supported types */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {[
              { emoji: '🖼️', label: 'Image' },
              { emoji: '📄', label: 'PDF'   },
              { emoji: '🎬', label: 'Video' },
              { emoji: '🎵', label: 'Audio' },
              { emoji: '📝', label: 'Text'  },
            ].map((t) => (
              <Badge key={t.label} variant="default" size="sm">
                {t.emoji} {t.label}
              </Badge>
            ))}
          </div>

          {/* Hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_STRING}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (

        /* ── File Preview ──────────────────────── */
        <div className="
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl overflow-hidden
        ">

          {/* Image preview */}
          {preview && (
            <div className="
              relative w-full max-h-64
              bg-[var(--border)] overflow-hidden
            ">
              <img
                src={preview}
                alt="Preview"
                className="
                  w-full h-full object-contain max-h-64
                "
              />
            </div>
          )}

          {/* File info */}
          <div className="p-4 flex items-center gap-3">
            <div
              className="
                w-10 h-10 rounded-xl shrink-0
                flex items-center justify-center
              "
              style={{ background: fileInfo?.color + '22' }}
            >
              <span style={{ color: fileInfo?.color }}>
                <FileIcon mimeType={selectedFile.type} size={20} />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="
                text-sm font-medium text-[var(--text)] truncate
              ">
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="primary"
                  size="xs"
                  style={{ background: fileInfo?.color + '22', color: fileInfo?.color }}
                >
                  {fileInfo?.ext}
                </Badge>
                <span className="text-xs text-[var(--muted)]">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
            </div>

            {/* Clear button */}
            <button
              onClick={handleClear}
              className="
                w-8 h-8 rounded-xl shrink-0
                flex items-center justify-center
                text-[var(--muted)] hover:text-[#f87171]
                hover:bg-[#f8717122]
                transition-all cursor-pointer
              "
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Prompt Input ───────────────────────── */}
      {selectedFile && (
        <div className="flex flex-col gap-3 animate-fade-in">

          {/* Quick actions */}
          {quickActions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs
                      border transition-all cursor-pointer
                      ${prompt === action
                        ? 'bg-[#6c63ff22] text-[#6c63ff] border-[#6c63ff44]'
                        : 'bg-[var(--panel)] text-[var(--muted)] border-[var(--border)] hover:border-[#6c63ff44] hover:text-[var(--text)]'
                      }
                    `}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom prompt */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything about this file..."
              rows={3}
              className="
                w-full bg-[var(--input)] text-[var(--text)]
                border border-[var(--border)] rounded-xl
                px-4 py-3 text-sm resize-none outline-none
                placeholder:text-[var(--muted)]
                focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_#6c63ff22]
                transition-all duration-200
              "
            />
          </div>

          {/* Analyze button */}
          <Button
            onClick={onAnalyze}
            loading={isAnalyzing}
            disabled={isAnalyzing}
            fullWidth
            icon={<Sparkles size={16} />}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
          </Button>
        </div>
      )}
    </div>
  )
}