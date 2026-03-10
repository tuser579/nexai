'use client'
import { useEffect, useState } from 'react'
import { useAppStore }         from '@/store/appStore'
import Sidebar                 from '@/components/layout/Sidebar'
import TopBar                  from '@/components/layout/TopBar'

export default function DashboardLayout({ children }) {
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const [isMobile, setIsMobile]         = useState(false)

  // ── Detect mobile ──────────────────────────────
  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On mobile default closed, on desktop default collapsed (not fully open)
      if (mobile) setSidebarOpen(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Escape key closes sidebar ──────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  return (
    <div style={{
      display:    'flex',
      height:     '100vh',
      overflow:   'hidden',
      background: 'var(--bg)',
      position:   'relative',
    }}>

      <style>{`
        .sidebar-transition {
          transition: width     0.28s cubic-bezier(0.4,0,0.2,1),
                      min-width 0.28s cubic-bezier(0.4,0,0.2,1),
                      transform 0.28s cubic-bezier(0.4,0,0.2,1),
                      opacity   0.22s ease;
        }
        .inner-fade {
          transition: opacity 0.18s ease;
        }
        .backdrop-fade {
          transition: opacity 0.28s ease;
        }
      `}</style>

      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR — always visible,
          collapses to icon-only (64px)
      ══════════════════════════════════════ */}
      {!isMobile && (
        <div
          className="sidebar-transition"
          style={{
            width:       sidebarOpen ? '240px' : '64px',
            minWidth:    sidebarOpen ? '240px' : '64px',
            height:      '100vh',
            flexShrink:  0,
            overflow:    'hidden',
            borderRight: '1px solid var(--border)',
            background:  'var(--nav)',
            zIndex:      20,
          }}
        >
          <Sidebar />
        </div>
      )}

      {/* ══════════════════════════════════════
          MOBILE SIDEBAR — hidden by default,
          slides in as overlay drawer
      ══════════════════════════════════════ */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className="backdrop-fade"
            onClick={() => setSidebarOpen(false)}
            style={{
              position:       'fixed',
              inset:          0,
              zIndex:         30,
              background:     'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(3px)',
              opacity:        sidebarOpen ? 1 : 0,
              pointerEvents:  sidebarOpen ? 'auto' : 'none',
            }}
          />

          {/* Drawer */}
          <div
            className="sidebar-transition"
            style={{
              position:    'fixed',
              top:         0,
              left:        0,
              zIndex:      40,
              width:       '240px',
              height:      '100vh',
              background:  'var(--nav)',
              borderRight: '1px solid var(--border)',
              boxShadow:   sidebarOpen ? '8px 0 32px rgba(0,0,0,0.4)' : 'none',
              transform:   sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div style={{
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
        minWidth:      0,
      }}>
        <TopBar />
        <main style={{
          flex:          1,
          overflow:      'hidden',
          display:       'flex',
          flexDirection: 'column',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}