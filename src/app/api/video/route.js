import { NextResponse }     from 'next/server'
import { getServerSession } from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import User                 from '@/models/User'

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

    const body = await req.json()
    const {
      prompt   = '',
      style    = 'cinematic',
      duration = '5s',
      quality  = 'standard',
    } = body

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN
    if (!replicateToken) {
      return NextResponse.json(
        { error: '🔑 REPLICATE_API_TOKEN not set in .env.local' },
        { status: 400 }
      )
    }

    // ── Call Replicate ─────────────────────────
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${replicateToken}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        version: 'a4a8bafd6089e1716b06057c42b19378250d008b80fe87caa5cd36d40c1eda90',
        input: {
          prompt:          `${prompt.trim()}, ${style} style`,
          num_frames:      duration === '3s' ? 24 : duration === '5s' ? 40 : 64,
          num_inference_steps: quality === 'high' ? 50 : 25,
          fps:             8,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail || 'Video generation failed' },
        { status: response.status }
      )
    }

    const prediction = await response.json()

    // ── Poll for result ────────────────────────
    let result = prediction
    let polls  = 0

    while (
      result.status !== 'succeeded' &&
      result.status !== 'failed'    &&
      polls < 60
    ) {
      await new Promise((r) => setTimeout(r, 3000))
      polls++

      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            'Authorization': `Bearer ${replicateToken}`,
          },
        }
      )
      result = await pollRes.json()
      console.log(`Video poll ${polls}: ${result.status}`)
    }

    if (result.status === 'failed') {
      return NextResponse.json(
        { error: result.error || 'Video generation failed' },
        { status: 500 }
      )
    }

    if (result.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Video generation timed out. Please try again.' },
        { status: 504 }
      )
    }

    const videoUrl = Array.isArray(result.output)
      ? result.output[0]
      : result.output

    // ── Update user stats ──────────────────────
    try {
      await connectDB()
      await User.findByIdAndUpdate(session.user.id, {
        $inc: { 'stats.totalVideos': 1 },
      })
    } catch (dbErr) {
      console.error('DB update error (non-fatal):', dbErr)
    }

    return NextResponse.json({
      videoUrl,
      prompt:   prompt.trim(),
      style,
      duration,
      quality,
    })

  } catch (err) {
    console.error('Video API error:', err)
    return NextResponse.json(
      { error: err.message || 'Video generation failed' },
      { status: 500 }
    )
  }
}