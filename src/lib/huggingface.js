// ── NEW endpoint (old one deprecated) ─────────
const HF_API = 'https://router.huggingface.co/hf-inference/models'

// ── Models ─────────────────────────────────────
const MODELS = {
  default:   'stabilityai/stable-diffusion-xl-base-1.0',
  fast:      'stabilityai/sdxl-turbo',
  realistic: 'runwayml/stable-diffusion-v1-5',
  anime:     'Linaqruf/anything-v3.0',
}

// ── Style → prompt modifiers ───────────────────
const STYLE_PROMPTS = {
  'photorealistic': 'photorealistic, ultra detailed, 8k resolution, professional photography, sharp focus, natural lighting, RAW photo',
  'digital-art':    'digital art, vibrant colors, artstation trending, highly detailed, concept art, smooth rendering',
  'anime':          'anime style, studio ghibli inspired, detailed illustration, vibrant colors, manga art, 2d animation',
  'oil-painting':   'oil painting, classical art style, visible brush strokes, canvas texture, masterpiece, renaissance',
  'watercolor':     'watercolor painting, soft pastel colors, artistic, flowing paint, paper texture, impressionist',
  'sketch':         'pencil sketch, detailed line art, graphite drawing, black and white, hand drawn, cross hatching',
  'cinematic':      'cinematic photography, dramatic lighting, movie still, anamorphic lens, film grain, color graded',
  'fantasy':        'fantasy art, magical atmosphere, epic environment, concept art, highly detailed, mythical',
  '3d-render':      '3d render, octane render, cinema4d, physically based rendering, glossy materials, studio lighting',
  'pixel-art':      'pixel art, retro game style, 16-bit graphics, clean pixels, game sprite, limited color palette',
  'minimalist':     'minimalist design, clean composition, simple shapes, modern aesthetic, geometric forms, flat design',
  'cyberpunk':      'cyberpunk aesthetic, neon lights, futuristic city, rain reflections, dark atmosphere, blade runner style',
}

// ── Negative prompt ────────────────────────────
const NEGATIVE_PROMPT = [
  'blurry', 'bad quality', 'distorted', 'ugly',
  'low resolution', 'watermark', 'text', 'signature',
  'deformed', 'extra limbs', 'bad anatomy', 'disfigured',
  'poorly drawn', 'mutation', 'duplicate', 'out of frame',
  'jpeg artifacts', 'noise', 'grainy', 'overexposed',
].join(', ')

// ── Sleep helper ───────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── Main generate function ─────────────────────
export async function generateImage({
  prompt,
  style    = 'photorealistic',
  size     = '512x512',
  retries  = 4,
  waitTime = 30000,
}) {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    throw new Error(
      '🔑 HUGGINGFACE_API_KEY is not set in .env.local — ' +
      'get a free key at https://huggingface.co/settings/tokens'
    )
  }

  if (!prompt?.trim()) {
    throw new Error('Prompt is required')
  }

  // ── Parse size ─────────────────────────────────
  const parts  = size.split('x').map(Number)
  const width  = Math.min(parts[0] || 512, 1024)
  const height = Math.min(parts[1] || 512, 1024)

  // ── Build prompt ───────────────────────────────
  const styleModifier = STYLE_PROMPTS[style] || STYLE_PROMPTS['photorealistic']
  const fullPrompt    = `${prompt.trim()}, ${styleModifier}`

  // ── Pick model ─────────────────────────────────
  const model = style === 'anime' ? MODELS.anime : MODELS.default

  console.log(`🎨 Generating: model=${model} style=${style} size=${width}x${height}`)

  // ── Retry loop ─────────────────────────────────
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${retries}...`)

      const res = await fetch(`${HF_API}/${model}`, {
        method:  'POST',
        headers: {
          'Authorization':    `Bearer ${apiKey}`,
          'Content-Type':     'application/json',
          'x-wait-for-model': 'true',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            negative_prompt:       NEGATIVE_PROMPT,
            width,
            height,
            num_inference_steps:   30,
            guidance_scale:        7.5,
            num_images_per_prompt: 1,
          },
        }),
      })

      // ── 503 — model loading ────────────────────
      if (res.status === 503) {
        let waitMs = waitTime
        try {
          const data = await res.json()
          console.log(`  ⏳ Model loading — est: ${data.estimated_time}s`)
          waitMs = Math.min((data.estimated_time || 25) * 1000 + 5000, 60000)
        } catch { /* ignore */ }

        if (attempt < retries) {
          console.log(`  Waiting ${Math.round(waitMs / 1000)}s...`)
          await sleep(waitMs)
          continue
        }
        throw new Error('⏳ Model is warming up. Please wait 30 seconds and try again.')
      }

      // ── 429 — rate limited ─────────────────────
      if (res.status === 429) {
        if (attempt < retries) {
          console.log('  Rate limited — waiting 20s...')
          await sleep(20000)
          continue
        }
        throw new Error('⏳ Rate limit reached. Please wait a minute and try again.')
      }

      // ── 401 / 403 — bad key ────────────────────
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          '🔑 Invalid Hugging Face API key. ' +
          'Check HUGGINGFACE_API_KEY in .env.local'
        )
      }

      // ── Other errors ───────────────────────────
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let   msg  = `Hugging Face error (${res.status})`
        try {
          const json = JSON.parse(text)
          msg = json.error || json.message || msg
        } catch { /* not JSON */ }

        console.log(`  Error: ${msg}`)

        if (attempt < retries) {
          await sleep(5000)
          continue
        }
        throw new Error(msg)
      }

      // ── Success ────────────────────────────────
      const contentType = res.headers.get('content-type') || 'image/jpeg'

      // Guard: sometimes 200 with JSON error body
      if (!contentType.startsWith('image/')) {
        const text = await res.text()
        try {
          const json = JSON.parse(text)
          if (json.error) throw new Error(json.error)
        } catch { /* not JSON */ }
        throw new Error('Unexpected response — expected image but got: ' + contentType)
      }

      const blob    = await res.blob()
      const buffer  = await blob.arrayBuffer()
      const base64  = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:${contentType};base64,${base64}`

      console.log(`  ✅ Done (${Math.round(blob.size / 1024)}KB)`)

      return {
        imageUrl: dataUrl,
        prompt:   fullPrompt,
        style,
        size:     `${width}x${height}`,
        model,
      }

    } catch (err) {
      if (attempt === retries) throw err

      // Don't retry auth errors
      if (
        err.message.includes('Invalid Hugging Face') ||
        err.message.includes('HUGGINGFACE_API_KEY')
      ) throw err

      console.log(`  Attempt ${attempt} failed: ${err.message} — retrying...`)
      await sleep(4000)
    }
  }

  throw new Error('Image generation failed after all retries.')
}

// ── Validate API key ───────────────────────────
export async function checkHFApiKey() {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) return { valid: false, error: 'No API key set' }

  try {
    const res = await fetch('https://huggingface.co/api/whoami', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    if (res.ok) {
      const data = await res.json()
      return { valid: true, username: data.name }
    }
    return { valid: false, error: 'Invalid API key' }
  } catch {
    return { valid: false, error: 'Network error' }
  }
}