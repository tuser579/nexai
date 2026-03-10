// ── Image generation styles ───────────────────────
export const IMAGE_STYLES = [
  {
    id:          'photorealistic',
    label:       'Photorealistic',
    emoji:       '📸',
    description: 'Ultra realistic photography',
    prompt:      'photorealistic, ultra detailed, 8k, professional photography',
    color:       '#6c63ff',
  },
  {
    id:          'anime',
    label:       'Anime',
    emoji:       '🎌',
    description: 'Japanese anime illustration style',
    prompt:      'anime style, manga art, vibrant colors, detailed illustration',
    color:       '#ff6584',
  },
  {
    id:          'oil-painting',
    label:       'Oil Painting',
    emoji:       '🎨',
    description: 'Classical oil painting on canvas',
    prompt:      'oil painting, classical art, canvas texture, painterly style, brushstrokes',
    color:       '#f59e0b',
  },
  {
    id:          'watercolor',
    label:       'Watercolor',
    emoji:       '💧',
    description: 'Soft watercolor illustration',
    prompt:      'watercolor illustration, soft colors, paper texture, artistic, flowing',
    color:       '#06b6d4',
  },
  {
    id:          'cyberpunk',
    label:       'Cyberpunk',
    emoji:       '🌆',
    description: 'Futuristic neon cyberpunk style',
    prompt:      'cyberpunk style, neon lights, futuristic, dark atmosphere, glowing',
    color:       '#a78bfa',
  },
  {
    id:          '3d-render',
    label:       '3D Render',
    emoji:       '🎮',
    description: 'High quality 3D rendered image',
    prompt:      '3D render, octane render, high quality, detailed, studio lighting',
    color:       '#4ade80',
  },
  {
    id:          'sketch',
    label:       'Sketch',
    emoji:       '✏️',
    description: 'Hand drawn pencil sketch',
    prompt:      'pencil sketch, hand drawn, black and white, detailed linework',
    color:       '#e8e8f0',
  },
  {
    id:          'pixel-art',
    label:       'Pixel Art',
    emoji:       '👾',
    description: 'Retro pixel art style',
    prompt:      'pixel art, retro game style, 16-bit, pixelated, vibrant colors',
    color:       '#f97316',
  },
  {
    id:          'fantasy',
    label:       'Fantasy',
    emoji:       '🧙',
    description: 'Epic fantasy art style',
    prompt:      'fantasy art, epic, magical, detailed, dramatic lighting, mystical',
    color:       '#8b5cf6',
  },
  {
    id:          'minimalist',
    label:       'Minimalist',
    emoji:       '⬜',
    description: 'Clean minimal design',
    prompt:      'minimalist design, clean, simple, elegant, white background, flat',
    color:       '#6b7280',
  },
]

// ── Image sizes ───────────────────────────────────
export const IMAGE_SIZES = [
  {
    id:     '512x512',
    label:  '512 × 512',
    width:  512,
    height: 512,
    aspect: '1:1',
    emoji:  '⬛',
  },
  {
    id:     '768x512',
    label:  '768 × 512',
    width:  768,
    height: 512,
    aspect: '3:2',
    emoji:  '▬',
  },
  {
    id:     '512x768',
    label:  '512 × 768',
    width:  512,
    height: 768,
    aspect: '2:3',
    emoji:  '▮',
  },
  {
    id:     '1024x1024',
    label:  '1024 × 1024',
    width:  1024,
    height: 1024,
    aspect: '1:1',
    emoji:  '⬛',
    slow:   true, // takes longer
  },
]

// ── Default values ────────────────────────────────
export const DEFAULT_IMAGE_STYLE = 'photorealistic'
export const DEFAULT_IMAGE_SIZE  = '512x512'

// ── Get style by id ───────────────────────────────
export function getStyleById(id) {
  return IMAGE_STYLES.find((s) => s.id === id) || IMAGE_STYLES[0]
}

// ── Get size by id ────────────────────────────────
export function getSizeById(id) {
  return IMAGE_SIZES.find((s) => s.id === id) || IMAGE_SIZES[0]
}

// ── Build full prompt with style ──────────────────
export function buildImagePrompt(userPrompt, styleId) {
  const style = getStyleById(styleId)
  return `${userPrompt}, ${style.prompt}, high quality, detailed`
}

// ── Negative prompt (always added) ───────────────
export const NEGATIVE_PROMPT =
  'blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, text, signature'