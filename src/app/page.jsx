import Link       from 'next/link'
import { Sparkles, MessageSquare, Image,
         Video, FileSearch, ArrowRight,
         Zap, Shield, Globe } from 'lucide-react'

// ── Feature cards data ─────────────────────────────
const FEATURES = [
  {
    icon:        MessageSquare,
    title:       'AI Chat',
    description: 'Chat with Gemini 1.5 Flash, GPT-4, Mixtral and more. Streaming responses with markdown support.',
    badge:       'FREE',
    color:       '#6c63ff',
    href:        '/chat',
  },
  {
    icon:        Image,
    title:       'Image Generation',
    description: 'Generate stunning images with Stable Diffusion. Multiple styles and sizes.',
    badge:       'FREE',
    color:       '#ff6584',
    href:        '/image',
  },
  {
    icon:        Video,
    title:       'Video Generation',
    description: 'Create short AI videos with AnimateDiff. Cinematic, anime, realistic styles.',
    badge:       'Credits',
    color:       '#f59e0b',
    href:        '/video',
  },
  {
    icon:        FileSearch,
    title:       'Media Analysis',
    description: 'Analyze images, PDFs, video and audio with Gemini Vision. Ask follow-up questions.',
    badge:       'FREE',
    color:       '#4ade80',
    href:        '/analyze',
  },
]

const HIGHLIGHTS = [
  {
    icon:  Zap,
    title: '100% Free to Start',
    desc:  'Gemini, Hugging Face and MongoDB are all free tiers',
  },
  {
    icon:  Shield,
    title: 'Secure Auth',
    desc:  'Email + Google OAuth with JWT sessions',
  },
  {
    icon:  Globe,
    title: 'Open Source Stack',
    desc:  'Next.js, MongoDB, Tailwind — own your data',
  },
]

export default function LandingPage() {
  return (
    <main className="
      min-h-screen bg-[var(--bg)]
      relative overflow-hidden
    ">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(#6c63ff 1px, transparent 1px),
            linear-gradient(90deg, #6c63ff 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="
        relative z-10 max-w-5xl mx-auto
        px-4 py-16 flex flex-col gap-20
      ">

        {/* ── Nav ──────────────────────────────── */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="
              w-9 h-9 rounded-xl
              bg-gradient-to-br from-[#6c63ff] to-[#ff6584]
              flex items-center justify-center
              shadow-[0_0_20px_#6c63ff44]
            ">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="
              font-display font-bold text-xl
              bg-gradient-to-r from-[#6c63ff] to-[#ff6584]
              bg-clip-text text-transparent
            ">
              NexAI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="
                px-4 py-2 rounded-xl text-sm font-medium
                text-[var(--muted)] hover:text-[var(--text)]
                transition-colors
              "
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="
                px-4 py-2 rounded-xl text-sm font-medium
                bg-[#6c63ff] text-white
                hover:bg-[#7c74ff]
                shadow-[0_0_20px_#6c63ff33]
                transition-all
              "
            >
              Get Started Free
            </Link>
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────── */}
        <section className="
          flex flex-col items-center
          text-center gap-6
        ">
          {/* Badge */}
          <div className="
            inline-flex items-center gap-2
            px-4 py-1.5 rounded-full
            bg-[#6c63ff18] border border-[#6c63ff33]
            text-[#6c63ff] text-xs font-medium
            animate-fade-in
          ">
            <Sparkles size={12} />
            Powered by Gemini 1.5 Flash · 100% Free
          </div>

          {/* Heading */}
          <h1 className="
            text-4xl sm:text-5xl md:text-6xl
            font-display font-black
            text-[var(--text)] leading-tight
            animate-fade-up
          ">
            Your AI Platform
            <br />
            <span className="
              bg-gradient-to-r from-[#6c63ff] via-[#a78bfa] to-[#ff6584]
              bg-clip-text text-transparent
            ">
              for Everything
            </span>
          </h1>

          {/* Subtitle */}
          <p className="
            text-base sm:text-lg text-[var(--muted)]
            max-w-2xl leading-relaxed
            animate-fade-up
          ">
            Chat with multiple AI models, generate images and videos,
            analyze any media file — all in one beautiful platform.
            Free to use, forever.
          </p>

          {/* CTA buttons */}
          <div className="
            flex flex-col sm:flex-row
            items-center gap-3 mt-2
            animate-fade-up
          ">
            <Link
              href="/register"
              className="
                flex items-center gap-2
                px-6 py-3 rounded-2xl
                bg-gradient-to-r from-[#6c63ff] to-[#7c74ff]
                text-white font-semibold text-sm
                shadow-[0_0_30px_#6c63ff44]
                hover:shadow-[0_0_40px_#6c63ff66]
                hover:scale-[1.02]
                transition-all duration-200
              "
            >
              <Sparkles size={16} />
              Start for Free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="
                flex items-center gap-2
                px-6 py-3 rounded-2xl
                bg-[var(--panel)] border border-[var(--border)]
                text-[var(--text)] font-medium text-sm
                hover:border-[#6c63ff44]
                transition-all duration-200
              "
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* ── Features ─────────────────────────── */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="
              text-2xl sm:text-3xl
              font-display font-bold
              text-[var(--text)]
            ">
              Everything you need
            </h2>
            <p className="text-[var(--muted)] text-sm mt-2">
              All AI tools in one place
            </p>
          </div>

          <div className="
            grid grid-cols-1 sm:grid-cols-2
            gap-4
          ">
            {FEATURES.map((f, i) => (
              <Link
                key={f.title}
                href={f.href}
                className="
                  group relative
                  bg-[var(--panel)] border border-[var(--border)]
                  rounded-2xl p-6
                  hover:border-[#6c63ff33]
                  hover:shadow-[0_0_30px_#6c63ff11]
                  transition-all duration-200
                  animate-fade-up
                "
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Icon */}
                <div
                  className="
                    w-12 h-12 rounded-2xl mb-4
                    flex items-center justify-center
                    transition-all duration-200
                    group-hover:scale-110
                  "
                  style={{ background: f.color + '22' }}
                >
                  <f.icon size={22} style={{ color: f.color }} />
                </div>

                {/* Badge */}
                <span
                  className="
                    absolute top-4 right-4
                    px-2 py-0.5 rounded-lg
                    text-[10px] font-semibold
                  "
                  style={{
                    background: f.color + '22',
                    color:      f.color,
                  }}
                >
                  {f.badge}
                </span>

                <h3 className="
                  font-display font-bold text-base
                  text-[var(--text)] mb-2
                ">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {f.description}
                </p>

                {/* Arrow */}
                <div className="
                  flex items-center gap-1 mt-4
                  text-xs font-medium
                  opacity-0 group-hover:opacity-100
                  translate-x-0 group-hover:translate-x-1
                  transition-all duration-200
                "
                  style={{ color: f.color }}
                >
                  Try it now
                  <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Highlights ───────────────────────── */}
        <section className="
          grid grid-cols-1 sm:grid-cols-3 gap-4
        ">
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={h.title}
              className="
                flex flex-col items-center text-center gap-3
                bg-[var(--panel)] border border-[var(--border)]
                rounded-2xl p-6
                animate-fade-up
              "
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="
                w-10 h-10 rounded-xl
                bg-[#6c63ff22] text-[#6c63ff]
                flex items-center justify-center
              ">
                <h.icon size={20} />
              </div>
              <div>
                <p className="
                  text-sm font-semibold text-[var(--text)]
                ">
                  {h.title}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {h.desc}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Final CTA ────────────────────────── */}
        <section className="
          flex flex-col items-center gap-6
          text-center
          bg-gradient-to-br from-[#6c63ff18] to-[#ff658411]
          border border-[#6c63ff22]
          rounded-3xl p-10
        ">
          <div className="
            w-14 h-14 rounded-2xl
            bg-gradient-to-br from-[#6c63ff] to-[#ff6584]
            flex items-center justify-center
            shadow-[0_0_30px_#6c63ff44]
          ">
            <Sparkles size={28} className="text-white" />
          </div>

          <div>
            <h2 className="
              text-2xl sm:text-3xl
              font-display font-bold
              text-[var(--text)]
            ">
              Ready to get started?
            </h2>
            <p className="text-[var(--muted)] text-sm mt-2">
              Free forever · No credit card required
            </p>
          </div>

          <Link
            href="/register"
            className="
              flex items-center gap-2
              px-8 py-3.5 rounded-2xl
              bg-gradient-to-r from-[#6c63ff] to-[#7c74ff]
              text-white font-semibold
              shadow-[0_0_30px_#6c63ff44]
              hover:shadow-[0_0_50px_#6c63ff66]
              hover:scale-[1.02]
              transition-all duration-200
            "
          >
            <Sparkles size={18} />
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </section>

        {/* ── Footer ───────────────────────────── */}
        <footer className="
          flex flex-col sm:flex-row
          items-center justify-between gap-3
          pt-6 border-t border-[var(--border)]
          text-xs text-[var(--subtle)]
        ">
          <div className="flex items-center gap-2">
            <div className="
              w-5 h-5 rounded-md
              bg-gradient-to-br from-[#6c63ff] to-[#ff6584]
              flex items-center justify-center
            ">
              <Sparkles size={10} className="text-white" />
            </div>
            <span>NexAI © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-[var(--muted)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hover:text-[var(--muted)] transition-colors"
            >
              Register
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
