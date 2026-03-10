import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title:       'Sign In — NexAI',
  description: 'Sign in to your NexAI account',
}

export default function LoginPage() {
  return (
    <main className="
      min-h-screen flex items-center justify-center
      bg-[var(--bg)] px-4 py-12 relative overflow-hidden
    ">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Grid pattern */}
      <div
        className="
          absolute inset-0 pointer-events-none
          opacity-[0.03]
        "
        style={{
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Form */}
      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </main>
  )
}