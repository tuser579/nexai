'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import {
  MessageSquare, Image, Video,
  FileSearch, Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'chat',     label: 'Chat',    icon: MessageSquare, href: '/chat'    },
  { id: 'image',    label: 'Image',   icon: Image,         href: '/image'   },
  { id: 'video',    label: 'Video',   icon: Video,         href: '/video'   },
  { id: 'analyze',  label: 'Analyze', icon: FileSearch,    href: '/analyze' },
  { id: 'settings', label: 'Settings',icon: Settings,      href: '/settings'},
]

export default function MobileNav() {
  const router   = useRouter()
  const pathname = usePathname()

  function isActive(href) {
    return pathname.startsWith(href)
  }

  return (
    <nav className="
      hidden fixed bottom-0 left-0 right-0 z-30
      bg-[var(--nav)] border-t border-[var(--border)]
      flex items-center justify-around
      px-2 py-2 pb-safe
      safe-area-inset-bottom
    ">
      {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => (
        <button
          key={id}
          onClick={() => router.push(href)}
          className={`
            flex flex-col items-center gap-1
            px-3 py-1.5 rounded-xl
            transition-all duration-150 cursor-pointer
            min-w-0 flex-1
            ${isActive(href)
              ? 'text-[#6c63ff]'
              : 'text-[var(--subtle)] hover:text-[var(--muted)]'
            }
          `}
        >
          <div className={`
            p-1.5 rounded-xl transition-all
            ${isActive(href)
              ? 'bg-[#6c63ff22]'
              : 'bg-transparent'
            }
          `}>
            <Icon size={18} />
          </div>
          <span className="text-[10px] font-medium truncate">
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
