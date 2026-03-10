'use client'
import { useEffect } from 'react'
import { X }         from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size      = 'md',
  className = '',
}) {
  // ── Close on Escape key ───────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ── Prevent body scroll ───────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm:   'max-w-sm',
    md:   'max-w-md',
    lg:   'max-w-lg',
    xl:   'max-w-xl',
    '2xl':'max-w-2xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal box */}
      <div
        className={`
          relative w-full z-10
          bg-[var(--panel)] border border-[var(--border)]
          rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]
          animate-fade-up
          ${sizes[size] || sizes.md}
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="
            flex items-center justify-between
            px-6 py-4
            border-b border-[var(--border)]
          ">
            <h2 className="
              font-display font-semibold text-[var(--text)]
            ">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="
                w-8 h-8 flex items-center justify-center
                rounded-lg text-[var(--muted)]
                hover:text-[var(--text)] hover:bg-[var(--border)]
                transition-all duration-150 cursor-pointer
              "
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}