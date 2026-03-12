'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/appStore'
import { AI_MODELS } from '@/constants/models'
import { ChevronDown, Check } from 'lucide-react'

const PROVIDER_CONFIG = {
  'Google': { color: '#4ade80', glow: '#4ade8033', icon: '✦' },
  'GitHub': {
    color: '#22c55e',
    glow: '#22c55e33',
    icon: '🐙',
  },
  'Groq': { color: '#38bdf8', glow: '#38bdf833', icon: '⚡' },
  'OpenRouter': {
    color: '#f97316',
    glow: '#f9731633',
    icon: '🔀',
  },
  'OpenAI': { color: '#f59e0b', glow: '#f59e0b33', icon: '◈' },
  'Together AI': { color: '#a78bfa', glow: '#a78bfa33', icon: '◎' },
}

export default function ModelSelector() {
  const { model, setModel } = useAppStore()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef(null)

  const current = AI_MODELS.find((m) => m.id === model) || AI_MODELS[0]
  const pConfig = PROVIDER_CONFIG[current.provider] || PROVIDER_CONFIG['Google']

  // ── SSR safe mount ─────────────────────────────
  useEffect(() => { setMounted(true) }, [])

  // ── Calculate dropdown position ─────────────────
  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const dropH = 440
    const spaceB = window.innerHeight - rect.bottom
    const spaceA = rect.top
    const openUp = spaceB < dropH && spaceA > spaceB

    setCoords({
      left: Math.min(rect.left, window.innerWidth - 308),
      top: openUp
        ? rect.top - dropH - 8
        : rect.bottom + 8,
      openUp,
    })
  }, [])

  // ── Toggle open ────────────────────────────────
  function handleToggle() {
    if (!open) {
      calcPosition()
      // Scroll selected into view after render
      setTimeout(() => {
        const sel = document.querySelector(
          '#model-selector-portal [data-selected="true"]'
        )
        sel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 60)
    }
    setOpen((o) => !o)
  }

  // ── Close on outside click + outside scroll ────
  useEffect(() => {
    if (!open) return

    function onDown(e) {
      const portal = document.getElementById('model-selector-portal')
      if (
        triggerRef.current?.contains(e.target) ||
        portal?.contains(e.target)
      ) return
      setOpen(false)
    }

    function onScroll(e) {
      const portal = document.getElementById('model-selector-portal')
      // If scroll happened inside portal — do NOT close
      if (portal?.contains(e.target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  // ── Recalc position on resize ──────────────────
  useEffect(() => {
    if (!open) return
    function onResize() { calcPosition() }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open, calcPosition])

  // ── Select model ───────────────────────────────
  function handleSelect(modelId) {
    setModel(modelId)
    setOpen(false)
  }

  // ══════════════════════════════════════════════
  // DROPDOWN PORTAL
  // ══════════════════════════════════════════════
  const dropdown = (
    <div
      id="model-selector-portal"
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: '300px',
        zIndex: 99999,
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        overflow: 'hidden',
        animation: coords.openUp
          ? 'msDropDown 0.2s cubic-bezier(0.4,0,0.2,1)'
          : 'msDropUp   0.2s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <style>{`
        @keyframes msDropUp {
          from { opacity: 0; transform: translateY(10px)  scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes msDropDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }

        /* ── Scrollbar inside portal ── */
        #model-selector-portal .ms-list::-webkit-scrollbar {
          width: 4px;
        }
        #model-selector-portal .ms-list::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        #model-selector-portal .ms-list::-webkit-scrollbar-thumb {
          background:    var(--border);
          border-radius: 99px;
        }
        #model-selector-portal .ms-list::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }

        /* ── Model button hover ── */
        #model-selector-portal .ms-model-btn:hover {
          background:   var(--border) !important;
        }
      `}</style>

      {/* ── Header ─────────────────────────────── */}
      <div style={{
        padding: '13px 16px 10px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <p style={{
          margin: 0,
          fontSize: '10px',
          fontWeight: '700',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          Choose AI Model
        </p>
        <span style={{
          fontSize: '10px',
          color: 'var(--subtle)',
          background: 'var(--input)',
          padding: '2px 8px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
        }}>
          {AI_MODELS.filter((m) => m.free).length} free
        </span>
      </div>

      {/* ── Scrollable list ────────────────────── */}
      <div
        className="ms-list"
        style={{
          maxHeight: '340px',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '8px',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border) transparent',
        }}
      >
        {Object.keys(PROVIDER_CONFIG).map((providerName) => {
          const providerModels = AI_MODELS.filter(
            (m) => m.provider === providerName
          )
          if (!providerModels.length) return null
          const pc = PROVIDER_CONFIG[providerName]

          return (
            <div key={providerName} style={{ marginBottom: '8px' }}>

              {/* Provider header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px 6px',
              }}>
                <span style={{ fontSize: '11px', lineHeight: 1 }}>
                  {pc.icon}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: pc.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  {providerName}
                </span>
                <div style={{
                  flex: 1,
                  height: '1px',
                  background: `linear-gradient(to right, ${pc.color}55, transparent)`,
                }} />
              </div>

              {/* Models */}
              {providerModels.map((m) => {
                const isSelected = model === m.id
                const mpc = PROVIDER_CONFIG[m.provider]

                return (
                  <button
                    key={m.id}
                    data-selected={String(isSelected)}
                    className="ms-model-btn"
                    onClick={() => handleSelect(m.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '9px 10px',
                      borderRadius: '11px',
                      border: isSelected
                        ? `1px solid ${mpc.color}55`
                        : '1px solid transparent',
                      background: isSelected
                        ? `linear-gradient(135deg, ${mpc.glow}, transparent)`
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                      marginBottom: '2px',
                      scrollMargin: '8px',
                    }}
                  >
                    {/* Left — label + description */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      minWidth: 0,
                      flex: 1,
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? mpc.color : 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {m.label}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {m.description}
                      </span>
                    </div>

                    {/* Right — badges */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0,
                    }}>
                      {m.fast && (
                        <span style={{
                          fontSize: '11px',
                          color: '#38bdf8',
                          lineHeight: 1,
                        }}>
                          ⚡
                        </span>
                      )}
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: isSelected
                          ? `${mpc.color}33`
                          : `${mpc.color}18`,
                        color: mpc.color,
                        border: `1px solid ${mpc.color}33`,
                        whiteSpace: 'nowrap',
                      }}>
                        {m.badge}
                      </span>
                      {isSelected && (
                        <Check
                          size={13}
                          style={{ color: mpc.color, flexShrink: 0 }}
                        />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* ── Footer ─────────────────────────────── */}
      <div style={{
        padding: '8px 16px 12px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <p style={{
          margin: 0,
          fontSize: '11px',
          color: 'var(--subtle)',
        }}>
          💡 Groq models — 14,400 free req/day
        </p>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════
  // TRIGGER + PORTAL RENDER
  // ══════════════════════════════════════════════
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '6px 11px 6px 9px',
          borderRadius: '11px',
          border: `1px solid ${open ? pConfig.color + '66' : 'var(--border)'}`,
          background: open
            ? `linear-gradient(135deg, ${pConfig.glow}, var(--panel))`
            : 'var(--input)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: open ? `0 0 16px ${pConfig.glow}` : 'none',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.borderColor = pConfig.color + '44'
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        {/* Provider dot */}
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: pConfig.color,
          flexShrink: 0,
          boxShadow: `0 0 6px ${pConfig.color}`,
        }} />

        {/* Label */}
        <span style={{
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: open ? pConfig.color : 'var(--text)',
          transition: 'color 0.2s',
        }}>
          {current.label}
        </span>

        {/* Chevron */}
        <ChevronDown size={13} style={{
          color: 'var(--muted)',
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </button>

      {/* Portal dropdown — renders on document.body, never clipped */}
      {mounted && open && createPortal(dropdown, document.body)}
    </div>
  )
}