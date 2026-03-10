'use client'
import { useState } from 'react'

export default function Avatar({
  src,
  name      = '',
  size      = 'md',
  className = '',
  onClick,
}) {
  const [imgError, setImgError] = useState(false)

  const sizes = {
    xs:  'w-6  h-6  text-[10px]',
    sm:  'w-8  h-8  text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-12 h-12 text-base',
    xl:  'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  // ── Get initials from name ────────────────────
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  // ── Random color from name ────────────────────
  const colors = [
    '#6c63ff', '#ff6584', '#4ade80',
    '#f59e0b', '#06b6d4', '#a78bfa',
    '#f97316', '#ec4899',
  ]
  const colorIndex = name
    ? name.charCodeAt(0) % colors.length
    : 0
  const bgColor = colors[colorIndex]

  const showImage = src && !imgError

  return (
    <div
      onClick={onClick}
      className={`
        relative shrink-0 rounded-full overflow-hidden
        flex items-center justify-center
        font-display font-bold select-none
        ${sizes[size] || sizes.md}
        ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
        ${className}
      `}
      style={!showImage ? { background: bgColor } : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-white">{initials}</span>
      )}
    </div>
  )
}
