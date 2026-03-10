'use client'
import { useEffect }          from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession }         from 'next-auth/react'
import { useAppStore }        from '@/store/appStore'
import Avatar                 from '@/components/ui/Avatar'
import Badge                  from '@/components/ui/Badge'
import ThemeToggle            from '@/components/ui/ThemeToggle'
import { signOut }            from 'next-auth/react'
import {
  X, MessageSquare, Image, Video,
  FileSearch, Settings, Plus,
  Sparkles, LogOut, Trash2,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'chat',     label: 'Chat',           icon: MessageSquare, href: '/chat'    },
  { id: 'image',    label: 'Image Gen',       icon: Image,         href: '/image'   },
  { id: 'video',    label: 'Video Gen',       icon: Video,         href: '/video'   },
  { id: 'analyze',  label: 'Media Analysis',  icon: FileSearch,    href: '/analyze' },
  { id: 'settings', label: 'Settings',        icon: Settings,      href: '/settings'},
]

export default function MobileSidebar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const {
    mobileSidebarOpen,
    setMobileSidebarOpen,
    chatSessions,
    clearMessages,
    activeChatId,
    setActiveChatId,
    deleteChatSession,
  } = useAppStore()

  // ── Close on route change ──────────────────────
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  // ── Prevent body scroll when open ─────────────
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileSidebarOpen])

  function handleNewChat() {
    clearMessages()
    router.push('/chat')
    setMobileSidebarOpen(false)
  }

  function handleLoadChat(chatId) {
    setActiveChatId(chatId)
    router.push(`/chat/${chatId}`)
    setMobileSidebarOpen(false)
  }

  async function handleDeleteChat(e, chatId) {
    e.stopPropagation()
    try {
      await fetch(`/api/chat/history/${chatId}`, { method: 'DELETE' })
      deleteChatSession(chatId)
      if (activeChatId === chatId) {
        clearMessages()
        router.push('/chat')
      }
    } catch (err) {
      console.error('Delete chat error:', err)
    }
  }

  function isActive(href) {
    return pathname.startsWith(href)
  }

  if (!mobileSidebarOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="
          fixed inset-0 z-40
          bg-black/60 backdrop-blur-sm
          md:hidden
        "
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Drawer */}
      <div className="
        fixed left-0 top-0 bottom-0 z-50
        w-72 flex flex-col
        bg-[var(--nav)] border-r border-[var(--border)]
        shadow-[4px_0_30px_rgba(0,0,0,0.4)]
        animate-slide-in md:hidden
      ">

        {/* Header */}
        <div className="
          flex items-center justify-between
          px-4 py-4 border-b border-[var(--border)]
        ">
          <div className="flex items-center gap-2">
            <div className="
              w-8 h-8 rounded-xl
              bg-gradient-to-br from-[#6c63ff] to-[#ff6584]
              flex items-center justify-center
            ">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="
              font-display font-bold text-lg
              bg-gradient-to-r from-[#6c63ff] to-[#ff6584]
              bg-clip-text text-transparent
            ">
              NexAI
            </span>
          </div>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="
              w-8 h-8 flex items-center justify-center rounded-xl
              text-[var(--muted)] hover:text-[var(--text)]
              hover:bg-[var(--panel)] transition-all cursor-pointer
            "
          >
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="
              w-full flex items-center gap-3
              px-3 py-2.5
              bg-[#6c63ff22] hover:bg-[#6c63ff33]
              border border-[#6c63ff33]
              text-[#6c63ff] rounded-xl
              transition-all cursor-pointer
            "
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => (
            <button
              key={id}
              onClick={() => router.push(href)}
              className={`
                w-full flex items-center gap-3
                px-3 py-2.5 rounded-xl
                transition-all cursor-pointer text-left
                ${isActive(href)
                  ? 'bg-[#6c63ff22] text-[#6c63ff] border border-[#6c63ff33]'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel)]'
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </nav>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          <p className="
            px-4 pb-2
            text-[10px] font-semibold uppercase tracking-widest
            text-[var(--subtle)]
          ">
            Recent Chats
          </p>

          <div className="
            flex-1 overflow-y-auto no-scrollbar px-3 pb-4
          ">
            {chatSessions.length === 0 && (
              <p className="
                text-xs text-[var(--subtle)] text-center py-4
              ">
                No chats yet
              </p>
            )}

            {chatSessions.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleLoadChat(chat._id)}
                className="
                  group flex items-center gap-2
                  px-3 py-2 rounded-xl mb-1
                  cursor-pointer
                  hover:bg-[var(--panel)]
                  transition-all
                "
              >
                <span className="
                  flex-1 text-xs text-[var(--muted)] truncate
                ">
                  {chat.title || 'New Chat'}
                </span>
                <button
                  onClick={(e) => handleDeleteChat(e, chat._id)}
                  className="
                    hidden group-hover:flex p-1 rounded-lg
                    text-[var(--subtle)] hover:text-[#f87171]
                    transition-all
                  "
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — User */}
        <div className="
          border-t border-[var(--border)] p-4
          flex items-center gap-3
        ">
          <Avatar
            src={session?.user?.avatar || session?.user?.image}
            name={session?.user?.name || 'User'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text)] truncate">
              {session?.user?.name || 'User'}
            </p>
            <Badge variant="free" size="xs">
              {session?.user?.plan || 'free'}
            </Badge>
          </div>
          <ThemeToggle size="sm" />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="
              p-2 rounded-xl text-[var(--muted)]
              hover:text-[#f87171] hover:bg-[#f8717122]
              transition-all cursor-pointer
            "
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  )
}