// ── Generate chat title from message ─────────────
export function generateChatTitle(content) {
  if (!content) return 'New Chat'
  const cleaned = content.trim().replace(/[^\w\s]/g, '')
  return cleaned.length > 45
    ? cleaned.substring(0, 45).trim() + '...'
    : cleaned
}

// ── Format date to readable string ───────────────
export function formatDate(date) {
  if (!date) return ''
  const d    = new Date(date)
  const now  = new Date()
  const diff = now - d

  if (diff < 60000)       return 'Just now'
  if (diff < 3600000)     return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000)    return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000)   return `${Math.floor(diff / 86400000)}d ago`

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

// ── Merge class names ─────────────────────────────
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// ── Get default analysis prompt by file type ─────
export function getAnalysisPrompt(mimeType) {
  if (mimeType.startsWith('image/')) {
    return 'Analyze this image in detail. Describe what you see, identify objects, text, people, colors, and any interesting details. Be thorough and structured.'
  }
  if (mimeType === 'application/pdf') {
    return 'Analyze this PDF document. Provide a comprehensive summary, list the key points, identify main topics, and highlight any important data or conclusions.'
  }
  if (mimeType.startsWith('video/')) {
    return 'Analyze this video. Describe the content, what is happening, any text or speech present, and summarize the key moments.'
  }
  if (mimeType.startsWith('audio/')) {
    return 'Transcribe and analyze this audio. Provide the full transcription if speech is present, identify speakers if possible, and summarize the content.'
  }
  return 'Analyze this file and provide detailed information about its content, structure, and key information.'
}

// ── Format file size ──────────────────────────────
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k     = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i     = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ── Check if file type is accepted ───────────────
export function isAcceptedFileType(mimeType) {
  const accepted = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg',
    'text/plain',
  ]
  return accepted.includes(mimeType)
}

// ── Truncate text ─────────────────────────────────
export function truncate(text, length = 50) {
  if (!text) return ''
  return text.length > length
    ? text.substring(0, length).trim() + '...'
    : text
}

// ── Sleep helper ──────────────────────────────────
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
