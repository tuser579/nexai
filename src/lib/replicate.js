import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// ── Video Generation ──────────────────────────────
export async function generateVideo(prompt, options = {}) {
  const {
    numFrames  = 16,
    numSteps   = 25,
    guidanceScale = 7.5,
  } = options

  const output = await replicate.run(
    // AnimateDiff — free credits on Replicate
    'lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
    {
      input: {
        prompt,
        num_frames:            numFrames,
        num_inference_steps:   numSteps,
        guidance_scale:        guidanceScale,
        negative_prompt:       'bad quality, blurry, distorted',
      },
    }
  )

  return output
}

// ── Image Generation via Replicate (FLUX) ─────────
// Use this if Hugging Face is too slow
export async function generateImageReplicate(prompt, options = {}) {
  const { width = 512, height = 512 } = options

  const output = await replicate.run(
    // FLUX Schnell — fast and uses free credits
    'black-forest-labs/flux-schnell',
    {
      input: {
        prompt,
        width,
        height,
        num_outputs:      1,
        output_format:    'jpeg',
        output_quality:   90,
      },
    }
  )

  return output[0]
}