// ── VerifyOTP.jsx ──────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import API from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import ThemeToggle from '../components/ThemeToggle'
import HackerText from '../components/HackerText'
import MatrixBackground from '../components/MatrixBackground'

// Shared mount animation wrapper for auth cards
function AuthCard({ children, delay = 50 }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div className="auth-card" style={{ zIndex: 1, position: 'relative', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
      {children}
    </div>
  )
}

export function VerifyOTP() {
  usePageTitle('Verify Email')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t) }
    else setCanResend(true)
  }, [countdown])

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit code'); return }
    setLoading(true); setError('')
    try {
      const res = await API.post('/api/auth/verify-otp', { email, otp })
      const token = res.data.token || res.data.access_token
      if (token) localStorage.setItem('token', token)
      if (res.data.user) localStorage.setItem('vulnforge_user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) { setError(err.response?.data?.detail || 'Invalid or expired OTP') }
    setLoading(false)
  }

  const handleResend = async () => {
    setResending(true); setError(''); setSuccess('')
    try {
      await API.post('/api/auth/resend-otp', { email })
      setSuccess('New code sent to your email')
      setCountdown(60); setCanResend(false)
    } catch (err) { setError(err.response?.data?.detail || 'Failed to resend code') }
    setResending(false)
  }

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <MatrixBackground opacity={0.15} />
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 10 }}><ThemeToggle /></div>
      <AuthCard>
        <Link to="/" className="auth-logo">
          <img src="/VulnForge1.png" alt="VulnForge" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />
          <HackerText text="VulnForge" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }} delay={200} duration={700} />
        </Link>
        <div className="card" style={{ padding: 'clamp(24px, 5vw, 36px)' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--green-dim)', border: '1px solid var(--green-bd)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="var(--green)"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/></svg>
          </div>
          <HackerText text="Check your email" tag="h1" style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px', display: 'block' }} delay={300} duration={600} />
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '4px' }}>We sent a verification code to</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '22px', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>{email}</p>
          {error && <div className="alert alert-error" style={{ marginBottom: '14px' }}><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '14px' }}><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/></svg>{success}</div>}
          <div style={{ marginBottom: '20px' }}>
            <label className="label">Verification code</label>
            <input className="input mono" type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={e => e.key === 'Enter' && handleVerify()} placeholder="000000" style={{ fontSize: '26px', letterSpacing: '10px', textAlign: 'center', padding: '12px 14px' }} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleVerify} disabled={loading} style={{ marginBottom: '14px' }}>
            {loading ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Verifying...</> : 'Verify email'}
          </button>
          <div style={{ textAlign: 'center' }}>
            {canResend
              ? <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{resending ? 'Sending...' : 'Resend verification code'}</button>
              : <p style={{ fontSize: '14px', color: 'var(--text2)' }}>Resend code in <span style={{ color: 'var(--text)', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>{countdown}s</span></p>
            }
          </div>
          <div className="divider" style={{ margin: '18px 0' }} />
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)' }}>Wrong email? <Link to="/register" style={{ fontWeight: '500' }}>Go back</Link></p>
        </div>
      </AuthCard>
    </div>
  )
}

export default VerifyOTP
