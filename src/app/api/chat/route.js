import { NextResponse }       from 'next/server'
import { getServerSession }   from '@/lib/auth'
import { connectDB }          from '@/lib/db'
import Chat                   from '@/models/Chat'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq                   from 'groq-sdk'

const WORKING_GEMINI_MODEL = 'gemini-2.0-flash'

// ── Model type checkers ────────────────────────────
function isGeminiModel(modelId = '') {
  return modelId.toLowerCase().startsWith('gemini')
}

function isGroqModel(modelId = '') {
  return [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ].includes(modelId)
}

function isTogetherModel(modelId = '') {
  return modelId.includes('mistral') || modelId.includes('llama/')
}

// ── Pick a random Gemini key from available keys ───
function getGeminiApiKey() {
  const keys = [
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY_2,
    process.env.GOOGLE_GEMINI_API_KEY_3,
  ].filter(Boolean)
  if (!keys.length) return null
  return keys[Math.floor(Math.random() * keys.length)]
}

export async function POST(req) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      messages = [],
      model    = WORKING_GEMINI_MODEL,
      chatId   = null,
      system   = '',
    } = body

    if (!messages.length) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      )
    }

    await connectDB()

    // ────────────────────────────────────────────
    // ── GEMINI PATH ──────────────────────────────
    // ────────────────────────────────────────────
    if (isGeminiModel(model)) {
      const apiKey = getGeminiApiKey()

      if (!apiKey) {
        return NextResponse.json(
          { error: '🔑 GOOGLE_GEMINI_API_KEY is not set in .env.local' },
          { status: 400 }
        )
      }

      const genAI = new GoogleGenerativeAI(apiKey)

      let geminiModel
      let result

      try {
        geminiModel = genAI.getGenerativeModel({
          model: WORKING_GEMINI_MODEL,
          ...(system ? { systemInstruction: system } : {}),
        })

        // Only send last 10 messages to save tokens
        const history = messages
          .slice(0, -1)
          .slice(-10)
          .map((m) => ({
            role:  m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(m.content) }],
          }))

        const lastMsg = messages[messages.length - 1]
        const chat    = geminiModel.startChat({ history })
        result        = await chat.sendMessageStream(String(lastMsg.content))

      } catch (err) {
        console.error('Gemini init error:', err)

        if (err.status === 429) {
          return NextResponse.json(
            {
              error: '⏳ Gemini rate limit reached. Try switching to a Groq model (Llama/Mixtral) which has 14,400 free requests/day.\n\nOr get a new API key at https://aistudio.google.com/app/apikey',
            },
            { status: 429 }
          )
        }
        if (err.status === 401 || err.status === 403) {
          return NextResponse.json(
            { error: '🔑 Invalid Gemini API key. Check your GOOGLE_GEMINI_API_KEY in .env.local' },
            { status: 401 }
          )
        }
        if (err.status === 404) {
          return NextResponse.json(
            { error: '🤖 Gemini model not available. Please try again.' },
            { status: 404 }
          )
        }
        return NextResponse.json(
          { error: err.message || 'Failed to connect to Gemini' },
          { status: 500 }
        )
      }

      // ── Save user message to DB ──────────────
      let savedChatId = chatId
      try {
        const lastMsg = messages[messages.length - 1]
        const userMsg = { role: 'user', content: String(lastMsg.content) }

        if (chatId) {
          await Chat.findByIdAndUpdate(chatId, {
            $push: { messages: userMsg },
          })
        } else {
          let title = String(lastMsg.content).slice(0, 50)
          try {
            const tm = genAI.getGenerativeModel({ model: WORKING_GEMINI_MODEL })
            const tr = await tm.generateContent(
              `Write a short 4-6 word title for: "${String(lastMsg.content).slice(0, 150)}". Only the title, no quotes.`
            )
            title = tr.response.text().trim().slice(0, 60)
          } catch { /* use truncated message */ }

          const newChat = await Chat.create({
            userId:   session.user.id,
            title,
            model:    WORKING_GEMINI_MODEL,
            messages: [userMsg],
          })
          savedChatId = newChat._id.toString()
        }
      } catch (dbErr) {
        console.error('DB save error:', dbErr)
      }

      // ── Stream to client ─────────────────────
      const encoder      = new TextEncoder()
      let   fullResponse = ''

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                fullResponse += text
                controller.enqueue(encoder.encode(text))
              }
            }

            if (savedChatId) {
              try {
                await Chat.findByIdAndUpdate(savedChatId, {
                  $push: {
                    messages: { role: 'assistant', content: fullResponse },
                  },
                })
              } catch (e) {
                console.error('DB assistant save:', e)
              }
            }

            controller.enqueue(
              encoder.encode(`\n\n__NEXAI_CHAT_ID__:${savedChatId}`)
            )
            controller.close()

          } catch (streamErr) {
            console.error('Gemini stream error:', streamErr)
            if (streamErr.status === 429) {
              controller.enqueue(
                encoder.encode(
                  '\n\n⏳ Gemini rate limit reached. Please switch to a Groq model or wait 1 minute.'
                )
              )
            } else {
              controller.enqueue(
                encoder.encode(
                  `\n\n❌ Error: ${streamErr.message || 'Something went wrong'}`
                )
              )
            }
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type':  'text/plain; charset=utf-8',
          'X-Chat-Id':     savedChatId || '',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // ────────────────────────────────────────────
    // ── GROQ PATH ────────────────────────────────
    // ────────────────────────────────────────────
    if (isGroqModel(model)) {
      if (!process.env.GROQ_API_KEY) {
        return NextResponse.json(
          { error: '🔑 GROQ_API_KEY is not set in .env.local — get one free at https://console.groq.com' },
          { status: 400 }
        )
      }

      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

      const groqMessages = [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages.slice(-10).map((m) => ({
          role:    m.role,
          content: String(m.content),
        })),
      ]

      let completion
      try {
        completion = await groq.chat.completions.create({
          model,
          messages: groqMessages,
          stream:   true,
        })
      } catch (err) {
        console.error('Groq init error:', err)
        if (err.status === 429) {
          return NextResponse.json(
            { error: '⏳ Groq rate limit reached. Please wait and try again.' },
            { status: 429 }
          )
        }
        if (err.status === 401) {
          return NextResponse.json(
            { error: '🔑 Invalid Groq API key. Check your GROQ_API_KEY in .env.local' },
            { status: 401 }
          )
        }
        return NextResponse.json(
          { error: err.message || 'Groq request failed' },
          { status: 500 }
        )
      }

      // ── Save user message to DB ──────────────
      let savedChatId = chatId
      try {
        const lastMsg = messages[messages.length - 1]
        const userMsg = { role: 'user', content: String(lastMsg.content) }

        if (chatId) {
          await Chat.findByIdAndUpdate(chatId, {
            $push: { messages: userMsg },
          })
        } else {
          const newChat = await Chat.create({
            userId:   session.user.id,
            title:    String(lastMsg.content).slice(0, 50),
            model,
            messages: [userMsg],
          })
          savedChatId = newChat._id.toString()
        }
      } catch (dbErr) {
        console.error('DB error:', dbErr)
      }

      // ── Stream to client ─────────────────────
      const encoder      = new TextEncoder()
      let   fullResponse = ''

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || ''
              if (text) {
                fullResponse += text
                controller.enqueue(encoder.encode(text))
              }
            }

            if (savedChatId) {
              try {
                await Chat.findByIdAndUpdate(savedChatId, {
                  $push: {
                    messages: { role: 'assistant', content: fullResponse },
                  },
                })
              } catch (e) {
                console.error('DB error:', e)
              }
            }

            controller.enqueue(
              encoder.encode(`\n\n__NEXAI_CHAT_ID__:${savedChatId}`)
            )
            controller.close()

          } catch (err) {
            console.error('Groq stream error:', err)
            controller.enqueue(
              encoder.encode(`\n\n❌ Error: ${err.message}`)
            )
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type':  'text/plain; charset=utf-8',
          'X-Chat-Id':     savedChatId || '',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // ────────────────────────────────────────────
    // ── OPENAI / TOGETHER PATH ───────────────────
    // ────────────────────────────────────────────
    const useTogether = isTogetherModel(model)
    const baseURL     = useTogether
      ? 'https://api.together.xyz/v1'
      : 'https://api.openai.com/v1'
    const apiKey      = useTogether
      ? process.env.TOGETHER_API_KEY || ''
      : process.env.OPENAI_API_KEY   || ''

    if (!apiKey) {
      return NextResponse.json(
        {
          error: `🔑 API key not configured for model: ${model}. Please add it to .env.local`,
        },
        { status: 400 }
      )
    }

    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey, baseURL })

    const openaiMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.slice(-10).map((m) => ({
        role:    m.role,
        content: String(m.content),
      })),
    ]

    let completion
    try {
      completion = await openai.chat.completions.create({
        model,
        messages: openaiMessages,
        stream:   true,
      })
    } catch (err) {
      if (err.status === 429) {
        return NextResponse.json(
          { error: '⏳ Rate limit reached. Please wait and try again.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: err.message || 'Request failed' },
        { status: 500 }
      )
    }

    // ── Save user message to DB ────────────────
    let savedChatId = chatId
    try {
      const lastMsg = messages[messages.length - 1]
      const userMsg = { role: 'user', content: String(lastMsg.content) }
      if (chatId) {
        await Chat.findByIdAndUpdate(chatId, {
          $push: { messages: userMsg },
        })
      } else {
        const newChat = await Chat.create({
          userId:   session.user.id,
          title:    String(lastMsg.content).slice(0, 50),
          model,
          messages: [userMsg],
        })
        savedChatId = newChat._id.toString()
      }
    } catch (dbErr) {
      console.error('DB error:', dbErr)
    }

    const encoder      = new TextEncoder()
    let   fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              fullResponse += text
              controller.enqueue(encoder.encode(text))
            }
          }

          if (savedChatId) {
            try {
              await Chat.findByIdAndUpdate(savedChatId, {
                $push: {
                  messages: { role: 'assistant', content: fullResponse },
                },
              })
            } catch (e) {
              console.error('DB error:', e)
            }
          }

          controller.enqueue(
            encoder.encode(`\n\n__NEXAI_CHAT_ID__:${savedChatId}`)
          )
          controller.close()

        } catch (err) {
          controller.enqueue(
            encoder.encode(`\n\n❌ Error: ${err.message}`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type':  'text/plain; charset=utf-8',
        'X-Chat-Id':     savedChatId || '',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (err) {
    console.error('Chat API error:', err)

    if (err.status === 429) {
      return NextResponse.json(
        {
          error: '⏳ Rate limit reached. Try switching to a Groq model (14,400 free req/day) or wait 1 minute.',
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: err.message || 'Chat failed' },
      { status: 500 }
    )
  }
}