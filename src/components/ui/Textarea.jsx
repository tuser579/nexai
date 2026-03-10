'use client'
import { forwardRef } from 'react'

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    rows      = 4,
    disabled  = false,
    className = '',
    containerClass = '',
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClass}`}>

      {label && (
        <label className="text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={`
          w-full resize-none
          bg-[var(--input)] text-[var(--text)]
          border rounded-xl outline-none
          px-4 py-3 text-sm
          placeholder:text-[var(--muted)]
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-[#f87171] focus:border-[#f87171] focus:shadow-[0_0_0_3px_#f8717122]'
            : 'border-[var(--border)] focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_#6c63ff22]'
          }
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-[#f87171] flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      )}
    </div>
  )
})

export default Textarea;