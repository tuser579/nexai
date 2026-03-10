'use client'
import { useState, useRef, useEffect } from 'react'
import ModelSelector from './ModelSelector'
import { Send, Square, Paperclip, Mic, Sparkles } from 'lucide-react'

export default function ChatInput({
  onSend,
  isStreaming = false,
  onStop,
  disabled   = false,
}) {
  const [input,   setInput]   = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef           = useRef(null)

  // ── Auto resize ────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [input])

  // ── Submit ─────────────────────────────────────
  function handleSubmit() {
    if (!input.trim() || isStreaming || disabled) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  // ── Enter to send ──────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = input.trim().length > 0 && !isStreaming && !disabled

  return (
    <div style={{
      width:    '100%',
      maxWidth: '800px',
      margin:   '0 auto',
    }}>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 #6c63ff00, 0 8px 32px rgba(0,0,0,0.3); }
          50%       { box-shadow: 0 0 0 3px #6c63ff22, 0 8px 32px rgba(0,0,0,0.3); }
        }
        @keyframes sendPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        .chat-input-box {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chat-input-box:hover {
          border-color: #6c63ff44 !important;
        }
        .send-btn:active { animation: sendPop 0.18s ease; }
        .input-pill:hover {
          background: var(--border) !important;
          color: var(--text) !important;
        }
        textarea::-webkit-scrollbar { display: none; }
        textarea { scrollbar-width: none; }
      `}</style>

      {/* ── Main input container ─────────────────── */}
      <div
        className="chat-input-box"
        style={{
          position:     'relative',
          background:   'var(--panel)',
          border:       `1.5px solid ${focused ? '#6c63ff66' : 'var(--border)'}`,
          borderRadius: '20px',
          boxShadow:    focused
            ? '0 0 0 3px #6c63ff18, 0 8px 32px rgba(0,0,0,0.3)'
            : '0 4px 24px rgba(0,0,0,0.2)',
          transition:   'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow:     'hidden',
        }}
      >

        {/* Subtle top gradient line when focused */}
        {focused && (
          <div style={{
            position:   'absolute',
            top:        0,
            left:       '10%',
            right:      '10%',
            height:     '1px',
            background: 'linear-gradient(90deg, transparent, #6c63ff88, transparent)',
            zIndex:     1,
          }} />
        )}

        {/* ── Textarea row ──────────────────────── */}
        <div style={{
          display:    'flex',
          alignItems: 'flex-end',
          gap:        '8px',
          padding:    '14px 14px 12px',
        }}>

          {/* Sparkles icon — subtle left decoration */}
          <div style={{
            flexShrink:  0,
            marginBottom:'2px',
            opacity:     focused ? 1 : 0.4,
            transition:  'opacity 0.2s',
          }}>
            <Sparkles
              size={16}
              style={{
                color: focused ? '#6c63ff' : 'var(--muted)',
                transition: 'color 0.2s',
              }}
            />
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={()  => setFocused(false)}
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
            style={{
              flex:        1,
              background:  'transparent',
              border:      'none',
              outline:     'none',
              resize:      'none',
              color:       'var(--text)',
              fontSize:    '14px',
              lineHeight:  '1.6',
              minHeight:   '24px',
              maxHeight:   '180px',
              padding:     0,
              fontFamily:  'inherit',
              overflowY:   'auto',
            }}
          />

          {/* ── Action buttons ─────────────────── */}
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '6px',
            flexShrink: 0,
            marginBottom: '1px',
          }}>

            {/* Send / Stop */}
            {isStreaming ? (
              <button
                className="send-btn"
                onClick={onStop}
                title="Stop generating"
                style={{
                  width:          '36px',
                  height:         '36px',
                  borderRadius:   '12px',
                  border:         '1.5px solid #f8717155',
                  background:     '#f8717118',
                  color:          '#f87171',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  cursor:         'pointer',
                  transition:     'all 0.15s',
                  flexShrink:     0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background  = '#f8717133'
                  e.currentTarget.style.borderColor = '#f87171aa'
                  e.currentTarget.style.transform   = 'scale(1.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background  = '#f8717118'
                  e.currentTarget.style.borderColor = '#f8717155'
                  e.currentTarget.style.transform   = 'scale(1)'
                }}
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                className="send-btn"
                onClick={handleSubmit}
                disabled={!canSend}
                title="Send (Enter)"
                style={{
                  width:          '36px',
                  height:         '36px',
                  borderRadius:   '12px',
                  border:         'none',
                  background:     canSend
                    ? 'linear-gradient(135deg, #6c63ff, #9c8fff)'
                    : 'var(--border)',
                  color:          canSend ? 'white' : 'var(--muted)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  cursor:         canSend ? 'pointer' : 'not-allowed',
                  transition:     'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow:      canSend
                    ? '0 4px 16px #6c63ff55'
                    : 'none',
                  transform:      canSend ? 'scale(1)' : 'scale(0.95)',
                  flexShrink:     0,
                }}
                onMouseEnter={(e) => {
                  if (!canSend) return
                  e.currentTarget.style.transform  = 'scale(1.08)'
                  e.currentTarget.style.boxShadow  = '0 6px 24px #6c63ff77'
                }}
                onMouseLeave={(e) => {
                  if (!canSend) return
                  e.currentTarget.style.transform  = 'scale(1)'
                  e.currentTarget.style.boxShadow  = '0 4px 16px #6c63ff55'
                }}
              >
                <Send size={14} style={{ transform: 'translateX(1px)' }} />
              </button>
            )}
          </div>
        </div>

        {/* ── Bottom bar inside box ──────────────── */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '8px 14px 11px',
          borderTop:      '1px solid var(--border)',
        }}>

          {/* Model selector */}
          <ModelSelector />

          {/* Right side hints */}
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '10px',
          }}>
            {/* Char count when typing */}
            {input.length > 0 && (
              <span style={{
                fontSize:   '10px',
                color:      input.length > 3000 ? '#f87171' : 'var(--subtle)',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 0.2s',
              }}>
                {input.length}
              </span>
            )}

            {/* Keyboard hint */}
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '4px',
            }}>
              <kbd style={{
                fontSize:     '9px',
                padding:      '2px 5px',
                borderRadius: '5px',
                border:       '1px solid var(--border)',
                background:   'var(--input)',
                color:        'var(--subtle)',
                fontFamily:   'inherit',
                lineHeight:   '1.4',
              }}>
                Enter
              </kbd>
              <span style={{ fontSize: '10px', color: 'var(--subtle)' }}>
                to send
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}