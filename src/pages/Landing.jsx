import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import ThemeToggle from '../components/ThemeToggle'
import HackerText from '../components/HackerText'
import ScrollReveal from '../components/ScrollReveal'
import MatrixBackground from '../components/MatrixBackground'
import Footer from '../components/Footer'



// ── Typing animation ───────────────────────────────────────────────────────────
function TypingText({ texts, speed = 80, pause = 1800 }) {
  const [display, setDisplay] = useState('')
  const [idx, setIdx]         = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[idx]
    let timeout

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed)
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setIdx(i => (i + 1) % texts.length)
    }

    setDisplay(current.slice(0, charIdx))
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, idx, texts, speed, pause])

  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {display}
      <span style={{ borderRight: '2px solid var(--green)', marginLeft: '2px', animation: 'blink 1s step-end infinite' }}>&nbsp;</span>
    </span>
  )
}

const features = [
  { title: 'Auto Recon',        desc: 'Port scan, subdomain enum, whois, headers, WAF & SSL — all automated',                     icon: <ReconIcon /> },
  { title: 'AI Analysis',       desc: 'Cloudflare AI analyzes results, rates risk, and recommends next attack vectors',            icon: <AIIcon /> },
  { title: 'Auto Exploitation', desc: 'AI directs SQLMap, Nuclei, WPScan and more to validate real vulnerabilities',              icon: <ExploitIcon /> },
  { title: 'Pro Reports',       desc: 'Download full pentest PDF reports with findings, evidence and remediation steps',           icon: <ReportIcon /> },
]

const stats = [
  { value: '15+',   label: 'Security Tools' },
  { value: '9000+', label: 'CVE Templates' },
  { value: 'AI',    label: 'Powered' },
  { value: '24/7',  label: 'Cloud Hosted' },
]

const TYPING_TEXTS = [
  'Scan any domain.',
  'Find vulnerabilities.',
  'AI-powered attacks.',
  'Generate PDF reports.',
  'Stay one step ahead.',
]

export default function Landing() {
  usePageTitle('Home')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <MatrixBackground opacity={0.25} />

      {/* ── Navbar ── */}
      <nav style={{ height: '56px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 clamp(16px, 4vw, 40px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/VulnForge1.png" alt="VulnForge" style={{ height: '24px', width: '24px', objectFit: 'contain' }} />
          <HackerText text="VulnForge" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.3px' }} duration={600} />
          <span className="badge badge-green" style={{ fontSize: '10px' }}>v1.0</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />
          <Link to="/login"><button className="btn btn-ghost btn-sm" style={{ color: 'var(--text2)' }}>Sign in</button></Link>
          <Link to="/register"><button className="btn btn-primary btn-sm">Get started</button></Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(48px, 10vw, 100px) clamp(16px, 4vw, 40px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(700px, 90vw)', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Eyebrow */}
        <ScrollReveal delay={100} duration={600}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--green-dim)', border: '1px solid var(--green-bd)', borderRadius: '999px', padding: '5px 14px', marginBottom: '28px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s ease-in-out infinite' }} />
            <HackerText text="Autonomous Penetration Testing Platform" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--green)', letterSpacing: '0.5px' }} delay={400} duration={1200} />
          </div>
        </ScrollReveal>

        {/* Main title */}
        <ScrollReveal delay={200} duration={700}>
          <h1 style={{ fontSize: 'clamp(48px, 12vw, 110px)', fontWeight: '800', lineHeight: '1.0', marginBottom: '16px', letterSpacing: '-3px' }}>
            <HackerText text="Vuln" style={{ color: 'var(--green)', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }} delay={300} duration={900} triggerOnMount />
            <HackerText text="Forge" style={{ color: 'var(--text)', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }} delay={600} duration={900} triggerOnMount />
          </h1>
        </ScrollReveal>

        {/* Typing subtitle */}
        <ScrollReveal delay={400} duration={600}>
          <p style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: 'var(--text2)', marginBottom: '12px', minHeight: '2em' }}>
            <TypingText texts={TYPING_TEXTS} speed={70} pause={2000} />
          </p>
        </ScrollReveal>

        {/* Description */}
        <ScrollReveal delay={500} duration={600}>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--text2)', maxWidth: '520px', lineHeight: '1.7', marginBottom: '36px', opacity: 0.8 }}>
            Enter a domain. Our AI automatically runs all security scans, analyzes vulnerabilities, executes targeted attacks, and generates a professional pentest report.
          </p>
        </ScrollReveal>

        {/* CTAs */}
        <ScrollReveal delay={600} duration={600}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'clamp(48px, 8vw, 80px)' }}>
            <Link to="/register">
              <button className="btn btn-primary btn-lg" style={{ fontSize: 'clamp(13px, 2vw, 15px)', padding: 'clamp(10px, 2vw, 13px) clamp(20px, 4vw, 32px)', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                style2={{ transition: 'transform 0.2s' }}
              >
                Get started free
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </Link>
            <Link to="/login">
              <button className="btn btn-secondary btn-lg" style={{ fontSize: 'clamp(13px, 2vw, 15px)', padding: 'clamp(10px, 2vw, 13px) clamp(20px, 4vw, 32px)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Sign in
              </button>
            </Link>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal delay={700} duration={600}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 'clamp(20px, 4vw, 48px) clamp(28px, 5vw, 72px)', justifyContent: 'center' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <HackerText text={s.value} style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: '800', color: 'var(--green)', lineHeight: 1, marginBottom: '4px', display: 'block' }} delay={800 + i * 100} duration={600} />
                <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: 'var(--text2)', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* ── Features ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 40px)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <ScrollReveal duration={600}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
              <HackerText text="How it works" tag="h2" style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '700', color: 'var(--text)', marginBottom: '8px', display: 'block' }} duration={700} />
              <p style={{ fontSize: '15px', color: 'var(--text2)' }}>Four phases. Fully automated. AI-driven.</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 100} duration={600} direction="up">
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: 'clamp(20px, 3vw, 28px)', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-bd)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ width: '40px', height: '40px', background: 'var(--green-dim)', border: '1px solid var(--green-bd)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    {f.icon}
                  </div>
                  <HackerText text={f.title} tag="h3" style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px', display: 'block' }} triggerOnMount={false} duration={600} />
                  <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <ScrollReveal duration={600}>
        <div style={{ borderTop: '1px solid var(--border)', padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <HackerText text="Ready to find vulnerabilities?" tag="h2" style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '700', color: 'var(--text)', marginBottom: '8px', display: 'block' }} triggerOnMount={false} duration={700} />
          <p style={{ fontSize: '15px', color: 'var(--text2)', marginBottom: '24px' }}>Start your first scan in seconds — no setup required.</p>
          <Link to="/register">
            <button className="btn btn-primary btn-lg"
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              style={{ transition: 'transform 0.2s' }}
            >
              Create free account
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </Link>
        </div>
      </ScrollReveal>

      <Footer />

      {/* Blink animation */}
      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  )
}

function ReconIcon() { return <svg width="18" height="18" viewBox="0 0 16 16" fill="var(--green)"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg> }
function AIIcon() { return <svg width="18" height="18" viewBox="0 0 16 16" fill="var(--green)"><path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.133"/><path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/></svg> }
function ExploitIcon() { return <svg width="18" height="18" viewBox="0 0 16 16" fill="var(--green)"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg> }
function ReportIcon() { return <svg width="18" height="18" viewBox="0 0 16 16" fill="var(--green)"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1L14 4.5zM4.5 8a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/></svg> }
