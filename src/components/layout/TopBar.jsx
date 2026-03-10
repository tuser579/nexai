'use client'
import { usePathname }  from 'next/navigation'
import { useSession }   from 'next-auth/react'
import { useAppStore }  from '@/store/appStore'
import ThemeToggle      from '@/components/ui/ThemeToggle'
import Avatar           from '@/components/ui/Avatar'
import Badge            from '@/components/ui/Badge'
import { Menu, X }      from 'lucide-react'

const TITLES = {
  '/chat':     { title: 'Chat',            sub: 'Ask anything'               },
  '/image':    { title: 'Image Generator', sub: 'Generate images with AI'    },
  '/video':    { title: 'Video Generator', sub: 'Generate videos with AI'    },
  '/analyze':  { title: 'Media Analysis',  sub: 'Analyze any file with AI'   },
  '/settings': { title: 'Settings',        sub: 'Manage your account'        },
}

export default function TopBar() {
  const pathname                          = usePathname()
  const { data: session }                 = useSession()
  const { sidebarOpen, setSidebarOpen }   = useAppStore()

  const key  = Object.keys(TITLES).find((k) => pathname?.startsWith(k)) || ''
  const info = TITLES[key] || { title: 'NexAI', sub: '' }

  return (
    <header style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '0 20px',
      height:         '60px',
      minHeight:      '60px',
      borderBottom:   '1px solid var(--border)',
      background:     'var(--nav)',
      position:       'relative',
      zIndex:         10,
    }}>

      {/* ── Left ────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Hamburger toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '36px',
            height:         '36px',
            borderRadius:   '10px',
            border:         '1px solid var(--border)',
            background:     sidebarOpen ? 'var(--input)' : 'var(--panel)',
            color:          sidebarOpen ? 'var(--text)' : 'var(--muted)',
            cursor:         'pointer',
            flexShrink:     0,
            transition:     'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#6c63ff66'
            e.currentTarget.style.color       = 'var(--text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color       = sidebarOpen ? 'var(--text)' : 'var(--muted)'
          }}
        >
          {sidebarOpen
            ? <X    size={18} />
            : <Menu size={18} />
          }
        </button>

        {/* Page title */}
        <div>
          <h1 style={{
            fontSize:   '15px',
            fontWeight: '700',
            color:      'var(--text)',
            fontFamily: 'Syne, sans-serif',
            margin:     0,
            lineHeight: '1.2',
          }}>
            {info.title}
          </h1>
          {info.sub && (
            <p className='hidden sm:block' style={{
              fontSize:   '11px',
              color:      'var(--muted)',
              margin:     0,
              lineHeight: '1.3',
            }}>
              {info.sub}
            </p>
          )}
        </div>
      </div>

      {/* ── Right ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ThemeToggle />

        {session?.user && (
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '8px',
            padding:      '6px 10px',
            borderRadius: '12px',
            border:       '1px solid var(--border)',
            background:   'var(--panel)',
          }}>
            <Avatar
              src={session.user.avatar || session.user.image}
              name={session.user.name || 'U'}
              size="sm"
            />
            <span style={{
              fontSize:     '13px',
              fontWeight:   '500',
              color:        'var(--text)',
              maxWidth:     '120px',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}>
              {session.user.name || 'User'}
            </span>
            <Badge variant="free" size="xs">
              {session.user.plan || 'free'}
            </Badge>
          </div>
        )}
      </div>
    </header>
  )
}