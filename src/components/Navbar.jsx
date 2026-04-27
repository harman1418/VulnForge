import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { TOOL_CATEGORIES, getToolsByCategory, getFrequentlyUsed } from '../config/toolsConfig'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [activeToolCat, setActiveToolCat] = useState('frequent')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const toolsRef = useRef(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('vulnforge_user') || 'null')

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => { setMenuOpen(false); setToolsOpen(false) }, [navigate])

  // Close tools dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { localStorage.clear(); navigate('/login') }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/targets',   label: 'Targets' },
    { to: '/scans',     label: 'Scans' },
  ]

  const toolsCatDisplay = [
    { id: 'frequent', label: 'Frequently Used' },
    ...TOOL_CATEGORIES,
  ]

  const displayTools = activeToolCat === 'frequent'
    ? getFrequentlyUsed()
    : getToolsByCategory(activeToolCat)

  return (
    <>
      <nav style={{ height: '56px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 clamp(12px, 3vw, 20px)', gap: '4px', position: 'sticky', top: 0, zIndex: 200 }}>

        {/* Brand */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0, marginRight: '8px' }}>
          <img src="/VulnForge1.png" alt="VulnForge" style={{ height: '22px', width: '22px', objectFit: 'contain' }} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.3px' }}>VulnForge</span>
          <span className="badge badge-green" style={{ fontSize: '10px', padding: '1px 6px' }}>v1.0</span>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <>
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to}
                style={({ isActive }) => ({ padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', color: isActive ? 'var(--green)' : 'var(--text2)', background: isActive ? 'var(--green-dim)' : 'transparent', textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' })}>
                {l.label}
              </NavLink>
            ))}

            {/* Tools dropdown trigger */}
            <div ref={toolsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setToolsOpen(o => !o)}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', color: toolsOpen ? 'var(--green)' : 'var(--text2)', background: toolsOpen ? 'var(--green-dim)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { if (!toolsOpen) e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { if (!toolsOpen) e.currentTarget.style.color = 'var(--text2)' }}
              >
                Tools
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ transform: toolsOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
              </button>

              {/* Mega dropdown */}
              {toolsOpen && (
                <div style={{
                  position: 'fixed',
                  top: '56px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'min(880px, 95vw)',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 300,
                  display: 'flex',
                  overflow: 'hidden',
                  animation: 'fadeUp 0.15s ease',
                }}>
                  {/* Left: category tabs */}
                  <div style={{ width: '180px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '8px', background: 'var(--bg3)' }}>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text3)', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '6px 8px 4px', margin: 0 }}>Categories</p>
                    {toolsCatDisplay.map(cat => {
                      const isActive = activeToolCat === cat.id
                      const color = cat.id === 'frequent' ? 'var(--green)' : (TOOL_CATEGORIES.find(c => c.id === cat.id)?.color || 'var(--text2)')
                      return (
                        <button key={cat.id}
                          onMouseEnter={() => setActiveToolCat(cat.id)}
                          onClick={() => { navigate('/tools'); setToolsOpen(false) }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: '7px', background: isActive ? color + '12' : 'transparent', borderLeft: `3px solid ${isActive ? color : 'transparent'}`, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.1s' }}>
                          <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400', color: isActive ? color : 'var(--text2)' }}>{cat.label}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: 'auto' }}>
                            {cat.id === 'frequent' ? getFrequentlyUsed().length : getToolsByCategory(cat.id).length}
                          </span>
                        </button>
                      )
                    })}
                    <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />
                    <Link to="/tools" onClick={() => setToolsOpen(false)}
                      style={{ display: 'block', padding: '8px 10px', fontSize: '12px', color: 'var(--green)', fontWeight: '500', textDecoration: 'none', borderRadius: '6px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--green-dim)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      View all tools →
                    </Link>
                  </div>

                  {/* Right: tools list */}
                  <div style={{ flex: 1, padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', alignContent: 'start', maxHeight: '420px', overflowY: 'auto' }}>
                    {displayTools.map(tool => (
                      <Link key={tool.id} to={tool.path} onClick={() => setToolsOpen(false)} style={{ textDecoration: 'none' }}>
                        <div style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.1s', display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: tool.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                            <svg width="13" height="13" viewBox="0 0 16 16" fill={tool.color}>
                              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                            </svg>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{tool.shortName}</span>
                              {tool.isNew && <span style={{ fontSize: '9px', fontWeight: '700', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-bd)', borderRadius: '999px', padding: '0 5px', flexShrink: 0 }}>NEW</span>}
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text3)', margin: 0, lineHeight: 1.4 }}>{tool.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle />
          {!isMobile && user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid var(--green-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--green)' }}>{(user.name || user.email || 'U')[0].toUpperCase()}</span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text2)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.email}</span>
              </div>
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid transparent', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: '500', color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.background = 'var(--bg3)' }}
                onMouseLeave={e => { e.target.style.color = 'var(--text2)'; e.target.style.background = 'transparent' }}>
                Sign out
              </button>
            </>
          )}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)' }}>
              {menuOpen
                ? <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>
                : <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/></svg>
              }
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '10px 12px', zIndex: 199, display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: 'var(--shadow)' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '4px', background: 'var(--bg3)', borderRadius: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid var(--green-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--green)' }}>{(user.name || 'U')[0].toUpperCase()}</span>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{user.email}</div>
              </div>
            </div>
          )}
          {[...navLinks, { to: '/tools', label: 'Tools' }].map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({ padding: '10px 12px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', color: isActive ? 'var(--green)' : 'var(--text)', background: isActive ? 'var(--green-dim)' : 'transparent', textDecoration: 'none', display: 'block' })}>
              {l.label}
            </NavLink>
          ))}
          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
          <button onClick={() => { handleLogout(); setMenuOpen(false) }}
            style={{ background: 'transparent', border: 'none', textAlign: 'left', color: 'var(--red)', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '500', padding: '10px 12px', borderRadius: '8px', width: '100%', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      )}
    </>
  )
}
