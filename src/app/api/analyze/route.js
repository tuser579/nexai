import { getServerSession } from '@/lib/auth'
import { NextResponse }       from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getFileCategory }    from '@/constants/fileTypes'
import { getAnalysisPrompt }  from '@/lib/utils'

// ── Max file size: 20MB ───────────────────────────
export const config = {
  api: { bodyParser: false },
}

// ── POST — Analyze media file ─────────────────────
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

    // ── Parse multipart form data ─────────────────
    const formData = await req.formData()
    const file     = formData.get('file')
    const prompt   = formData.get('prompt') || ''
    const history  = formData.get('history') || '[]'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // ── Read file as buffer ───────────────────────
    const bytes    = await file.arrayBuffer()
    const buffer   = Buffer.from(bytes)
    const mimeType = file.type
    const fileName = file.name
    const fileSize = buffer.length

    // ── File size check (20MB) ────────────────────
    const maxSize = 20 * 1024 * 1024
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
        { status: 400 }
      )
    }

    // ── Build analysis prompt ─────────────────────
    const category       = getFileCategory(mimeType)
    const defaultPrompt  = getAnalysisPrompt(mimeType)
    const analysisPrompt = prompt.trim() || defaultPrompt

    // ── Parse conversation history ────────────────
    let conversationHistory = []
    try {
      conversationHistory = JSON.parse(history)
    } catch {
      conversationHistory = []
    }

    // ── Set up Gemini ─────────────────────────────
    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GEMINI_API_KEY
    )

    // gemini-1.5-flash supports ALL media types FREE
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })

    // ── Build content parts ───────────────────────
    const filePart = {
      inlineData: {
        data:     buffer.toString('base64'),
        mimeType: mimeType,
      },
    }

    // ── Build context prompt ──────────────────────
    let contextPrompt = analysisPrompt

    if (conversationHistory.length > 0) {
      const historyText = conversationHistory
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')

      contextPrompt = `Previous conversation:\n${historyText}\n\nCurrent question: ${analysisPrompt}\n\nPlease answer based on the file and conversation above.`
    }

    // ── Stream response ───────────────────────────
    const result = await model.generateContentStream([
      contextPrompt,
      filePart,
    ])

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type':      'text/plain; charset=utf-8',
        'X-File-Name':       encodeURIComponent(fileName),
        'X-File-Type':       mimeType,
        'X-File-Category':   category,
        'Cache-Control':     'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
