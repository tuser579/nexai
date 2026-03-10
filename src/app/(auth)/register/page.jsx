import RegisterForm from '@/components/auth/RegisterForm'

export const metadata = {
  title:       'Create Account — NexAI',
  description: 'Create your free NexAI account',
}

export default function RegisterPage() {
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
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
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
        <RegisterForm />
      </div>
    </main>
  )
}
