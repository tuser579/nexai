// ── Video generation styles ───────────────────────
export const VIDEO_STYLES = [
  {
    id:          'cinematic',
    label:       'Cinematic',
    emoji:       '🎬',
    description: 'Hollywood movie style footage',
    prompt:      'cinematic, film quality, dramatic lighting, movie scene',
    color:       '#6c63ff',
  },
  {
    id:          'anime',
    label:       'Anime',
    emoji:       '🎌',
    description: 'Animated anime style video',
    prompt:      'anime style, animated, vibrant, smooth motion',
    color:       '#ff6584',
  },
  {
    id:          'realistic',
    label:       'Realistic',
    emoji:       '📹',
    description: 'Lifelike realistic video',
    prompt:      'realistic, photorealistic, natural lighting, detailed',
    color:       '#4ade80',
  },
  {
    id:          'abstract',
    label:       'Abstract',
    emoji:       '🌀',
    description: 'Abstract artistic visuals',
    prompt:      'abstract art, flowing shapes, colorful, artistic motion',
    color:       '#f59e0b',
  },
  {
    id:          'stop-motion',
    label:       'Stop Motion',
    emoji:       '🧸',
    description: 'Claymation stop motion style',
    prompt:      'stop motion animation, claymation style, handcrafted',
    color:       '#a78bfa',
  },
  {
    id:          '3d-animation',
    label:       '3D Animation',
    emoji:       '🎮',
    description: 'Smooth 3D animated video',
    prompt:      '3D animation, CGI, smooth motion, rendered, detailed',
    color:       '#06b6d4',
  },
]

// ── Video durations ───────────────────────────────
export const VIDEO_DURATIONS = [
  {
    id:      '3s',
    label:   '3 seconds',
    frames:  8,
    fast:    true,
    credits: 'Low',
  },
  {
    id:      '5s',
    label:   '5 seconds',
    frames:  16,
    fast:    true,
    credits: 'Medium',
  },
  {
    id:      '10s',
    label:   '10 seconds',
    frames:  24,
    fast:    false,
    credits: 'High',
  },
  {
    id:      '15s',
    label:   '15 seconds',
    frames:  32,
    fast:    false,
    credits: 'Very High',
  },
]

// ── Video quality options ─────────────────────────
export const VIDEO_QUALITY = [
  {
    id:          'draft',
    label:       'Draft',
    steps:       15,
    description: 'Fast, lower quality',
    color:       '#6b7280',
  },
  {
    id:          'standard',
    label:       'Standard',
    steps:       25,
    description: 'Balanced quality and speed',
    color:       '#6c63ff',
  },
  {
    id:          'high',
    label:       'High Quality',
    steps:       40,
    description: 'Best quality, slower',
    color:       '#4ade80',
  },
]

// ── Default values ────────────────────────────────
export const DEFAULT_VIDEO_STYLE    = 'cinematic'
export const DEFAULT_VIDEO_DURATION = '5s'
export const DEFAULT_VIDEO_QUALITY  = 'standard'

// ── Get style by id ───────────────────────────────
export function getVideoStyleById(id) {
  return VIDEO_STYLES.find((s) => s.id === id) || VIDEO_STYLES[0]
}

// ── Get duration by id ────────────────────────────
export function getVideoDurationById(id) {
  return VIDEO_DURATIONS.find((d) => d.id === id) || VIDEO_DURATIONS[1]
}

// ── Build full video prompt ───────────────────────
export function buildVideoPrompt(userPrompt, styleId) {
  const style = getVideoStyleById(styleId)
  return `${userPrompt}, ${style.prompt}, smooth motion, high quality`
}

// ── Generation stages (for progress UI) ──────────
export const VIDEO_GENERATION_STAGES = [
  '🎬 Parsing scene description...',
  '🎨 Generating keyframes...',
  '🎞️ Animating transitions...',
  '✨ Rendering motion...',
  '🎵 Synthesizing frames...',
  '📦 Encoding video...',
  '✅ Finalizing...',
]
