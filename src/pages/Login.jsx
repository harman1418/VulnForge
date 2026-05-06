import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import API from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import ThemeToggle from '../components/ThemeToggle'
import HackerText from '../components/HackerText'
import MatrixBackground from '../components/MatrixBackground'

export default function Login() {
  usePageTitle('Login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const successMsg = location.state?.message || ''

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('oauth_success') === 'true') {
      setLoading(true)
      API.get('/api/auth/me')
        .then(res => {
          if (res.data.status === 'success' && res.data.user) {
            localStorage.setItem('token', 'cookie_session')
            localStorage.setItem('vulnforge_user', JSON.stringify(res.data.user))
            navigate('/dashboard')
          }
        })
        .catch(err => {
          console.error('OAuth sync error:', err)
          setError('Failed to synchronize OAuth session')
          setLoading(false)
        })
    }
  }, [location, navigate])

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    try {
      console.log('Attempting login for:', form.email)
      const res = await API.post('/api/auth/login', form)
      console.log('Login Response:', res.data)
      
      const user = res.data.user
      
      console.log('Login Response Details:', {
        status: res.data.status,
        hasUser: !!user,
        userType: typeof user
      })

      if (res.data.status === 'success' && user) {
        localStorage.setItem('token', 'cookie_session') // Satisfy frontend routing checks
        localStorage.setItem('vulnforge_user', JSON.stringify(user))
        console.log('Storage set, navigating to dashboard...')
        navigate('/dashboard')
      } else {
        const raw = JSON.stringify(res.data)
        setError(`Login failed: Missing User. Data: ${raw.slice(0, 30)}...`)
      }
    } catch (err) { 
      console.error('Login Error:', err)
      setError(err.response?.data?.detail || 'Login failed') 
    }
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
          <HackerText text="Sign in" tag="h1" style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px', display: 'block' }} delay={300} duration={600} />
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '24px' }}>Welcome back to VulnForge</p>

          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/></svg>
              {successMsg}
            </div>
          )}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label className="label">Email address</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="you@example.com" autoComplete="email" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--text2)' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Your password" style={{ paddingRight: '42px' }} autoComplete="current-password" />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/><path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/></svg>
                }
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handleLogin} disabled={loading}>
            {loading ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Signing in...</> : 'Sign in'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
            <span style={{ padding: '0 10px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Or continue with</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => window.location.href = `${API.defaults.baseURL || 'https://api.vulnforge.app'}/api/auth/google/login`}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => window.location.href = `${API.defaults.baseURL || 'https://api.vulnforge.app'}/api/auth/github/login`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginTop: '24px' }}>
            Don't have an account?{' '}<Link to="/register" style={{ fontWeight: '500' }}>Create account</Link>
          </p>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text3)', marginTop: '16px' }}>For authorized security testing only</p>
      </div>
    </div>
  )
}
