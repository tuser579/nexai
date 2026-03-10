'use client'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession }  from 'next-auth/react'
import { useAppStore } from '@/store/appStore'
import Avatar          from '@/components/ui/Avatar'
import Badge           from '@/components/ui/Badge'
import {
  MessageSquare, Image, Video,
  FileSearch, Settings, Plus, Sparkles,
} from 'lucide-react'

const NAV = [
  { href: '/chat',     label: 'Chat',          icon: MessageSquare },
  { href: '/image',    label: 'Image Gen',      icon: Image         },
  { href: '/video',    label: 'Video Gen',      icon: Video         },
  { href: '/analyze',  label: 'Media Analysis', icon: FileSearch    },
  { href: '/settings', label: 'Settings',       icon: Settings      },
]

function Tooltip({ label, children }) {
  return (
    <div style={{ position: 'relative', display: 'flex' }}
      className="tooltip-wrap"
    >
      {children}
      <div className="tooltip-box" style={{
        position:     'absolute',
        left:         'calc(100% + 10px)',
        top:          '50%',
        transform:    'translateY(-50%)',
        background:   'var(--text)',
        color:        'var(--bg)',
        fontSize:     '11px',
        fontWeight:   '600',
        padding:      '5px 10px',
        borderRadius: '8px',
        whiteSpace:   'nowrap',
        pointerEvents:'none',
        zIndex:       9999,
        opacity:      0,
        transition:   'opacity 0.15s, transform 0.15s',
        boxShadow:    '0 4px 12px rgba(0,0,0,0.3)',
      }}>
        {label}
        {/* Arrow */}
        <div style={{
          position:   'absolute',
          right:      '100%',
          top:        '50%',
          transform:  'translateY(-50%)',
          borderWidth:'4px',
          borderStyle:'solid',
          borderColor:'transparent var(--text) transparent transparent',
          width:      0,
          height:     0,
        }} />
      </div>

      <style>{`
        .tooltip-wrap:hover .tooltip-box {
          opacity: 1 !important;
          transform: translateY(-50%) translateX(2px) !important;
        }
      `}</style>
    </div>
  )
}

export default function Sidebar({ onNavigate }) {
  const pathname          = usePathname()
  const { data: session } = useSession()
  const { sidebarOpen, chatSessions } = useAppStore()

  // Desktop: collapsed when sidebarOpen=false, expanded when true
  // Mobile:  controlled by parent drawer (always full width=240px)
  const collapsed = !sidebarOpen

  return (
    <div style={{
      width:         '100%',
      height:        '100vh',
      background:    'var(--nav)',
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
      position:      'relative',
    }}>

      {/* ══════════════════════════════
          LOGO
      ══════════════════════════════ */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap:            '10px',
        padding:        collapsed ? '14px 0' : '14px 16px',
        borderBottom:   '1px solid var(--border)',
        minHeight:      '60px',
        transition:     'padding 0.25s',
      }}>
        <Tooltip label="NexAI Home">
          <div style={{
            width:          '32px',
            height:         '32px',
            minWidth:       '32px',
            borderRadius:   '10px',
            background:     'linear-gradient(135deg, #6c63ff, #ff6584)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            boxShadow:      '0 0 20px #6c63ff44',
            flexShrink:     0,
          }}>
            <Sparkles size={16} color="white" />
          </div>
        </Tooltip>

        {!collapsed && (
          <span style={{
            fontFamily:           'Syne, sans-serif',
            fontWeight:           '800',
            fontSize:             '18px',
            background:           'linear-gradient(135deg, #6c63ff, #ff6584)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            whiteSpace:           'nowrap',
            opacity:              1,
            transition:           'opacity 0.2s',
          }}>
            NexAI
          </span>
        )}
      </div>

      {/* ══════════════════════════════
          NEW CHAT
      ══════════════════════════════ */}
      <div style={{
        padding:      collapsed ? '10px 8px' : '10px 12px',
        borderBottom: '1px solid var(--border)',
        transition:   'padding 0.25s',
      }}>
        <Tooltip label="New Chat">
          <Link
            href="/chat"
            onClick={onNavigate}
            style={{ textDecoration: 'none', width: '100%', display: 'block' }}
          >
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap:            '8px',
              padding:        collapsed ? '9px' : '9px 12px',
              borderRadius:   '11px',
              background:     'linear-gradient(135deg, #6c63ff22, #ff658411)',
              border:         '1px solid #6c63ff44',
              cursor:         'pointer',
              transition:     'all 0.15s',
              width:          '100%',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = 'linear-gradient(135deg, #6c63ff33, #ff658422)'
                e.currentTarget.style.borderColor = '#6c63ff66'
                e.currentTarget.style.transform   = 'translateY(-1px)'
                e.currentTarget.style.boxShadow   = '0 4px 12px #6c63ff22'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = 'linear-gradient(135deg, #6c63ff22, #ff658411)'
                e.currentTarget.style.borderColor = '#6c63ff44'
                e.currentTarget.style.transform   = 'translateY(0)'
                e.currentTarget.style.boxShadow   = 'none'
              }}
            >
              <Plus size={16} color="#6c63ff" style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{
                  fontSize:   '13px',
                  fontWeight: '600',
                  color:      '#6c63ff',
                  whiteSpace: 'nowrap',
                }}>
                  New Chat
                </span>
              )}
            </div>
          </Link>
        </Tooltip>
      </div>

      {/* ══════════════════════════════
          NAV LINKS
      ══════════════════════════════ */}
      <nav style={{
        padding:       collapsed ? '8px 8px' : '8px',
        display:       'flex',
        flexDirection: 'column',
        gap:           '2px',
      }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href)
          return (
            <Tooltip key={href} label={label}>
              <Link
                href={href}
                onClick={onNavigate}
                style={{ textDecoration: 'none', width: '100%', display: 'block' }}
              >
                <div style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap:            '10px',
                  padding:        collapsed ? '10px' : '10px 12px',
                  borderRadius:   '11px',
                  background:     active ? '#6c63ff18' : 'transparent',
                  border:         active ? '1px solid #6c63ff33' : '1px solid transparent',
                  cursor:         'pointer',
                  transition:     'all 0.15s',
                  position:       'relative',
                }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--panel)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <div style={{
                      position:     'absolute',
                      left:         0,
                      top:          '20%',
                      bottom:       '20%',
                      width:        '3px',
                      borderRadius: '0 3px 3px 0',
                      background:   '#6c63ff',
                      boxShadow:    '0 0 8px #6c63ff',
                    }} />
                  )}

                  <Icon
                    size={18}
                    color={active ? '#6c63ff' : 'var(--muted)'}
                    style={{ flexShrink: 0 }}
                  />

                  {!collapsed && (
                    <span style={{
                      fontSize:   '13px',
                      fontWeight: active ? '600' : '400',
                      color:      active ? '#6c63ff' : 'var(--text)',
                      whiteSpace: 'nowrap',
                    }}>
                      {label}
                    </span>
                  )}
                </div>
              </Link>
            </Tooltip>
          )
        })}
      </nav>

      {/* ══════════════════════════════
          CHAT HISTORY (only expanded)
      ══════════════════════════════ */}
      {!collapsed && (
        <div style={{
          flex:      1,
          overflowY: 'auto',
          padding:   '4px 8px',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{
            fontSize:      '10px',
            fontWeight:    '600',
            color:         'var(--subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding:       '10px 4px 6px',
            margin:        0,
          }}>
            Recent Chats
          </p>

          {chatSessions?.length > 0 ? (
            chatSessions.slice(0, 12).map((chat) => (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                onClick={onNavigate}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{
                  padding:      '7px 8px',
                  borderRadius: '8px',
                  cursor:       'pointer',
                  transition:   'background 0.15s',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '8px',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MessageSquare size={12} color="var(--subtle)" style={{ flexShrink: 0 }} />
                  <p style={{
                    fontSize:     '12px',
                    color:        'var(--muted)',
                    overflow:     'hidden',
                    whiteSpace:   'nowrap',
                    textOverflow: 'ellipsis',
                    margin:       0,
                  }}>
                    {chat.title || 'Untitled Chat'}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p style={{
              fontSize: '12px',
              color:    'var(--subtle)',
              padding:  '4px',
              margin:   0,
            }}>
              No chats yet. Start a conversation!
            </p>
          )}
        </div>
      )}

      {/* Collapsed: spacer */}
      {collapsed && <div style={{ flex: 1 }} />}

      {/* ══════════════════════════════
          USER INFO
      ══════════════════════════════ */}
      <div style={{
        padding:        collapsed ? '12px 8px' : '12px',
        borderTop:      '1px solid var(--border)',
        display:        'flex',
        alignItems:     'center',
        gap:            '8px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition:     'padding 0.25s',
      }}>
        <Tooltip label={session?.user?.name || 'Profile'}>
          <Avatar
            src={session?.user?.avatar || session?.user?.image}
            name={session?.user?.name || 'U'}
            size="sm"
          />
        </Tooltip>

        {!collapsed && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize:     '12px',
              fontWeight:   '600',
              color:        'var(--text)',
              overflow:     'hidden',
              whiteSpace:   'nowrap',
              textOverflow: 'ellipsis',
              margin:       '0 0 2px',
            }}>
              {session?.user?.name || 'User'}
            </p>
            <Badge variant="free" size="xs">
              {session?.user?.plan || 'free'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}