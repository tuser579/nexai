'use client'

export default function Button({
  children,
  onClick,
  type     = 'button',
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  loading  = false,
  fullWidth = false,
  className = '',
  icon,
  iconRight,
  ...props
}) {

  // ── Variants ───────────────────────────────────
  const variants = {
    primary: `
      bg-[#6c63ff] hover:bg-[#7c74ff] text-white
      shadow-[0_0_20px_#6c63ff33] hover:shadow-[0_0_30px_#6c63ff55]
      border border-[#6c63ff66]
    `,
    secondary: `
      bg-[var(--panel)] hover:bg-[var(--border)]
      text-[var(--text)] border border-[var(--border)]
      hover:border-[#6c63ff44]
    `,
    ghost: `
      bg-transparent hover:bg-[var(--panel)]
      text-[var(--muted)] hover:text-[var(--text)]
      border border-transparent hover:border-[var(--border)]
    `,
    danger: `
      bg-[#f8717122] hover:bg-[#f8717133]
      text-[#f87171] border border-[#f8717144]
      hover:border-[#f87171]
    `,
    success: `
      bg-[#4ade8022] hover:bg-[#4ade8033]
      text-[#4ade80] border border-[#4ade8044]
    `,
    outline: `
      bg-transparent hover:bg-[#6c63ff11]
      text-[#6c63ff] border border-[#6c63ff44]
      hover:border-[#6c63ff]
    `,
  }

  // ── Sizes ──────────────────────────────────────
  const sizes = {
    xs: 'px-2.5 py-1   text-xs  rounded-lg  gap-1',
    sm: 'px-3   py-1.5 text-sm  rounded-xl  gap-1.5',
    md: 'px-4   py-2   text-sm  rounded-xl  gap-2',
    lg: 'px-6   py-3   text-base rounded-2xl gap-2',
    xl: 'px-8   py-4   text-lg  rounded-2xl gap-2.5',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.97] select-none
        ${variants[variant] || variants.primary}
        ${sizes[size]       || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Left icon */}
      {icon && !loading && (
        <span className="shrink-0">{icon}</span>
      )}

      {/* Loading spinner */}
      {loading && (
        <svg
          className="w-4 h-4 animate-spin shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}

      {/* Label */}
      {children && (
        <span>{children}</span>
      )}

      {/* Right icon */}
      {iconRight && !loading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  )
}