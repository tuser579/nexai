'use client'
import { useState }  from 'react'
import { useRouter } from 'next/navigation'
import Link          from 'next/link'
import Input         from '@/components/ui/Input'
import Button        from '@/components/ui/Button'
import GoogleButton  from './GoogleButton'
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const router = useRouter()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass,setShowPass]= useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f)   => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.email.trim())              errs.email    = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password)                  errs.password = 'Password is required'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)

    try {
      // ── v5 uses fetch to call credentials ──
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email:    form.email.toLowerCase(),
          password: form.password,
          redirect: 'false',
          json:     'true',
        }),
      })

      // ── Use next-auth signIn from react ────
      const { signIn } = await import('next-auth/react')
      const result = await signIn('credentials', {
        email:    form.email.toLowerCase(),
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
        setErrors({ password: 'Invalid email or password' })
      } else if (result?.ok) {
        toast.success('Welcome back!')
        router.push('/chat')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="
          w-14 h-14 rounded-2xl
          bg-gradient-to-br from-[#6c63ff] to-[#ff6584]
          flex items-center justify-center
          shadow-[0_0_30px_#6c63ff44]
        ">
          <Sparkles size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text)]">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Sign in to your NexAI account
          </p>
        </div>
      </div>

      <div className="
        bg-[var(--panel)] border border-[var(--border)]
        rounded-2xl p-6 flex flex-col gap-4
        shadow-[0_4px_24px_rgba(0,0,0,0.3)]
      ">
        <GoogleButton callbackUrl="/chat" />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--subtle)]">or continue with email</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
          error={errors.email}
          icon={<Mail size={16} />}
          autoComplete="email"
          autoFocus
        />

        <Input
          label="Password"
          name="password"
          type={showPass ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Your password"
          error={errors.password}
          icon={<Lock size={16} />}
          iconRight={
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="cursor-pointer hover:text-[var(--text)] transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete="current-password"
        />

        <Button
          onClick={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
        >
          Sign In
        </Button>
      </div>

      <p className="text-center text-sm text-[var(--muted)]">
        Don't have an account?{' '}
        <Link
          href="/register"
          className="text-[#6c63ff] hover:text-[#7c74ff] font-medium transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  )
}