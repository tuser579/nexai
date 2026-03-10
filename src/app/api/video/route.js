import { getServerSession } from 'next-auth'
import { NextResponse }     from 'next/server'
import { connectDB }        from '@/lib/db'
import User                 from '@/models/User'
import {
  buildVideoPrompt,
  getVideoDurationById,
} from '@/constants/videoStyles'

// ── POST — Generate video ─────────────────────────
export async function POST(req) {
  try {
    // ── Auth ──────────────────────────────────────
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { prompt, style, duration, quality } = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // ── Build prompt ──────────────────────────────
    const fullPrompt  = buildVideoPrompt(prompt, style || 'cinematic')
    const durationObj = getVideoDurationById(duration || '5s')

    // ── Steps based on quality ────────────────────
    const stepsMap = { draft: 15, standard: 25, high: 40 }
    const steps    = stepsMap[quality] || 25

    // ── Call Replicate — AnimateDiff ──────────────
    const replicateRes = await fetch(
      'https://api.replicate.com/v1/predictions',
      {
        method:  'POST',
        headers: {
          Authorization:  `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version:
            'beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
          input: {
            prompt:                fullPrompt,
            num_frames:            durationObj.frames,
            num_inference_steps:   steps,
            guidance_scale:        7.5,
            negative_prompt:
              'blurry, low quality, distorted, bad anatomy, watermark',
          },
        }),
      }
    )

    if (!replicateRes.ok) {
      const err = await replicateRes.text()
      console.error('Replicate error:', err)
      return NextResponse.json(
        { error: 'Video generation failed. Please try again.' },
        { status: 500 }
      )
    }

    const prediction = await replicateRes.json()

    // ── Poll for completion ───────────────────────
    // Replicate is async — we poll until done
    let result    = prediction
    let attempts  = 0
    const maxPoll = 60 // max 60 polls = ~3 minutes

    while (
      result.status !== 'succeeded' &&
      result.status !== 'failed' &&
      attempts < maxPoll
    ) {
      await new Promise((r) => setTimeout(r, 3000)) // wait 3s

      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      )

      result = await pollRes.json()
      attempts++
    }

    // ── Failed or timed out ───────────────────────
    if (result.status === 'failed') {
      return NextResponse.json(
        { error: 'Video generation failed. Please try again.' },
        { status: 500 }
      )
    }

    if (attempts >= maxPoll) {
      return NextResponse.json(
        {
          error:  'Video generation timed out',
          predictionId: result.id,
          message: 'The video is still generating. Check back later.',
        },
        { status: 408 }
      )
    }

    // ── Success ───────────────────────────────────
    const videoUrl = Array.isArray(result.output)
      ? result.output[0]
      : result.output

    // ── Update user stats ─────────────────────────
    await connectDB()
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { 'stats.totalVideos': 1 },
    })

    return NextResponse.json({
      videoUrl,
      prompt:   prompt.trim(),
      style:    style    || 'cinematic',
      duration: duration || '5s',
      quality:  quality  || 'standard',
    })
  } catch (err) {
    console.error('Video generation error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}