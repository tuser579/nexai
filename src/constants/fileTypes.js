// ── All accepted file types for media analysis ────
export const ACCEPTED_FILE_TYPES = {
  // ── Images ─────────────────────────────────
  'image/jpeg': {
    label:     'Image',
    ext:       'JPG',
    emoji:     '🖼️',
    color:     '#6c63ff',
    maxSize:   20,    // MB
    canPreview: true,
  },
  'image/png': {
    label:     'Image',
    ext:       'PNG',
    emoji:     '🖼️',
    color:     '#6c63ff',
    maxSize:   20,
    canPreview: true,
  },
  'image/webp': {
    label:     'Image',
    ext:       'WebP',
    emoji:     '🖼️',
    color:     '#6c63ff',
    maxSize:   20,
    canPreview: true,
  },
  'image/gif': {
    label:     'GIF',
    ext:       'GIF',
    emoji:     '🎞️',
    color:     '#a78bfa',
    maxSize:   10,
    canPreview: true,
  },
  'image/svg+xml': {
    label:     'SVG',
    ext:       'SVG',
    emoji:     '🖼️',
    color:     '#6c63ff',
    maxSize:   5,
    canPreview: true,
  },

  // ── Documents ──────────────────────────────
  'application/pdf': {
    label:     'PDF',
    ext:       'PDF',
    emoji:     '📄',
    color:     '#ff6584',
    maxSize:   20,
    canPreview: false,
  },
  'text/plain': {
    label:     'Text',
    ext:       'TXT',
    emoji:     '📝',
    color:     '#06b6d4',
    maxSize:   5,
    canPreview: false,
  },
  'application/msword': {
    label:     'Word',
    ext:       'DOC',
    emoji:     '📝',
    color:     '#3b82f6',
    maxSize:   20,
    canPreview: false,
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    label:     'Word',
    ext:       'DOCX',
    emoji:     '📝',
    color:     '#3b82f6',
    maxSize:   20,
    canPreview: false,
  },

  // ── Video ───────────────────────────────────
  'video/mp4': {
    label:     'Video',
    ext:       'MP4',
    emoji:     '🎬',
    color:     '#f59e0b',
    maxSize:   20,
    canPreview: true,
  },
  'video/webm': {
    label:     'Video',
    ext:       'WebM',
    emoji:     '🎬',
    color:     '#f59e0b',
    maxSize:   20,
    canPreview: true,
  },
  'video/quicktime': {
    label:     'Video',
    ext:       'MOV',
    emoji:     '🎬',
    color:     '#f59e0b',
    maxSize:   20,
    canPreview: true,
  },

  // ── Audio ───────────────────────────────────
  'audio/mpeg': {
    label:     'Audio',
    ext:       'MP3',
    emoji:     '🎵',
    color:     '#10b981',
    maxSize:   20,
    canPreview: true,
  },
  'audio/wav': {
    label:     'Audio',
    ext:       'WAV',
    emoji:     '🎵',
    color:     '#10b981',
    maxSize:   20,
    canPreview: true,
  },
  'audio/mp4': {
    label:     'Audio',
    ext:       'M4A',
    emoji:     '🎵',
    color:     '#10b981',
    maxSize:   20,
    canPreview: true,
  },
  'audio/ogg': {
    label:     'Audio',
    ext:       'OGG',
    emoji:     '🎵',
    color:     '#10b981',
    maxSize:   20,
    canPreview: true,
  },
  'audio/webm': {
    label:     'Audio',
    ext:       'WebM',
    emoji:     '🎵',
    color:     '#10b981',
    maxSize:   20,
    canPreview: true,
  },
}

// ── Accept string for file input ──────────────────
export const ACCEPT_STRING = Object.keys(ACCEPTED_FILE_TYPES).join(',')

// ── Max file size (MB) ────────────────────────────
export const MAX_FILE_SIZE_MB = 20

// ── Get file info by mime type ────────────────────
export function getFileInfo(mimeType) {
  return (
    ACCEPTED_FILE_TYPES[mimeType] || {
      label:     'File',
      ext:       'FILE',
      emoji:     '📁',
      color:     '#6b7280',
      maxSize:   20,
      canPreview: false,
    }
  )
}

// ── Check if file is accepted ─────────────────────
export function isFileAccepted(mimeType) {
  return !!ACCEPTED_FILE_TYPES[mimeType]
}

// ── Get file category ─────────────────────────────
export function getFileCategory(mimeType) {
  if (mimeType.startsWith('image/'))  return 'image'
  if (mimeType.startsWith('video/'))  return 'video'
  if (mimeType.startsWith('audio/'))  return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('text/'))   return 'text'
  return 'other'
}

// ── Quick action prompts per file category ────────
export const QUICK_ACTIONS = {
  image: [
    'Describe this image in detail',
    'Extract all text from this image',
    'Identify all objects and people',
    'Analyze the colors and composition',
    'What mood or emotion does this convey?',
    'Is there anything unusual or interesting?',
  ],
  pdf: [
    'Summarize this document',
    'List all the key points',
    'Extract all action items',
    'What are the main conclusions?',
    'Create a bullet point outline',
    'Find any important dates or numbers',
  ],
  video: [
    'Describe the video content',
    'Summarize what happens',
    'Extract any text shown on screen',
    'Identify key moments',
  ],
  audio: [
    'Transcribe this audio',
    'Summarize the content',
    'How many speakers are there?',
    'What language is spoken?',
  ],
  text: [
    'Summarize this document',
    'List the key points',
    'Fix any grammar errors',
    'Translate to English',
  ],
  other: [
    'Analyze this file',
    'Summarize the content',
    'Extract key information',
  ],
}