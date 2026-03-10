import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// ── Only use gemini-2.0-flash — only confirmed working model ──
const WORKING_MODEL = 'gemini-2.0-flash'

// ── Stream chat ────────────────────────────────────
export async function streamGeminiChat({
  messages = [],
  model    = WORKING_MODEL,
  system   = '',
}) {
  const geminiModel = genAI.getGenerativeModel({
    model: WORKING_MODEL, // always use working model
    ...(system ? { systemInstruction: system } : {}),
  })

  const history = messages.slice(0, -1).map((m) => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content) }],
  }))

  const lastMessage = messages[messages.length - 1]
  const chat        = geminiModel.startChat({ history })
  const result      = await chat.sendMessageStream(String(lastMessage.content))

  return result.stream
}

// ── Non-streaming chat ─────────────────────────────
export async function geminiChat({
  messages = [],
  system   = '',
}) {
  const geminiModel = genAI.getGenerativeModel({
    model: WORKING_MODEL,
    ...(system ? { systemInstruction: system } : {}),
  })

  const history = messages.slice(0, -1).map((m) => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content) }],
  }))

  const lastMessage = messages[messages.length - 1]
  const chat        = geminiModel.startChat({ history })
  const result      = await chat.sendMessage(String(lastMessage.content))

  return result.response.text()
}

// ── Generate title ─────────────────────────────────
export async function generateTitle(firstMessage) {
  try {
    const geminiModel = genAI.getGenerativeModel({ model: WORKING_MODEL })
    const result      = await geminiModel.generateContent(
      `Generate a short 4-6 word title for a chat that starts with: "${String(firstMessage).slice(0, 200)}". Return ONLY the title, no quotes, no punctuation at end.`
    )
    return result.response.text().trim().slice(0, 60)
  } catch {
    return String(firstMessage).slice(0, 40)
  }
}

// ── Analyze media ──────────────────────────────────
export async function analyzeMedia({
  fileData,
  mimeType,
  prompt  = 'Analyze this file in detail.',
  history = [],
}) {
  const geminiModel = genAI.getGenerativeModel({ model: WORKING_MODEL })

  const historyFormatted = history.map((m) => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content) }],
  }))

  const chat   = geminiModel.startChat({ history: historyFormatted })
  const result = await chat.sendMessageStream([
    { inlineData: { data: fileData, mimeType } },
    { text: prompt },
  ])

  return result.stream
}