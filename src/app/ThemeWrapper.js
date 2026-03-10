'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

export default function ThemeWrapper({ children }) {
  const theme = useAppStore((s) => s.theme)

  // ── Apply theme to <html> element ─────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div data-theme={theme}>
      {children}
    </div>
  )
}