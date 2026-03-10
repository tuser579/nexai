'use client'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ size = 'md', className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const sizes = {
    sm: { btn: 'w-8  h-8',  icon: 14 },
    md: { btn: 'w-9  h-9',  icon: 16 },
    lg: { btn: 'w-10 h-10', icon: 18 },
  }

  const s = sizes[size] || sizes.md

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${s.btn}
        flex items-center justify-center rounded-xl
        bg-[var(--panel)] border border-[var(--border)]
        hover:border-[#6c63ff44] hover:bg-[var(--border)]
        text-[var(--muted)] hover:text-[var(--text)]
        transition-all duration-200 cursor-pointer
        ${className}
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun  size={s.icon} />
        : <Moon size={s.icon} />
      }
    </button>
  )
}