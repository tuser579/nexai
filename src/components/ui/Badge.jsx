'use client'

export default function Badge({
  children,
  variant   = 'default',
  size      = 'sm',
  className = '',
  dot       = false,
  dotColor,
}) {
  const variants = {
    default: 'bg-[var(--panel)]   text-[var(--muted)]  border-[var(--border)]',
    primary: 'bg-[#6c63ff22]      text-[#6c63ff]       border-[#6c63ff33]',
    success: 'bg-[#4ade8022]      text-[#4ade80]       border-[#4ade8033]',
    warning: 'bg-[#f59e0b22]      text-[#f59e0b]       border-[#f59e0b33]',
    danger:  'bg-[#f8717122]      text-[#f87171]       border-[#f8717133]',
    info:    'bg-[#60a5fa22]      text-[#60a5fa]       border-[#60a5fa33]',
    free:    'bg-[#4ade8022]      text-[#4ade80]       border-[#4ade8033]',
    paid:    'bg-[#f59e0b22]      text-[#f59e0b]       border-[#f59e0b33]',
    pro:     'bg-[#6c63ff22]      text-[#6c63ff]       border-[#6c63ff33]',
  }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] rounded-md',
    sm: 'px-2   py-0.5 text-xs     rounded-lg',
    md: 'px-2.5 py-1   text-xs     rounded-lg',
    lg: 'px-3   py-1   text-sm     rounded-xl',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium border
        ${variants[variant] || variants.default}
        ${sizes[size]       || sizes.sm}
        ${className}
      `}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dotColor || 'currentColor' }}
        />
      )}
      {children}
    </span>
  )
}