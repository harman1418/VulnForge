import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import ThemeToggle from '../components/ThemeToggle'
import HackerText from '../components/HackerText'
import MatrixBackground from '../components/MatrixBackground'

export default function ForgotPassword() {
  usePageTitle('Forgot Password')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true); setError('')
    try {
      await API.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) { setError(err.response?.data?.detail || 'Something went wrong') }
    setLoading(false)
  }

  const cardStyle = { zIndex: 1, position: 'relative', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }

  if (sent) return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <MatrixBackground opacity={0.15} />
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 10 }}><ThemeToggle /></div>
      <div className="auth-card" style={cardStyle}>
        <Link to="/" className="auth-logo">
          <img src="/VulnForge1.png" alt="VulnForge" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />
          <HackerText text="VulnForge" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }} delay={200} duration={700} />
        </Link>
        <div className="card" style={{ padding: 'clamp(24px, 5vw, 36px)', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--green-dim)', border: '1px solid var(--green-bd)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="var(--green)"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/></svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Check your email</h1>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '22px' }}>If an account exists for <strong style={{ color: 'var(--text)' }}>{email}</strong>, we've sent a reset code.</p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/reset-password', { state: { email } })}>Enter reset code</button>
          <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text2)' }}><Link to="/login" style={{ fontWeight: '500' }}>Back to sign in</Link></p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <MatrixBackground opacity={0.15} />
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 10 }}><ThemeToggle /></div>
      <div className="auth-card" style={cardStyle}>
        <Link to="/" className="auth-logo">
          <img src="/VulnForge1.png" alt="VulnForge" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />
          <HackerText text="VulnForge" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }} delay={200} duration={700} />
          <span className="badge badge-green" style={{ fontSize: '10px' }}>v1.0</span>
        </Link>
        <div className="card" style={{ padding: 'clamp(24px, 5vw, 36px)' }}>
          <HackerText text="Reset password" tag="h1" style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px', display: 'block' }} delay={300} duration={600} />
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '24px' }}>Enter your email to receive a reset code</p>
          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>{error}</div>}
          <div style={{ marginBottom: '22px' }}>
            <label className="label">Email address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="you@example.com" autoFocus autoComplete="email" />
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
            {loading ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Sending...</> : 'Send reset code'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginTop: '18px' }}>
            Remember your password? <Link to="/login" style={{ fontWeight: '500' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
