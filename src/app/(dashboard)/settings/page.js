'use client'
import { useState }      from 'react'
import { useSession }    from 'next-auth/react'
import { signOut }       from 'next-auth/react'
import { useTheme }      from '@/context/ThemeContext'
import { useAppStore }   from '@/store/appStore'
import Avatar            from '@/components/ui/Avatar'
import Button            from '@/components/ui/Button'
import Badge             from '@/components/ui/Badge'
import Input             from '@/components/ui/Input'
import { AI_MODELS }     from '@/constants/models'
import {
  Sun, Moon, LogOut, User,
  Key, Zap, Trash2, Save,
  ChevronRight, Shield,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { theme, setTheme }       = useTheme()
  const { model, setModel, resetStore } = useAppStore()

  const [name,   setName]   = useState(session?.user?.name || '')
  const [saving, setSaving] = useState(false)
  const [keys,   setKeys]   = useState({
    gemini: '', openai: '', huggingface: '', replicate: '', together: '',
  })

  async function handleSaveProfile() {
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      const res  = await fetch('/api/user', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await update({ name: name.trim() })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  function handleSignOut() {
    resetStore()
    signOut({ callbackUrl: '/login' })
  }

  function Section({ title, subtitle, children }) {
    return (
      <div style={{
        background:   'var(--panel)',
        border:       '1px solid var(--border)',
        borderRadius: '16px',
        overflow:     'hidden',
        marginBottom: '0',
      }}>
        <div style={{
          padding:      '16px 24px',
          borderBottom: '1px solid var(--border)',
          background:   'var(--border)',
        }}>
          <p style={{
            fontSize:   '14px',
            fontWeight: '600',
            color:      'var(--text)',
            fontFamily: 'Syne, sans-serif',
            margin:     '0',
          }}>
            {title}
          </p>
          {subtitle && (
            <p style={{
              fontSize:  '12px',
              color:     'var(--muted)',
              marginTop: '2px',
            }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding:   '24px',
      maxWidth:  '672px',
      margin:    '0 auto',
      display:   'flex',
      flexDirection: 'column',
      gap:       '24px',
    }}>

      {/* ── Profile ────────────────────────── */}
      <Section title="Profile" subtitle="Update your name and account info">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Avatar
              src={session?.user?.avatar || session?.user?.image}
              name={session?.user?.name || 'User'}
              size="xl"
            />
            <div>
              <p style={{ fontWeight: '600', color: 'var(--text)', fontSize: '15px' }}>
                {session?.user?.name || 'User'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                {session?.user?.email}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <Badge variant="free" size="sm">{session?.user?.plan || 'free'} plan</Badge>
                <Badge variant="default" size="sm">
                  <Shield size={10} style={{ display: 'inline', marginRight: '3px' }} />
                  {session?.user?.provider || 'email'}
                </Badge>
              </div>
            </div>
          </div>

          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            icon={<User size={16} />}
          />

          <div>
            <Button
              onClick={handleSaveProfile}
              loading={saving}
              icon={<Save size={16} />}
              size="sm"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Appearance ─────────────────────── */}
      <Section title="Appearance" subtitle="Choose your preferred theme">
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { id: 'dark',  label: 'Dark',  icon: Moon, desc: 'Easy on the eyes' },
            { id: 'light', label: 'Light', icon: Sun,  desc: 'Classic and clean' },
          ].map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              style={{
                flex:          '1',
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                gap:           '8px',
                padding:       '16px',
                borderRadius:  '12px',
                border:        theme === id ? '1px solid #6c63ff44' : '1px solid var(--border)',
                background:    theme === id ? '#6c63ff18' : 'var(--border)',
                color:         theme === id ? '#6c63ff' : 'var(--muted)',
                cursor:        'pointer',
                transition:    'all 0.2s',
              }}
            >
              <Icon size={22} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', margin: '0' }}>{label}</p>
                <p style={{ fontSize: '10px', opacity: '0.7', margin: '0' }}>{desc}</p>
              </div>
              {theme === id && (
                <div style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: '#6c63ff',
                }} />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Default Model ───────────────────── */}
      <Section title="Default AI Model" subtitle="Choose which model to use by default in chat">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {AI_MODELS.filter((m) => m.free).map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '12px 16px',
                borderRadius:   '12px',
                border:         model === m.id ? '1px solid #6c63ff44' : '1px solid var(--border)',
                background:     model === m.id ? '#6c63ff18' : 'var(--border)',
                cursor:         'pointer',
                transition:     'all 0.15s',
                width:          '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Zap size={16} style={{ color: model === m.id ? '#6c63ff' : 'var(--muted)' }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontSize:   '13px',
                    fontWeight: '500',
                    color:      model === m.id ? '#6c63ff' : 'var(--text)',
                    margin:     '0',
                  }}>
                    {m.label}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0' }}>
                    {m.description}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge variant="free" size="xs">{m.badge}</Badge>
                {model === m.id && (
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%', background: '#6c63ff',
                  }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* ── API Keys ────────────────────────── */}
      <Section title="API Keys" subtitle="Add your own keys for higher rate limits (optional)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'gemini',      label: 'Google Gemini', placeholder: 'AIza...', badge: 'FREE'         },
            { key: 'huggingface', label: 'Hugging Face',  placeholder: 'hf_...',  badge: 'FREE'         },
            { key: 'replicate',   label: 'Replicate',     placeholder: 'r8_...',  badge: 'Free credits' },
            { key: 'openai',      label: 'OpenAI',        placeholder: 'sk-...',  badge: 'Paid'         },
            { key: 'together',    label: 'Together AI',   placeholder: 'key...',  badge: '$25 free'     },
          ].map(({ key, label, placeholder, badge }) => (
            <Input
              key={key}
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {label}
                  <Badge variant={badge === 'Paid' ? 'warning' : 'free'} size="xs">{badge}</Badge>
                </span>
              }
              type="password"
              value={keys[key]}
              onChange={(e) => setKeys((k) => ({ ...k, [key]: e.target.value }))}
              placeholder={placeholder}
              icon={<Key size={16} />}
            />
          ))}
          <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0' }}>
            Keys are stored locally in your browser only. Never shared with anyone.
          </p>
        </div>
      </Section>

      {/* ── Account ─────────────────────────── */}
      <Section title="Account" subtitle="Manage your account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <button
            onClick={handleSignOut}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '12px 16px',
              borderRadius:   '12px',
              border:         '1px solid var(--border)',
              background:     'var(--border)',
              cursor:         'pointer',
              transition:     'all 0.2s',
              width:          '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f8717144'
              e.currentTarget.style.color = '#f87171'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LogOut size={16} style={{ color: 'var(--muted)' }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', margin: '0' }}>
                  Sign Out
                </p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0' }}>
                  Sign out of your account
                </p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
          </button>

          <button
            onClick={() => toast.error('Contact support to delete your account')}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '12px 16px',
              borderRadius:   '12px',
              border:         '1px solid #f8717122',
              background:     '#f8717111',
              color:          '#f87171',
              cursor:         'pointer',
              transition:     'all 0.2s',
              width:          '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trash2 size={16} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', margin: '0' }}>Delete Account</p>
                <p style={{ fontSize: '11px', opacity: '0.6', margin: '0' }}>
                  Permanently delete all your data
                </p>
              </div>
            </div>
            <ChevronRight size={16} style={{ opacity: '0.5' }} />
          </button>

        </div>
      </Section>
    </div>
  )
}