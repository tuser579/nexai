'use client'
import { useState }    from 'react'
import { useSession }  from 'next-auth/react'
import {
  Sparkles, Download, Trash2, RefreshCw,
  ImageIcon, Wand2, ChevronDown, Lock,
  ZoomIn, Copy, Check, Grid3X3, LayoutList,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STYLES = [
  { id: 'photorealistic', label: 'Photorealistic', emoji: '📷' },
  { id: 'digital-art',    label: 'Digital Art',    emoji: '🎨' },
  { id: 'anime',          label: 'Anime',          emoji: '✨' },
  { id: 'oil-painting',   label: 'Oil Painting',   emoji: '🖼️' },
  { id: 'watercolor',     label: 'Watercolor',     emoji: '💧' },
  { id: 'sketch',         label: 'Sketch',         emoji: '✏️' },
  { id: 'cinematic',      label: 'Cinematic',      emoji: '🎬' },
  { id: 'fantasy',        label: 'Fantasy',        emoji: '🔮' },
  { id: '3d-render',      label: '3D Render',      emoji: '💎' },
  { id: 'pixel-art',      label: 'Pixel Art',      emoji: '👾' },
  { id: 'minimalist',     label: 'Minimalist',     emoji: '⬜' },
  { id: 'cyberpunk',      label: 'Cyberpunk',      emoji: '🌆' },
]

const SIZES = [
  { id: '512x512',   label: '512×512',   tag: 'Square'    },
  { id: '768x512',   label: '768×512',   tag: 'Landscape' },
  { id: '512x768',   label: '512×768',   tag: 'Portrait'  },
  { id: '1024x1024', label: '1024×1024', tag: 'HD Square' },
]

const SUGGESTIONS = [
  'A futuristic city at night with neon lights',
  'A serene Japanese garden in autumn',
  'An astronaut floating in a colorful nebula',
  'A cozy cabin in snowy mountains',
  'A dragon flying over an ancient castle',
  'Abstract geometric patterns in gold and black',
]

export default function ImagePage() {
  const { data: session } = useSession()

  const [prompt,      setPrompt]      = useState('')
  const [style,       setStyle]       = useState('photorealistic')
  const [size,        setSize]        = useState('512x512')
  const [loading,     setLoading]     = useState(false)
  const [images,      setImages]      = useState([])
  const [previewImg,  setPreviewImg]  = useState(null)
  const [copied,      setCopied]      = useState(false)
  const [gridView,    setGridView]    = useState(true)
  const [styleOpen,   setStyleOpen]   = useState(false)

  const currentStyle = STYLES.find((s) => s.id === style) || STYLES[0]

  // ── Generate ───────────────────────────────────
  async function handleGenerate() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    try {
      const res  = await fetch('/api/image', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: prompt.trim(), style, size }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      const newImg = {
        id:        Date.now(),
        url:       data.imageUrl || data.url,
        prompt:    prompt.trim(),
        style,
        size,
        createdAt: new Date().toISOString(),
      }
      setImages((prev) => [newImg, ...prev])
      toast.success('Image generated!')
    } catch (err) {
      toast.error(err.message || 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  // ── Download ───────────────────────────────────
  async function handleDownload(img) {
    try {
      const res  = await fetch(img.url)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `nexai-${img.id}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
    } catch {
      toast.error('Download failed')
    }
  }

  // ── Copy prompt ────────────────────────────────
  async function handleCopyPrompt(text) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Prompt copied!')
  }

  // ── Delete ─────────────────────────────────────
  function handleDelete(id) {
    setImages((prev) => prev.filter((img) => img.id !== id))
    if (previewImg?.id === id) setPreviewImg(null)
    toast.success('Removed')
  }

  return (
    <div style={{
      height:        '100%',
      display:       'flex',
      flexDirection: 'column',
      background:    'var(--bg)',
      overflowY:     'auto',
    }}>

      <style>{`
        /* ── Responsive grid ── */
        .img-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 640px)  { .img-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .img-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1280px) { .img-grid { grid-template-columns: repeat(5, 1fr); } }

        .img-grid-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── Style chip scroll ── */
        .style-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .style-scroll::-webkit-scrollbar { display: none; }

        /* ── Image card ── */
        .img-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          background: var(--panel);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          aspect-ratio: 1;
        }
        .img-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .img-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 12px;
        }
        .img-card:hover .img-card-overlay { opacity: 1; }

        /* ── Generate button ── */
        .gen-btn {
          transition: all 0.2s;
        }
        .gen-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px #6c63ff66 !important;
        }
        .gen-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        /* ── Suggestion chips ── */
        .suggestion-chip:hover {
          border-color: #6c63ff66 !important;
          background: #6c63ff11 !important;
          color: var(--text) !important;
        }

        /* ── Style chip ── */
        .style-chip:hover {
          border-color: #6c63ff55 !important;
          background: #6c63ff11 !important;
        }

        /* ── Size btn ── */
        .size-btn:hover {
          border-color: #6c63ff55 !important;
        }

        /* ── Preview modal ── */
        .preview-modal {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .preview-img-wrap {
          animation: scaleIn 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1);    }
        }

        /* ── Shimmer loading ── */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            var(--panel) 25%,
            var(--border) 50%,
            var(--panel) 75%
          );
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }

        /* ── Textarea ── */
        .prompt-textarea {
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: var(--text);
          font-size: 14px;
          line-height: 1.6;
          width: 100%;
          font-family: inherit;
        }
        .prompt-textarea::placeholder { color: var(--muted); }

        /* ── Responsive layout ── */
        .page-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 16px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .page-layout {
            flex-direction: row;
            align-items: flex-start;
            padding: 24px;
          }
        }
        .left-panel {
          width: 100%;
        }
        @media (min-width: 1024px) {
          .left-panel {
            width: 360px;
            min-width: 320px;
            max-width: 380px;
            position: sticky;
            top: 0;
          }
        }
        .right-panel {
          flex: 1;
          min-width: 0;
        }
      `}</style>

      <div className="page-layout">

        {/* ══════════════════════════════════════
            LEFT — Control Panel
        ══════════════════════════════════════ */}
        <div className="left-panel">
          <div style={{
            background:   'var(--panel)',
            border:       '1px solid var(--border)',
            borderRadius: '20px',
            overflow:     'hidden',
          }}>

            {/* Panel header */}
            <div style={{
              padding:    '16px 18px 14px',
              borderBottom: '1px solid var(--border)',
              display:    'flex',
              alignItems: 'center',
              gap:        '10px',
            }}>
              <div style={{
                width:          '32px',
                height:         '32px',
                borderRadius:   '10px',
                background:     'linear-gradient(135deg, #6c63ff, #ff6584)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
                boxShadow:      '0 0 16px #6c63ff44',
              }}>
                <Wand2 size={16} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>
                  Image Generator
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
                  Powered by Stable Diffusion
                </p>
              </div>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* ── Prompt ──────────────────────── */}
              <div>
                <label style={{
                  fontSize:    '11px',
                  fontWeight:  '600',
                  color:       'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display:     'block',
                  marginBottom:'8px',
                }}>
                  Prompt
                </label>
                <div style={{
                  background:   'var(--input)',
                  border:       '1.5px solid var(--border)',
                  borderRadius: '14px',
                  padding:      '12px 14px',
                  transition:   'border-color 0.2s',
                }}
                  onFocusCapture={(e) => e.currentTarget.style.borderColor = '#6c63ff66'}
                  onBlurCapture={(e)  => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <textarea
                    className="prompt-textarea"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    rows={4}
                    style={{ minHeight: '90px', maxHeight: '160px' }}
                  />
                  <div style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    marginTop:      '8px',
                    paddingTop:     '8px',
                    borderTop:      '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '11px', color: prompt.length > 400 ? '#f87171' : 'var(--subtle)' }}>
                      {prompt.length}/500
                    </span>
                    {prompt && (
                      <button
                        onClick={() => setPrompt('')}
                        style={{
                          fontSize:   '11px',
                          color:      'var(--muted)',
                          background: 'none',
                          border:     'none',
                          cursor:     'pointer',
                          padding:    '2px 6px',
                          borderRadius: '6px',
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '10px', color: 'var(--subtle)', margin: '0 0 6px' }}>
                    Try a suggestion:
                  </p>
                  <div style={{
                    display:  'flex',
                    flexWrap: 'wrap',
                    gap:      '5px',
                  }}>
                    {SUGGESTIONS.slice(0, 3).map((s) => (
                      <button
                        key={s}
                        className="suggestion-chip"
                        onClick={() => setPrompt(s)}
                        style={{
                          fontSize:     '10px',
                          padding:      '4px 9px',
                          borderRadius: '20px',
                          border:       '1px solid var(--border)',
                          background:   'var(--input)',
                          color:        'var(--muted)',
                          cursor:       'pointer',
                          transition:   'all 0.15s',
                          whiteSpace:   'nowrap',
                        }}
                      >
                        {s.slice(0, 28)}…
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Style ───────────────────────── */}
              <div>
                <label style={{
                  fontSize:    '11px',
                  fontWeight:  '600',
                  color:       'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display:     'block',
                  marginBottom:'8px',
                }}>
                  Style
                </label>
                <div className="style-scroll">
                  {STYLES.map((s) => {
                    const active = style === s.id
                    return (
                      <button
                        key={s.id}
                        className="style-chip"
                        onClick={() => setStyle(s.id)}
                        style={{
                          display:      'flex',
                          alignItems:   'center',
                          gap:          '5px',
                          padding:      '6px 11px',
                          borderRadius: '20px',
                          border:       active
                            ? '1px solid #6c63ff88'
                            : '1px solid var(--border)',
                          background:   active ? '#6c63ff22' : 'var(--input)',
                          color:        active ? '#a78bfa'   : 'var(--muted)',
                          fontSize:     '12px',
                          fontWeight:   active ? '600' : '400',
                          cursor:       'pointer',
                          whiteSpace:   'nowrap',
                          transition:   'all 0.15s',
                          flexShrink:   0,
                        }}
                      >
                        <span style={{ fontSize: '13px' }}>{s.emoji}</span>
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Size ────────────────────────── */}
              <div>
                <label style={{
                  fontSize:    '11px',
                  fontWeight:  '600',
                  color:       'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display:     'block',
                  marginBottom:'8px',
                }}>
                  Size
                </label>
                <div style={{
                  display:             'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap:                 '7px',
                }}>
                  {SIZES.map((s) => {
                    const active = size === s.id
                    return (
                      <button
                        key={s.id}
                        className="size-btn"
                        onClick={() => setSize(s.id)}
                        style={{
                          padding:      '9px 8px',
                          borderRadius: '12px',
                          border:       active
                            ? '1.5px solid #6c63ff88'
                            : '1px solid var(--border)',
                          background:   active ? '#6c63ff18' : 'var(--input)',
                          cursor:       'pointer',
                          transition:   'all 0.15s',
                          textAlign:    'center',
                        }}
                      >
                        <p style={{
                          margin:     0,
                          fontSize:   '12px',
                          fontWeight: active ? '700' : '500',
                          color:      active ? '#a78bfa' : 'var(--text)',
                        }}>
                          {s.label}
                        </p>
                        <p style={{
                          margin:   0,
                          fontSize: '10px',
                          color:    active ? '#6c63ff' : 'var(--subtle)',
                        }}>
                          {s.tag}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Generate button ──────────────── */}
              <button
                className="gen-btn"
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                style={{
                  width:          '100%',
                  padding:        '14px',
                  borderRadius:   '14px',
                  border:         'none',
                  background:     (!prompt.trim() || loading)
                    ? 'var(--border)'
                    : 'linear-gradient(135deg, #6c63ff, #9c8fff)',
                  color:          (!prompt.trim() || loading)
                    ? 'var(--muted)'
                    : 'white',
                  fontSize:       '14px',
                  fontWeight:     '700',
                  cursor:         (!prompt.trim() || loading)
                    ? 'not-allowed'
                    : 'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '8px',
                  boxShadow:      (!prompt.trim() || loading)
                    ? 'none'
                    : '0 4px 20px #6c63ff44',
                  transition:     'all 0.2s',
                  fontFamily:     'Syne, sans-serif',
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Image
                  </>
                )}
              </button>

              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg);   }
                  to   { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT — Gallery
        ══════════════════════════════════════ */}
        <div className="right-panel">

          {/* Gallery header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   '14px',
            flexWrap:       'wrap',
            gap:            '10px',
          }}>
            <div>
              <h2 style={{
                margin:     0,
                fontSize:   '16px',
                fontWeight: '700',
                color:      'var(--text)',
                fontFamily: 'Syne, sans-serif',
              }}>
                Gallery
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                {images.length} image{images.length !== 1 ? 's' : ''} generated
              </p>
            </div>

            {images.length > 0 && (
              <div style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '6px',
                background:   'var(--panel)',
                border:       '1px solid var(--border)',
                borderRadius: '10px',
                padding:      '4px',
              }}>
                <button
                  onClick={() => setGridView(true)}
                  style={{
                    padding:      '6px 10px',
                    borderRadius: '8px',
                    border:       'none',
                    background:   gridView ? 'var(--input)' : 'transparent',
                    color:        gridView ? 'var(--text)' : 'var(--muted)',
                    cursor:       'pointer',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '5px',
                    fontSize:     '12px',
                    fontWeight:   gridView ? '600' : '400',
                    transition:   'all 0.15s',
                  }}
                >
                  <Grid3X3 size={13} />
                  Grid
                </button>
                <button
                  onClick={() => setGridView(false)}
                  style={{
                    padding:      '6px 10px',
                    borderRadius: '8px',
                    border:       'none',
                    background:   !gridView ? 'var(--input)' : 'transparent',
                    color:        !gridView ? 'var(--text)' : 'var(--muted)',
                    cursor:       'pointer',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '5px',
                    fontSize:     '12px',
                    fontWeight:   !gridView ? '600' : '400',
                    transition:   'all 0.15s',
                  }}
                >
                  <LayoutList size={13} />
                  List
                </button>
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{
              marginBottom:        '14px',
              display:             'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap:                 '12px',
            }}>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="shimmer"
                  style={{
                    aspectRatio:  '1',
                    borderRadius: '14px',
                    border:       '1px solid var(--border)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && images.length === 0 && (
            <div style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        '60px 20px',
              background:     'var(--panel)',
              border:         '1px dashed var(--border)',
              borderRadius:   '20px',
              gap:            '16px',
              textAlign:      'center',
            }}>
              <div style={{
                width:          '64px',
                height:         '64px',
                borderRadius:   '20px',
                background:     'linear-gradient(135deg, #6c63ff22, #ff658411)',
                border:         '1px solid #6c63ff33',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}>
                <ImageIcon size={28} color="#6c63ff" />
              </div>
              <div>
                <p style={{
                  margin:     0,
                  fontSize:   '15px',
                  fontWeight: '700',
                  color:      'var(--text)',
                  fontFamily: 'Syne, sans-serif',
                }}>
                  No images yet
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                  Write a prompt and click Generate
                </p>
              </div>

              {/* Quick suggestions */}
              <div style={{
                display:  'flex',
                flexWrap: 'wrap',
                gap:      '8px',
                justifyContent: 'center',
                maxWidth: '400px',
              }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="suggestion-chip"
                    onClick={() => setPrompt(s)}
                    style={{
                      fontSize:     '11px',
                      padding:      '6px 12px',
                      borderRadius: '20px',
                      border:       '1px solid var(--border)',
                      background:   'var(--input)',
                      color:        'var(--muted)',
                      cursor:       'pointer',
                      transition:   'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid view */}
          {!loading && images.length > 0 && gridView && (
            <div className="img-grid">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="img-card"
                  onClick={() => setPreviewImg(img)}
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    style={{
                      width:      '100%',
                      height:     '100%',
                      objectFit:  'cover',
                      display:    'block',
                    }}
                  />
                  <div className="img-card-overlay">
                    <p style={{
                      margin:       0,
                      fontSize:     '11px',
                      color:        'rgba(255,255,255,0.9)',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                      marginBottom: '8px',
                    }}>
                      {img.prompt}
                    </p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(img) }}
                        style={{
                          flex:           1,
                          padding:        '6px',
                          borderRadius:   '8px',
                          border:         'none',
                          background:     'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)',
                          color:          'white',
                          cursor:         'pointer',
                          display:        'flex',
                          alignItems:     'center',
                          justifyContent: 'center',
                          gap:            '4px',
                          fontSize:       '11px',
                          fontWeight:     '600',
                        }}
                      >
                        <Download size={12} /> Save
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
                        style={{
                          padding:        '6px 8px',
                          borderRadius:   '8px',
                          border:         'none',
                          background:     'rgba(248,113,113,0.3)',
                          backdropFilter: 'blur(8px)',
                          color:          '#fca5a5',
                          cursor:         'pointer',
                          display:        'flex',
                          alignItems:     'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Style badge */}
                  <div style={{
                    position:     'absolute',
                    top:          '8px',
                    right:        '8px',
                    background:   'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '6px',
                    padding:      '3px 7px',
                    fontSize:     '9px',
                    fontWeight:   '600',
                    color:        'rgba(255,255,255,0.8)',
                    textTransform: 'capitalize',
                  }}>
                    {img.style}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List view */}
          {!loading && images.length > 0 && !gridView && (
            <div className="img-grid-list">
              {images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    display:      'flex',
                    gap:          '14px',
                    background:   'var(--panel)',
                    border:       '1px solid var(--border)',
                    borderRadius: '16px',
                    padding:      '12px',
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                  }}
                  onClick={() => setPreviewImg(img)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6c63ff44'
                    e.currentTarget.style.transform   = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.transform   = 'translateY(0)'
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    style={{
                      width:        '80px',
                      height:       '80px',
                      borderRadius: '10px',
                      objectFit:    'cover',
                      flexShrink:   0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin:       '0 0 4px',
                      fontSize:     '13px',
                      fontWeight:   '500',
                      color:        'var(--text)',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                    }}>
                      {img.prompt}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{
                        fontSize:     '10px',
                        padding:      '2px 8px',
                        borderRadius: '6px',
                        background:   '#6c63ff22',
                        color:        '#a78bfa',
                        border:       '1px solid #6c63ff33',
                        fontWeight:   '600',
                      }}>
                        {img.style}
                      </span>
                      <span style={{
                        fontSize:     '10px',
                        padding:      '2px 8px',
                        borderRadius: '6px',
                        background:   'var(--input)',
                        color:        'var(--muted)',
                        border:       '1px solid var(--border)',
                      }}>
                        {img.size}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(img) }}
                        style={{
                          padding:      '5px 10px',
                          borderRadius: '8px',
                          border:       '1px solid var(--border)',
                          background:   'var(--input)',
                          color:        'var(--muted)',
                          cursor:       'pointer',
                          display:      'flex',
                          alignItems:   'center',
                          gap:          '5px',
                          fontSize:     '11px',
                          fontWeight:   '500',
                          transition:   'all 0.15s',
                        }}
                      >
                        <Download size={12} /> Download
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopyPrompt(img.prompt) }}
                        style={{
                          padding:      '5px 10px',
                          borderRadius: '8px',
                          border:       '1px solid var(--border)',
                          background:   'var(--input)',
                          color:        'var(--muted)',
                          cursor:       'pointer',
                          display:      'flex',
                          alignItems:   'center',
                          gap:          '5px',
                          fontSize:     '11px',
                          transition:   'all 0.15s',
                        }}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        Copy
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
                        style={{
                          padding:      '5px 8px',
                          borderRadius: '8px',
                          border:       '1px solid #f8717133',
                          background:   '#f8717111',
                          color:        '#f87171',
                          cursor:       'pointer',
                          display:      'flex',
                          alignItems:   'center',
                          justifyContent: 'center',
                          transition:   'all 0.15s',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          PREVIEW MODAL
      ══════════════════════════════════════ */}
      {previewImg && (
        <div
          className="preview-modal"
          onClick={() => setPreviewImg(null)}
          style={{
            position:        'fixed',
            inset:           0,
            zIndex:          99999,
            background:      'rgba(0,0,0,0.88)',
            backdropFilter:  'blur(12px)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            padding:         '16px',
          }}
        >
          <div
            className="preview-img-wrap"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:   'var(--panel)',
              border:       '1px solid var(--border)',
              borderRadius: '22px',
              overflow:     'hidden',
              maxWidth:     '90vw',
              maxHeight:    '90vh',
              display:      'flex',
              flexDirection:'column',
              boxShadow:    '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Modal image */}
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
              <img
                src={previewImg.url}
                alt={previewImg.prompt}
                style={{
                  display:   'block',
                  maxWidth:  '80vw',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Modal footer */}
            <div style={{
              padding:      '14px 18px',
              borderTop:    '1px solid var(--border)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'space-between',
              gap:          '12px',
              flexWrap:     'wrap',
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  margin:       0,
                  fontSize:     '13px',
                  color:        'var(--text)',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                  fontWeight:   '500',
                }}>
                  {previewImg.prompt}
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px',
                    borderRadius: '6px', background: '#6c63ff22',
                    color: '#a78bfa', border: '1px solid #6c63ff33',
                  }}>
                    {previewImg.style}
                  </span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px',
                    borderRadius: '6px', background: 'var(--input)',
                    color: 'var(--muted)', border: '1px solid var(--border)',
                  }}>
                    {previewImg.size}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleDownload(previewImg)}
                  style={{
                    padding:        '8px 16px',
                    borderRadius:   '10px',
                    border:         'none',
                    background:     'linear-gradient(135deg, #6c63ff, #9c8fff)',
                    color:          'white',
                    cursor:         'pointer',
                    display:        'flex',
                    alignItems:     'center',
                    gap:            '6px',
                    fontSize:       '13px',
                    fontWeight:     '600',
                    boxShadow:      '0 4px 16px #6c63ff44',
                  }}
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={() => setPreviewImg(null)}
                  style={{
                    padding:      '8px 14px',
                    borderRadius: '10px',
                    border:       '1px solid var(--border)',
                    background:   'var(--input)',
                    color:        'var(--muted)',
                    cursor:       'pointer',
                    fontSize:     '13px',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}