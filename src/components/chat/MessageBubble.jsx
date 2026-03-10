'use client'
import { useState }    from 'react'
import ReactMarkdown   from 'react-markdown'
import CodeBlock       from './CodeBlock'
import { Copy, Check, User } from 'lucide-react'
import { formatDate }  from '@/lib/utils'

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  return (
    <div className={`
      group flex items-start gap-3
      ${isUser ? 'flex-row-reverse' : 'flex-row'}
      animate-fade-up
    `}>

      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-xl shrink-0
        flex items-center justify-center text-xs font-bold
        ${isUser
          ? 'bg-[var(--border)] text-[var(--muted)]'
          : 'bg-gradient-to-br from-[#6c63ff] to-[#ff6584] text-white shadow-[0_0_12px_#6c63ff33]'
        }
      `}>
        {isUser ? <User size={14} /> : 'AI'}
      </div>

      {/* Bubble */}
      <div className={`
        max-w-[80%] flex flex-col gap-1
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-[#6c63ff] text-white rounded-tr-sm shadow-[0_0_20px_#6c63ff33]'
            : 'bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm'
          }
        `}>

          {isUser ? (
            // ── User message — plain text ──────
            <p className="whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            // ── AI message — markdown ──────────
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <CodeBlock language={match[1]}>
                        {String(children)}
                      </CodeBlock>
                    ) : (
                      <code
                        className="
                          bg-[#1e1e30] text-[#a78bfa]
                          px-1.5 py-0.5 rounded text-xs font-mono
                        "
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  // Remove default margin on p tags inside prose
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Time + Copy */}
        <div className={`
          flex items-center gap-2
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}>
          {message.createdAt && (
            <span className="text-[10px] text-[var(--subtle)]">
              {formatDate(message.createdAt)}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="
              flex items-center gap-1 text-[10px]
              text-[var(--subtle)] hover:text-[var(--muted)]
              transition-colors cursor-pointer
            "
          >
            {copied
              ? <><Check size={10} className="text-[#4ade80]" /><span className="text-[#4ade80]">Copied</span></>
              : <><Copy  size={10} /><span>Copy</span></>
            }
          </button>
        </div>
      </div>
    </div>
  )
}