'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  return (
    <div className="
      my-3 rounded-xl overflow-hidden
      border border-[var(--border)]
    ">
      {/* Header */}
      <div className="
        flex items-center justify-between
        px-4 py-2
        bg-[#0d0d1e] border-b border-[var(--border)]
      ">
        <span className="text-xs text-[var(--muted)] font-mono">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="
            flex items-center gap-1.5
            text-xs text-[var(--muted)]
            hover:text-[var(--text)]
            transition-colors cursor-pointer
          "
        >
          {copied
            ? <><Check size={12} className="text-[#4ade80]" /><span className="text-[#4ade80]">Copied!</span></>
            : <><Copy  size={12} /><span>Copy</span></>
          }
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin:       0,
          padding:      '1rem',
          background:   '#080810',
          fontSize:     '0.82rem',
          lineHeight:   '1.6',
          borderRadius: 0,
        }}
        wrapLongLines={false}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  )
}