'use client'

export default function Spinner({
  size      = 'md',
  color     = '#6c63ff',
  className = '',
}) {
  const sizes = {
    xs:  'w-3 h-3',
    sm:  'w-4 h-4',
    md:  'w-6 h-6',
    lg:  'w-8 h-8',
    xl:  'w-12 h-12',
    '2xl': 'w-16 h-16',
  }

  return (
    <svg
      className={`animate-spin ${sizes[size] || sizes.md} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-20"
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// ── Full page loading spinner ─────────────────────
export function PageSpinner({ message = 'Loading...' }) {
  return (
    <div className="
      fixed inset-0 z-50
      flex flex-col items-center justify-center gap-4
      bg-[var(--bg)]
    ">
      <Spinner size="xl" />
      <p className="text-[var(--muted)] text-sm animate-pulse">
        {message}
      </p>
    </div>
  )
}

// ── Inline loading dots ───────────────────────────
export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="
            w-1.5 h-1.5 rounded-full
            bg-[var(--muted)] animate-bounce-dot
          "
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}