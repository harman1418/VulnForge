import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import API from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import ThemeToggle from '../components/ThemeToggle'
import HackerText from '../components/HackerText'
import MatrixBackground from '../components/MatrixBackground'

export default function ResetPassword() {
  usePageTitle('Reset Password')
  const [form, setForm] = useState({ otp: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

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

  const handleReset = async () => {
    if (!form.otp || form.otp.length !== 6) { setError('Enter the 6-digit code'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      await API.post('/api/auth/reset-password', { email, otp: form.otp, new_password: form.password })
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } })
    } catch (err) { setError(err.response?.data?.detail || 'Invalid or expired code') }
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
          <HackerText text="Set new password" tag="h1" style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px', display: 'block' }} delay={300} duration={600} />
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '4px' }}>Enter the code sent to</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '22px', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>{email || 'your email'}</p>
          {error && <div className="alert alert-error" style={{ marginBottom: '14px' }}><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>{error}</div>}
          <div style={{ marginBottom: '14px' }}>
            <label className="label">Reset code</label>
            <input className="input mono" type="text" inputMode="numeric" maxLength={6} value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="000000" style={{ fontSize: '22px', letterSpacing: '8px', textAlign: 'center', padding: '10px 14px' }} />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label className="label">New password</label>
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
            <label className="label">Confirm new password</label>
            <input className="input" type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleReset()} placeholder="Repeat password" autoComplete="new-password" />
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleReset} disabled={loading}>
            {loading ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Resetting...</> : 'Reset password'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginTop: '18px' }}>
            <Link to="/forgot-password" style={{ fontWeight: '500' }}>Resend code</Link>{' · '}
            <Link to="/login" style={{ color: 'var(--text2)' }}>Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
