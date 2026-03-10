'use client'
import { useState } from 'react'
import MediaUpload    from '@/components/analyze/MediaUpload'
import AnalysisResult from '@/components/analyze/AnalysisResult'
import { FileSearch } from 'lucide-react'

export default function AnalyzePage() {
  const [selectedFile,  setSelectedFile]  = useState(null)
  const [prompt,        setPrompt]        = useState('')
  const [result,        setResult]        = useState('')
  const [isAnalyzing,   setIsAnalyzing]   = useState(false)
  const [history,       setHistory]       = useState([])

  // ── Analyze file ───────────────────────────────
  async function handleAnalyze() {
    if (!selectedFile || isAnalyzing) return

    setIsAnalyzing(true)
    setResult('')

    try {
      const formData = new FormData()
      formData.append('file',    selectedFile)
      formData.append('prompt',  prompt)
      formData.append('history', JSON.stringify(history))

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body:   formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analysis failed')
      }

      // ── Stream response ──────────────────────
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   full    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setResult(full)
      }

      // ── Save to history for follow-ups ────────
      setHistory((prev) => [
        ...prev,
        { role: 'user',      content: prompt || 'Analyze this file' },
        { role: 'assistant', content: full   },
      ])
    } catch (err) {
      console.error('Analyze error:', err)
      setResult(`⚠️ ${err.message || 'Analysis failed. Please try again.'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ── Follow up question ─────────────────────────
  async function handleFollowUp(followUpText) {
    if (!selectedFile || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('file',    selectedFile)
      formData.append('prompt',  followUpText)
      formData.append('history', JSON.stringify(history))

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body:   formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analysis failed')
      }

      // ── Stream follow-up response ─────────────
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   full    = ''

      // Append follow-up below existing result
      setResult((prev) => prev + '\n\n---\n\n**' + followUpText + '**\n\n')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setResult((prev) => {
          const parts = prev.split('\n\n---\n\n')
          parts[parts.length - 1] =
            '**' + followUpText + '**\n\n' + full
          return parts.join('\n\n---\n\n')
        })
      }

      // ── Update history ─────────────────────────
      setHistory((prev) => [
        ...prev,
        { role: 'user',      content: followUpText },
        { role: 'assistant', content: full         },
      ])
    } catch (err) {
      console.error('Follow-up error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ── Reset ──────────────────────────────────────
  function handleReset() {
    setSelectedFile(null)
    setPrompt('')
    setResult('')
    setHistory([])
  }

  return (
    <div className="
      p-4 md:p-6 max-w-7xl mx-auto
    ">
      {/* Header */}
      <div className="mb-6">
        <h2 className="
          text-lg font-display font-bold
          text-[var(--text)] flex items-center gap-2
        ">
          <FileSearch size={20} className="text-[#6c63ff]" />
          Media Analysis
        </h2>
        <p className="text-sm text-[var(--muted)] mt-0.5">
          Upload images, PDFs, video or audio — powered by Gemini 1.5 Flash
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Upload */}
        <div>
          <MediaUpload
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onClearFile={handleReset}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            prompt={prompt}
            setPrompt={setPrompt}
          />
        </div>

        {/* Right — Result */}
        <div>
          {(result || isAnalyzing) ? (
            <AnalysisResult
              result={result}
              isStreaming={isAnalyzing}
              onFollowUp={handleFollowUp}
              onReset={handleReset}
            />
          ) : (
            // Empty state
            <div className="
              flex flex-col items-center justify-center
              h-64 rounded-2xl text-center
              bg-[var(--panel)] border border-[var(--border)]
              border-dashed gap-4
            ">
              <div className="
                w-16 h-16 rounded-2xl bg-[var(--border)]
                flex items-center justify-center
              ">
                <FileSearch size={28} className="text-[var(--subtle)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--muted)]">
                  Analysis will appear here
                </p>
                <p className="text-xs text-[var(--subtle)] mt-1">
                  Upload a file and click Analyze
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}