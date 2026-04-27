import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import API from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import HackerText from '../components/HackerText'
import ScrollReveal from '../components/ScrollReveal'

export default function Dashboard() {
  usePageTitle('Dashboard')
  const [stats, setStats] = useState({ targets: 0, scans: 0, critical: 0, avgScore: 0 })
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('vulnforge_user') || 'null')

  const fetchData = async () => {
    try {
      const [targetsRes, scansRes] = await Promise.all([
        API.get('/api/targets/'),
        API.get('/api/history/'),
      ])
      const targets = targetsRes.data.targets || []
      const scans   = scansRes.data.scans   || []
      const critical = scans.filter(s => s.risk_level === 'CRITICAL' || s.risk_level === 'HIGH').length
      const avgScore = scans.length ? Math.round(scans.reduce((a, b) => a + (b.security_score || 0), 0) / scans.length) : 0
      setStats({ targets: targets.length, scans: scans.length, critical, avgScore })
      setRecentScans(scans.slice(0, 5))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getRiskColor = (risk) => {
    if (risk === 'CRITICAL') return 'var(--red)'
    if (risk === 'HIGH')     return '#F97316'
    if (risk === 'MEDIUM')   return 'var(--orange)'
    if (risk === 'LOW')      return 'var(--green)'
    return 'var(--text2)'
  }

  const getRiskBadgeClass = (risk) => {
    if (risk === 'CRITICAL') return 'badge badge-red'
    if (risk === 'HIGH')     return 'badge badge-orange'
    if (risk === 'MEDIUM')   return 'badge badge-orange'
    if (risk === 'LOW')      return 'badge badge-green'
    return 'badge badge-gray'
  }

  const statCards = [
    { label: 'Total Targets',      value: stats.targets,           color: 'var(--blue)',   icon: <TargetIcon size={16} color="var(--blue)" /> },
    { label: 'Total Scans',        value: stats.scans,             color: 'var(--green)',  icon: <ScanIcon size={16} color="var(--green)" /> },
    { label: 'High Risk Scans',    value: stats.critical,          color: 'var(--red)',    icon: <AlertIcon size={16} color="var(--red)" /> },
    { label: 'Avg Security Score', value: `${stats.avgScore}/100`, color: 'var(--orange)', icon: <ShieldIcon size={16} color="var(--orange)" /> },
  ]

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px) clamp(12px, 4vw, 24px)' }}>

        {/* Header */}
        <ScrollReveal duration={500} delay={50}>
          <div style={{ marginBottom: 'clamp(20px, 4vw, 28px)' }}>
            <h1 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
              Welcome back,{' '}
              <HackerText text={user?.name || 'User'} style={{ color: 'var(--green)', fontSize: 'inherit', fontWeight: 'inherit' }} delay={300} duration={800} />
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text2)' }}>Here's your security overview</p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '10px' }} />)}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(10px, 2vw, 16px)', marginBottom: 'clamp(16px, 3vw, 24px)' }}>
              {statCards.map((card, i) => (
                <ScrollReveal key={i} delay={i * 80} duration={500} direction="up">
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: 'clamp(14px, 3vw, 20px)', transition: 'border-color 0.2s, transform 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = card.color + '60'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: '500', color: 'var(--text2)', lineHeight: 1.3 }}>{card.label}</span>
                      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {card.icon}
                      </div>
                    </div>
                    <HackerText
                      text={String(card.value)}
                      style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: '700', color: card.color, lineHeight: 1, display: 'block' }}
                      delay={200 + i * 80}
                      duration={600}
                      triggerOnMount
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Recent Scans */}
            <ScrollReveal delay={350} duration={500}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: 'clamp(16px, 3vw, 24px)' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <HackerText text="Recent Scans" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }} delay={400} duration={600} />
                  <Link to="/scans" style={{ fontSize: '13px', color: 'var(--text2)' }}>View all →</Link>
                </div>

                {recentScans.length === 0 ? (
                  <div style={{ padding: 'clamp(24px, 5vw, 40px) 16px', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--bg3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <ScanIcon size={18} color="var(--text3)" />
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '14px' }}>No scans yet. Add a target and run your first scan!</p>
                    <Link to="/targets"><button className="btn btn-primary">Add Target</button></Link>
                  </div>
                ) : (
                  recentScans.map((scan, i) => (
                    <div key={scan.id} onClick={() => navigate(`/scans/${scan.id}`)}
                      style={{ padding: 'clamp(10px, 2vw, 14px) 16px', borderBottom: i < recentScans.length - 1 ? '1px solid var(--border2)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.15s', gap: '10px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: getRiskColor(scan.risk_level), flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '500', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{scan.target}</div>
                          <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: 'var(--text2)' }}>{new Date(scan.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span className={getRiskBadgeClass(scan.risk_level)} style={{ fontSize: '10px' }}>{scan.risk_level}</span>
                        <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: '600', color: getRiskColor(scan.risk_level) }}>{scan.security_score}</span>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--text3)"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollReveal>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(10px, 2vw, 14px)' }}>
              {[
                { to: '/targets', label: 'Targets', sub: 'Manage & scan', color: 'var(--green)', dimColor: 'var(--green-dim)', bdColor: 'var(--green-bd)', icon: <TargetIcon size={16} color="var(--green)" /> },
                { to: '/scans', label: 'Scan History', sub: 'Reports & results', color: 'var(--blue)', dimColor: 'rgba(59,130,246,0.1)', bdColor: 'rgba(59,130,246,0.3)', icon: <ScanIcon size={16} color="var(--blue)" /> },
              ].map((card, i) => (
                <ScrollReveal key={i} delay={450 + i * 80} duration={500}>
                  <Link to={card.to} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: 'clamp(14px, 3vw, 20px)', display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 14px)', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = card.bdColor; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${card.color}18` }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: card.dimColor, border: `1px solid ${card.bdColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {card.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>{card.label}</div>
                        <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: 'var(--text2)' }}>{card.sub}</div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}

function TargetIcon({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 16 16" fill={color}><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/><path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></svg> }
function ScanIcon({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 16 16" fill={color}><path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5M3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2.5 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2.5 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2.5 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2.5 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z"/></svg> }
function AlertIcon({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 16 16" fill={color}><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg> }
function ShieldIcon({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 16 16" fill={color}><path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524z"/></svg> }
