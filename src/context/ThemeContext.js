'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAppStore } from '@/store/appStore'

// ── Create context ────────────────────────────────
const ThemeContext = createContext({
  theme:       'dark',
  toggleTheme: () => {},
  setTheme:    () => {},
  isDark:      true,
  isLight:     false,
})

// ── Theme Provider ────────────────────────────────
export function ThemeProvider({ children }) {
  const { theme, toggleTheme, setTheme } = useAppStore()
  const [mounted, setMounted] = useState(false)

  // Apply theme to document
  useEffect(() => {
    setMounted(true)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        data-theme="dark"
        style={{ background: '#050508', minHeight: '100vh' }}
      />
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark:  theme === 'dark',
        isLight: theme === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// ── useTheme hook ─────────────────────────────────
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}

// ── Theme color tokens ────────────────────────────
// Use these in components instead of hardcoded colors
export const THEME_COLORS = {
  dark: {
    bg:         '#050508',
    surface:    '#0d0d14',
    panel:      '#13131f',
    panel2:     '#0a0a12',
    border:     '#1e1e30',
    text:       '#e8e8f0',
    muted:      '#6b7280',
    subtle:     '#3a3a52',
    accent:     '#6c63ff',
    accent2:    '#ff6584',
    accentBg:   '#6c63ff18',
    accentBorder:'#6c63ff44',
    nav:        '#0a0a12',
    input:      '#0d0d14',
    green:      '#4ade80',
    greenBg:    '#16a34a22',
    warning:    '#f59e0b',
    warningBg:  '#f59e0b22',
    danger:     '#f87171',
    dangerBg:   '#7f1d1d22',
    codeBg:     '#080810',
    codeHeader: '#0d0d14',
  },
  light: {
    bg:         '#f0f0fa',
    surface:    '#ffffff',
    panel:      '#f8f8ff',
    panel2:     '#f0f0f8',
    border:     '#e0e0f0',
    text:       '#0d0d20',
    muted:      '#6b7280',
    subtle:     '#c0c0d8',
    accent:     '#5b52e8',
    accent2:    '#e0405a',
    accentBg:   '#5b52e818',
    accentBorder:'#5b52e840',
    nav:        '#f8f8ff',
    input:      '#f0f0fa',
    green:      '#16a34a',
    greenBg:    '#16a34a18',
    warning:    '#d97706',
    warningBg:  '#fef3c722',
    danger:     '#dc2626',
    dangerBg:   '#fee2e222',
    codeBg:     '#1a1a2e',
    codeHeader: '#0d0d1e',
  },
}

// ── useColors hook ────────────────────────────────
// Returns current theme color tokens
export function useColors() {
  const { theme } = useTheme()
  return THEME_COLORS[theme]
}
