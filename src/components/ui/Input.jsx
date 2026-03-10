'use client'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon,
    iconRight,
    type      = 'text',
    size      = 'md',
    disabled  = false,
    className = '',
    containerClass = '',
    ...props
  },
  ref
) {

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3   text-base',
  }

  return (
    <div className={`flex flex-col gap-1.5 ${containerClass}`}>

      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">

        {/* Left icon */}
        {icon && (
          <span className="
            absolute left-3 text-[var(--muted)]
            pointer-events-none z-10
          ">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={`
            w-full
            bg-[var(--input)] text-[var(--text)]
            border rounded-xl outline-none
            placeholder:text-[var(--muted)]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-[#f87171] focus:border-[#f87171] focus:shadow-[0_0_0_3px_#f8717122]'
              : 'border-[var(--border)] focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_#6c63ff22]'
            }
            ${icon      ? 'pl-10' : ''}
            ${iconRight ? 'pr-10' : ''}
            ${sizes[size] || sizes.md}
            ${className}
          `}
          {...props}
        />

        {/* Right icon */}
        {iconRight && (
          <span className="
            absolute right-3 text-[var(--muted)]
            pointer-events-none z-10
          ">
            {iconRight}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-[#f87171] flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      )}
    </div>
  )
})

export default Input