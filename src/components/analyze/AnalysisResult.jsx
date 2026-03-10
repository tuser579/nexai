'use client'
import { useState, useRef }  from 'react'
import ReactMarkdown          from 'react-markdown'
import CodeBlock              from '@/components/chat/CodeBlock'
import Button                 from '@/components/ui/Button'
import { Copy, Check, Send,
         RefreshCw, Download } from 'lucide-react'
import toast                  from 'react-hot-toast'

export default function AnalysisResult({
  result,
  isStreaming,
  onFollowUp,
  onReset,
}) {
  const [copied,       setCopied]       = useState(false)
  const [followUpText, setFollowUpText] = useState('')
  const bottomRef                       = useRef(null)

  // ── Copy result ────────────────────────────────
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  // ── Download as text ───────────────────────────
  function handleDownload() {
    const blob = new Blob([result], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `nexai-analysis-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Follow up ──────────────────────────────────
  function handleFollowUp() {
    if (!followUpText.trim() || isStreaming) return
    onFollowUp(followUpText.trim())
    setFollowUpText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleFollowUp()
    }
  }

  if (!result && !isStreaming) return null

  return (
    <div className="flex flex-col gap-4 animate-fade-in">

      {/* ── Result Card ────────────────────────── */}
      <div className="
        bg-[var(--panel)] border border-[var(--border)]
        rounded-2xl overflow-hidden
      ">

        {/* Header */}
        <div className="
          flex items-center justify-between
          px-4 py-3
          border-b border-[var(--border)]
          bg-[var(--border)]
        ">
          <div className="flex items-center gap-2">
            <div className="
              w-6 h-6 rounded-lg
              bg-gradient-to-br from-[#6c63ff] to-[#ff6584]
              flex items-center justify-center
              text-white text-[10px] font-bold
            ">
              AI
            </div>
            <span className="text-xs font-semibold text-[var(--text)]">
              Analysis Result
            </span>
            {isStreaming && (
              <span className="
                flex items-center gap-1
                text-xs text-[#6c63ff]
              ">
                <span className="
                  w-1.5 h-1.5 rounded-full bg-[#6c63ff]
                  animate-pulse
                " />
                Analyzing...
              </span>
            )}
          </div>

          {/* Actions */}
          {result && !isStreaming && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="
                  flex items-center gap-1.5 px-2.5 py-1.5
                  rounded-lg text-xs
                  text-[var(--muted)] hover:text-[var(--text)]
                  hover:bg-[var(--panel)]
                  transition-all cursor-pointer
                "
              >
                {copied
                  ? <><Check size={12} className="text-[#4ade80]" /><span className="text-[#4ade80]">Copied</span></>
                  : <><Copy  size={12} /><span>Copy</span></>
                }
              </button>
              <button
                onClick={handleDownload}
                className="
                  flex items-center gap-1.5 px-2.5 py-1.5
                  rounded-lg text-xs
                  text-[var(--muted)] hover:text-[var(--text)]
                  hover:bg-[var(--panel)]
                  transition-all cursor-pointer
                "
              >
                <Download size={12} />
                <span>Save</span>
              </button>
              <button
                onClick={onReset}
                className="
                  flex items-center gap-1.5 px-2.5 py-1.5
                  rounded-lg text-xs
                  text-[var(--muted)] hover:text-[var(--text)]
                  hover:bg-[var(--panel)]
                  transition-all cursor-pointer
                "
              >
                <RefreshCw size={12} />
                <span>New</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[500px] overflow-y-auto no-scrollbar">
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
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 text-[var(--text)] text-sm leading-relaxed">
                    {children}
                  </p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-display font-bold text-[var(--text)] mt-4 mb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-display font-bold text-[var(--text)] mt-3 mb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-display font-semibold text-[var(--text)] mt-2 mb-1">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-2 text-[var(--text)] text-sm space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-2 text-[var(--text)] text-sm space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-[var(--text)] text-sm">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[var(--text)]">
                    {children}
                  </strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="
                    border-l-2 border-[#6c63ff] pl-4
                    text-[var(--muted)] italic my-2
                  ">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {result}
            </ReactMarkdown>
          </div>

          {/* Streaming cursor */}
          {isStreaming && (
            <span className="
              inline-block w-2 h-4
              bg-[#6c63ff] rounded-sm
              animate-pulse ml-0.5 align-middle
            " />
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Follow Up Input ─────────────────────── */}
      {result && !isStreaming && (
        <div className="
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl p-4 flex flex-col gap-3
          animate-fade-up
        ">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
            Ask a follow-up question
          </p>

          <div className="flex gap-3">
            <textarea
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something else about this file..."
              rows={2}
              className="
                flex-1 bg-[var(--input)] text-[var(--text)]
                border border-[var(--border)] rounded-xl
                px-4 py-3 text-sm resize-none outline-none
                placeholder:text-[var(--muted)]
                focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_#6c63ff22]
                transition-all duration-200
              "
            />
            <Button
              onClick={handleFollowUp}
              disabled={!followUpText.trim()}
              icon={<Send size={16} />}
              className="self-end"
            >
              Ask
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
