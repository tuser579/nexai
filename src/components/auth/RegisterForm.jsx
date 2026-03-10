'use client'
import { useState }  from 'react'
import { signIn }    from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link          from 'next/link'
import Input         from '@/components/ui/Input'
import Button        from '@/components/ui/Button'
import GoogleButton  from './GoogleButton'
import {
  Eye, EyeOff, Mail, Lock,
  User, Sparkles, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Password strength checker ──────────────────────
function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8)          score++
  if (/[A-Z]/.test(password))        score++
  if (/[0-9]/.test(password))        score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score === 0 || password.length === 0)
    return { label: '',        color: '',          width: '0%'   }
  if (score === 1)
    return { label: 'Weak',    color: '#f87171',   width: '25%'  }
  if (score === 2)
    return { label: 'Fair',    color: '#f59e0b',   width: '50%'  }
  if (score === 3)
    return { label: 'Good',    color: '#60a5fa',   width: '75%'  }
  return   { label: 'Strong',  color: '#4ade80',   width: '100%' }
}

export default function RegisterForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [errors,    setErrors]   = useState({})
  const [loading,   setLoading]  = useState(false)
  const [showPass,  setShowPass] = useState(false)
  const [showConf,  setShowConf] = useState(false)

  const passwordStrength = getPasswordStrength(form.password)

  // ── Field change ───────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target
    setForm((f)   => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: '' }))
  }

  // ── Validate ───────────────────────────────────
  function validate() {
    const errs = {}

    if (!form.name.trim()) {
      errs.name = 'Name is required'
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters'
    }

    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Enter a valid email'
    }

    if (!form.password) {
      errs.password = 'Password is required'
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }

    return errs
  }

  // ── Submit ─────────────────────────────────────
  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)

    try {
      // 1. Register
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.toLowerCase(),
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: data.error })
        } else {
          toast.error(data.error || 'Registration failed')
        }
        return
      }

      toast.success('Account created!')

      // 2. Auto sign in
      const signInResult = await signIn('credentials', {
        email:    form.email.toLowerCase(),
        password: form.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/chat')
        router.refresh()
      } else {
        router.push('/login')
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Enter key ──────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">

      {/* ── Logo + Title ───────────────────────── */}
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
          <h1 className="
            text-2xl font-display font-bold
            text-[var(--text)]
          ">
            Create your account
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Free forever · No credit card needed
          </p>
        </div>
      </div>

      {/* ── Card ───────────────────────────────── */}
      <div className="
        bg-[var(--panel)] border border-[var(--border)]
        rounded-2xl p-6 flex flex-col gap-4
        shadow-[0_4px_24px_rgba(0,0,0,0.3)]
      ">

        {/* Google */}
        <GoogleButton
          callbackUrl="/chat"
          label="Sign up with Google"
        />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--subtle)]">
            or sign up with email
          </span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Name */}
        <Input
          label="Full Name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="John Doe"
          error={errors.name}
          icon={<User size={16} />}
          autoComplete="name"
          autoFocus
        />

        {/* Email */}
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
        />

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            name="password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Min. 6 characters"
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
            autoComplete="new-password"
          />

          {/* Password strength bar */}
          {form.password.length > 0 && (
            <div className="flex flex-col gap-1 animate-fade-in">
              <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width:      passwordStrength.width,
                    background: passwordStrength.color,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-medium"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
                <div className="flex items-center gap-2">
                  {[
                    form.password.length >= 8,
                    /[A-Z]/.test(form.password),
                    /[0-9]/.test(form.password),
                  ].map((met, i) => (
                    <span
                      key={i}
                      className={`
                        text-[10px] flex items-center gap-0.5
                        ${met ? 'text-[#4ade80]' : 'text-[var(--subtle)]'}
                      `}
                    >
                      <Check size={8} />
                      {i === 0 ? '8+ chars' : i === 1 ? 'Uppercase' : 'Number'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConf ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          icon={<Lock size={16} />}
          iconRight={
            <button
              type="button"
              onClick={() => setShowConf((s) => !s)}
              className="cursor-pointer hover:text-[var(--text)] transition-colors"
            >
              {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete="new-password"
        />

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
        >
          Create Account
        </Button>

        {/* Terms */}
        <p className="text-[10px] text-[var(--subtle)] text-center">
          By creating an account you agree to our Terms of Service
          and Privacy Policy
        </p>
      </div>

      {/* ── Footer ─────────────────────────────── */}
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="
            text-[#6c63ff] hover:text-[#7c74ff]
            font-medium transition-colors
          "
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
