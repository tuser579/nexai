'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">

      {/* AI Avatar */}
      <div className="
        w-8 h-8 rounded-xl shrink-0
        bg-gradient-to-br from-[#6c63ff] to-[#ff6584]
        flex items-center justify-center
        shadow-[0_0_12px_#6c63ff33]
        text-white text-xs font-bold
      ">
        AI
      </div>

      {/* Dots */}
      <div className="
        px-4 py-3 rounded-2xl rounded-tl-sm
        bg-[var(--panel)] border border-[var(--border)]
        flex items-center gap-1.5
      ">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="
              w-2 h-2 rounded-full
              bg-[var(--muted)]
              animate-bounce-dot
            "
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}