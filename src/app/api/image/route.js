import { NextResponse }     from 'next/server'
import { getServerSession } from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import User                 from '@/models/User'
import ImageHistory         from '@/models/ImageHistory'

// ── NEW Hugging Face router endpoint ──────────
const HF_BASE = 'https://router.huggingface.co/hf-inference/models'
const MODEL   = 'stabilityai/stable-diffusion-xl-base-1.0'

const STYLE_PROMPTS = {
  'photorealistic': 'photorealistic, ultra detailed, 8k, professional photography, sharp focus, RAW photo',
  'digital-art':    'digital art, vibrant colors, artstation trending, highly detailed, concept art',
  'anime':          'anime style, studio ghibli, detailed illustration, vibrant colors, manga art',
  'oil-painting':   'oil painting, classical art, brush strokes, canvas texture, masterpiece',
  'watercolor':     'watercolor painting, soft pastel colors, artistic, flowing paint, paper texture',
  'sketch':         'pencil sketch, detailed line art, graphite, black and white, hand drawn',
  'cinematic':      'cinematic photography, dramatic lighting, movie still, anamorphic lens, film grain',
  'fantasy':        'fantasy art, magical atmosphere, epic environment, concept art, mythical',
  '3d-render':      '3d render, octane render, cinema4d, physically based rendering, studio lighting',
  'pixel-art':      'pixel art, retro game style, 16-bit, clean pixels, limited color palette',
  'minimalist':     'minimalist design, clean, simple shapes, modern aesthetic, geometric, flat',
  'cyberpunk':      'cyberpunk, neon lights, futuristic city, rain, dark atmosphere, blade runner',
}

const NEGATIVE_PROMPT = 'blurry, bad quality, distorted, ugly, low resolution, watermark, text, signature, deformed, extra limbs, bad anatomy, poorly drawn, noise, grainy'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── Parse size string → width/height ──────────
function parseSize(size = '512x512') {
  const [w, h] = size.split('x').map(Number)
  return {
    width:  Math.min(w || 512, 1024),
    height: Math.min(h || 512, 1024),
  }
}

// ── POST — Generate image ─────────────────────
export async function POST(req) {
  try {
    // ── Auth ───────────────────────────────────
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized — please log in' },
        { status: 401 }
      )
    }

    // ── Body ───────────────────────────────────
    const body = await req.json()
    const {
      prompt = '',
      style  = 'photorealistic',
      size   = '512x512',
    } = body

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // ── API key ────────────────────────────────
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '🔑 HUGGINGFACE_API_KEY not set in .env.local' },
        { status: 400 }
      )
    }

    // ── Build prompt ───────────────────────────
    const styleTag    = STYLE_PROMPTS[style] || STYLE_PROMPTS['photorealistic']
    const fullPrompt  = `${prompt.trim()}, ${styleTag}`
    const { width, height } = parseSize(size)
    const startTime   = Date.now()

    console.log(`🎨 Image request — style: ${style}, size: ${width}x${height}`)
    console.log(`   Prompt: ${fullPrompt.slice(0, 80)}...`)

    // ── Call HF router with retry ──────────────
    let imageUrl    = null
    const maxRetries = 4

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`   Attempt ${attempt}/${maxRetries}...`)

      const res = await fetch(`${HF_BASE}/${MODEL}`, {
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

      console.log(`   HF status: ${res.status}`)

      // ── 503 model loading ──────────────────
      if (res.status === 503) {
        let waitMs = 25000
        try {
          const data = await res.json()
          console.log(`   Model loading, est: ${data.estimated_time}s`)
          waitMs = Math.min((data.estimated_time || 25) * 1000 + 5000, 55000)
        } catch { /* ignore */ }

        if (attempt < maxRetries) {
          console.log(`   Waiting ${Math.round(waitMs / 1000)}s...`)
          await sleep(waitMs)
          continue
        }
        return NextResponse.json(
          {
            error:   '⏳ Model warming up.',
            message: 'The AI model is warming up. Please wait 30 seconds and try again.',
            retry:   true,
          },
          { status: 503 }
        )
      }

      // ── 429 rate limit ─────────────────────
      if (res.status === 429) {
        if (attempt < maxRetries) {
          console.log('   Rate limited — waiting 20s...')
          await sleep(20000)
          continue
        }
        return NextResponse.json(
          { error: '⏳ Rate limit reached. Please wait and try again.' },
          { status: 429 }
        )
      }

      // ── 401 / 403 bad key ──────────────────
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { error: '🔑 Invalid Hugging Face API key. Check .env.local' },
          { status: 401 }
        )
      }

      // ── Other errors ───────────────────────
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let   msg  = `Hugging Face error (${res.status})`
        try {
          const json = JSON.parse(text)
          msg = json.error || json.message || msg
        } catch { /* not JSON */ }

        console.error(`   HuggingFace error: ${msg}`)

        if (attempt < maxRetries) {
          await sleep(5000)
          continue
        }
        return NextResponse.json({ error: msg }, { status: 500 })
      }

      // ── Success — parse image ───────────────
      const contentType = res.headers.get('content-type') || 'image/jpeg'

      if (!contentType.startsWith('image/')) {
        const text = await res.text().catch(() => '')
        let   msg  = 'Unexpected response format'
        try {
          const json = JSON.parse(text)
          msg = json.error || msg
        } catch { /* not JSON */ }

        if (attempt < maxRetries) {
          await sleep(4000)
          continue
        }
        return NextResponse.json({ error: msg }, { status: 500 })
      }

      const blob   = await res.blob()
      const buffer = await blob.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      imageUrl     = `data:${contentType};base64,${base64}`

      console.log(`   ✅ Image ready (${Math.round(blob.size / 1024)}KB)`)
      break
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image generation failed. Please try again.' },
        { status: 500 }
      )
    }

    const genTime = Date.now() - startTime

    // ── Save to DB ─────────────────────────────
    try {
      await connectDB()

      const imageRecord = await ImageHistory.create({
        userId:         session.user.id,
        prompt:         prompt.trim(),
        imageUrl,
        style:          style || 'photorealistic',
        size:           size  || '512x512',
        width,
        height,
        provider:       'huggingface',
        model:          MODEL,
        generationTime: genTime,
      })

      // Update user stats
      await User.findByIdAndUpdate(session.user.id, {
        $inc: { 'stats.totalImages': 1 },
      })

      return NextResponse.json({
        imageUrl,
        id:             imageRecord._id,
        generationTime: genTime,
        prompt:         prompt.trim(),
        style:          style || 'photorealistic',
        size:           size  || '512x512',
      })

    } catch (dbErr) {
      console.error('DB save error (non-fatal):', dbErr)

      // Still return image even if DB save fails
      return NextResponse.json({
        imageUrl,
        generationTime: genTime,
        prompt:         prompt.trim(),
        style:          style || 'photorealistic',
        size:           size  || '512x512',
      })
    }

  } catch (err) {
    console.error('Image generation error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}