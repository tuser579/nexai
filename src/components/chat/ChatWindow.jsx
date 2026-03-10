'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession }   from 'next-auth/react'
import { useAppStore }  from '@/store/appStore'
import MessageBubble    from './MessageBubble'
import ChatInput        from './ChatInput'
import ModelSelector    from './ModelSelector'
import TypingIndicator  from './TypingIndicator'
import { Sparkles }     from 'lucide-react'
import toast            from 'react-hot-toast'

const STARTERS = [
  'Explain quantum computing simply',
  'Write a Python web scraper',
  'Help me debug my code',
  'What is the meaning of life?',
  'Write a short story about AI',
  'How do I learn React fast?',
]

export default function ChatWindow({ initialMessages = [], chatId = null }) {
  const { data: session } = useSession()
  const {
    model,
    messages,      setMessages,
    addMessage,    updateLastMessage,
    isStreaming,   setStreaming,
    activeChatId,  setActiveChatId,
    addChatSession,
  } = useAppStore()

  const [input,      setInput]      = useState('')
  const [controller, setController] = useState(null)

  const bottomRef      = useRef(null)
  const containerRef   = useRef(null)
  const isAtBottomRef  = useRef(true)

  // ── Load initial messages ──────────────────────
  useEffect(() => {
    if (initialMessages.length > 0) setMessages(initialMessages)
    if (chatId) setActiveChatId(chatId)
  }, [])

  // ── Track scroll position ──────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onScroll() {
      const { scrollTop, scrollHeight, clientHeight } = el
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 80
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // ── Auto scroll ────────────────────────────────
  const scrollToBottom = useCallback((force = false) => {
    if (force || isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
    if (!isStreaming) return
    const t = setInterval(() => scrollToBottom(), 120)
    return () => clearInterval(t)
  }, [isStreaming, scrollToBottom])

  // ── Send message ───────────────────────────────
  async function handleSend(text) {
    const content = (text || input).trim()
    if (!content || isStreaming) return

    setInput('')
    const userMsg = { role: 'user', content }
    addMessage(userMsg)

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    setStreaming(true)
    addMessage({ role: 'assistant', content: '' })

    const abort = new AbortController()
    setController(abort)

    try {
      const allMessages = [...messages.filter((m) => m.content), userMsg]

      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  abort.signal,
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role:    m.role,
            content: m.content,
          })),
          model,
          chatId: activeChatId,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   full    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        if (chunk.includes('__NEXAI_CHAT_ID__:')) {
          const parts = chunk.split('__NEXAI_CHAT_ID__:')
          if (parts[0]) { full += parts[0]; updateLastMessage(full) }

          const id = parts[1]?.trim()
          if (id && id !== 'null' && !activeChatId) {
            setActiveChatId(id)
            addChatSession({
              _id:   id,
              title: allMessages[0]?.content?.slice(0, 40) || 'New Chat',
              model,
            })
          }
        } else {
          full += chunk
          updateLastMessage(full)
        }
      }

      const headerChatId = res.headers.get('X-Chat-Id')
      if (headerChatId && !activeChatId) setActiveChatId(headerChatId)

    } catch (err) {
      if (err.name === 'AbortError') {
        updateLastMessage('_Stopped._')
      } else {
        console.error('Chat error:', err)
        updateLastMessage(`❌ ${err.message || 'Something went wrong.'}`)
        toast.error(err.message || 'Chat failed')
      }
    } finally {
      setStreaming(false)
      setController(null)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  function handleStop() {
    controller?.abort()
    setStreaming(false)
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
      background:    'var(--bg)',
    }}>

      {/* ── Messages ──────────────────────────── */}
      <div
        ref={containerRef}
        style={{
          flex:      1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding:   isEmpty ? '0' : '20px 16px 8px',
        }}
      >
        {isEmpty ? (

          /* Empty state */
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            height:         '100%',
            minHeight:      '400px',
            padding:        '32px 16px',
            gap:            '28px',
          }}>
            <div style={{
              width:          '68px',
              height:         '68px',
              borderRadius:   '22px',
              background:     'linear-gradient(135deg, #6c63ff, #ff6584)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      '0 0 48px #6c63ff55',
            }}>
              <Sparkles size={32} color="white" />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                fontSize:   '24px',
                fontWeight: '800',
                fontFamily: 'Syne, sans-serif',
                color:      'var(--text)',
                margin:     0,
              }}>
                How can I help you?
              </h2>
              <p style={{
                fontSize:  '14px',
                color:     'var(--muted)',
                marginTop: '8px',
                margin:    '8px 0 0',
              }}>
                Ask anything · use the model selector below
              </p>
            </div>

            <div style={{
              display:        'flex',
              flexWrap:       'wrap',
              gap:            '8px',
              justifyContent: 'center',
              maxWidth:       '540px',
            }}>
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    padding:      '8px 16px',
                    borderRadius: '20px',
                    border:       '1px solid var(--border)',
                    background:   'var(--panel)',
                    color:        'var(--muted)',
                    fontSize:     '13px',
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6c63ff66'
                    e.currentTarget.style.color       = 'var(--text)'
                    e.currentTarget.style.background  = '#6c63ff11'
                    e.currentTarget.style.transform   = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color       = 'var(--muted)'
                    e.currentTarget.style.background  = 'var(--panel)'
                    e.currentTarget.style.transform   = 'translateY(0)'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

        ) : (

          /* Message list */
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           '4px',
            maxWidth:      '800px',
            margin:        '0 auto',
            width:         '100%',
          }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'assistant' && !msg.content && isStreaming
                  ? <TypingIndicator />
                  : <MessageBubble
                      message={msg}
                      isStreaming={isStreaming && i === messages.length - 1}
                    />
                }
              </div>
            ))}
            <div ref={bottomRef} style={{ height: '4px' }} />
          </div>
        )}
      </div>

      {/* ── Input bar ─────────────────────────── */}
      <div style={{
        flexShrink:  0,
        padding:     '10px 16px 16px',
        borderTop:   '1px solid var(--border)',
        background:  'var(--nav)',
      }}>

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
          disabled={false}
        />
      </div>
    </div>
  )
}