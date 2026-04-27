import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import ThemeToggle from '../components/ThemeToggle'
import HackerText from '../components/HackerText'
import MatrixBackground from '../components/MatrixBackground'

export default function Register() {
  usePageTitle('Register')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const getStrength = (p) => {
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const strength      = getStrength(form.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', 'var(--green)'][strength]

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      await API.post('/api/auth/register', { name: form.name, email: form.email, password: form.password })
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) { setError(err.response?.data?.detail || 'Registration failed') }
    setLoading(false)
  }

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <MatrixBackground opacity={0.15} />
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 10 }}><ThemeToggle /></div>
      <div className="auth-card" style={{ zIndex: 1, position: 'relative', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
        <Link to="/" className="auth-logo">
          <img src="/VulnForge1.png" alt="VulnForge" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />
          <HackerText text="VulnForge" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }} delay={200} duration={700} />
          <span className="badge badge-green" style={{ fontSize: '10px' }}>v1.0</span>
        </Link>

        <div className="card" style={{ padding: 'clamp(24px, 5vw, 36px)' }}>
          <HackerText text="Create account" tag="h1" style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px', display: 'block' }} delay={300} duration={600} />
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '24px' }}>Start securing your targets</p>

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label className="label">Full name</label>
            <input className="input" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Harmanjot Singh" autoComplete="name" />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label className="label">Email address</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" style={{ paddingRight: '42px' }} autoComplete="new-password" />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/></svg>
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? strengthColor : 'var(--border)', transition: 'background 0.2s' }} />)}
                </div>
                <span style={{ fontSize: '12px', color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <div style={{ marginBottom: '22px' }}>
            <label className="label">Confirm password</label>
            <input className="input" type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleRegister()} placeholder="Repeat password" autoComplete="new-password" />
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handleRegister} disabled={loading}>
            {loading ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Creating account...</> : 'Create account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginTop: '18px' }}>
            Already have an account?{' '}<Link to="/login" style={{ fontWeight: '500' }}>Sign in</Link>
          </p>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text3)', marginTop: '16px' }}>For authorized security testing only</p>
      </div>
    </div>
  )
}
