import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../utils/api'

const PHASES = [
  { id: 1, name: 'RECON' },
  { id: 2, name: 'AI ANALYSIS' },
  { id: 3, name: 'AI ATTACKS' },
  { id: 4, name: 'REPORT' },
]

export default function Home() {
  const [target, setTarget] = useState('')
  const [scanning, setScanning] = useState(false)
  const [logs, setLogs] = useState([])
  const [currentPhase, setCurrentPhase] = useState(0)
  const [currentTool, setCurrentTool] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [complete, setComplete] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedScan, setSelectedScan] = useState(null)
  const wsRef = useRef(null)
  const logsEndRef = useRef(null)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('vulnforge_user') || 'null')

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await API.get('/api/history/')
      setHistory(res.data.scans || [])
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
    setHistoryLoading(false)
  }

  const toggleHistory = () => {
    if (!showHistory) fetchHistory()
    setShowHistory(!showHistory)
    setSelectedScan(null)
  }

  const logout = () => {
    localStorage.removeItem('vulnforge_user')
    navigate('/')
  }

  const startScan = () => {
    if (!user) { navigate('/login'); return }
    if (!target.trim()) return
    setScanning(true)
    setLogs([])
    setAiAnalysis(null)
    setDownloadUrl(null)
    setComplete(false)
    setCurrentPhase(1)
    setShowHistory(false)

    const ws = new WebSocket(`wss://api.vulnforge.app/api/fullscan/ws/${target}`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentTool(data.tool)
      setCurrentPhase(data.phase)
      setLogs(prev => [...prev, {
        id: Date.now(),
        phase: data.phase,
        tool: data.tool,
        status: data.status,
        timestamp: new Date().toLocaleTimeString(),
        data: data.data,
      }])
      if (data.tool === 'Gemini AI' && data.status === 'done') setAiAnalysis(data.data)
      if (data.status === 'complete') {
        setComplete(true)
        setScanning(false)
        if (data.data?.download_url) setDownloadUrl(`https://api.vulnforge.app${data.data.download_url}`)
      }
      if (data.status === 'error') setScanning(false)
    }

    ws.onerror = () => {
      setLogs(prev => [...prev, {
        id: Date.now(), phase: 0, tool: 'System', status: 'error',
        timestamp: new Date().toLocaleTimeString(), data: { message: 'Connection error' }
      }])
      setScanning(false)
    }

    ws.onclose = () => { if (scanning) setScanning(false) }
  }

  const getStatusColor = (status) => {
    if (status === 'running') return '#ffcc00'
    if (status === 'done') return '#00ff88'
    if (status === 'error') return '#ff3355'
    if (status === 'complete') return '#00ff88'
    return '#7a9a8a'
  }

  const getStatusIcon = (status) => {
    if (status === 'running') return '⟳'
    if (status === 'done') return '✅'
    if (status === 'error') return '❌'
    if (status === 'complete') return '🎯'
    return '○'
  }

  const getRiskColor = (risk) => {
    if (risk === 'CRITICAL') return '#ff3355'
    if (risk === 'HIGH') return '#ff6633'
    if (risk === 'MEDIUM') return '#ffcc00'
    if (risk === 'LOW') return '#00ff88'
    return '#7a9a8a'
  }

  const formatDate = (dateStr) => {
    try { return new Date(dateStr).toLocaleString() }
    catch { return dateStr }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020408', color: '#e0f0e0', fontFamily: 'Rajdhani, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Grid Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Navbar */}
        <div style={{ borderBottom: '1px solid #0a2a1a', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,4,8,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/VulnForge1.png" alt="VulnForge" style={{ height: '35px', width: '35px', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '22px', fontWeight: '900', color: '#00ff88', textShadow: '0 0 20px #00ff8866' }}>VULNFORGE</span>
            <span style={{ background: '#0a1520', border: '1px solid #0a2a1a', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color: '#7a9a8a', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '1px' }}>v1.0</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#00ff88' }}>● ONLINE</span>

            {user && (
              <button onClick={toggleHistory} style={{ background: showHistory ? '#00ff8822' : 'transparent', border: `1px solid ${showHistory ? '#00ff88' : '#0a2a1a'}`, borderRadius: '4px', padding: '6px 16px', color: showHistory ? '#00ff88' : '#7a9a8a', fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!showHistory) { e.target.style.borderColor = '#00ff88'; e.target.style.color = '#00ff88' } }}
                onMouseLeave={e => { if (!showHistory) { e.target.style.borderColor = '#0a2a1a'; e.target.style.color = '#7a9a8a' } }}
              >📋 HISTORY</button>
            )}

            {user ? (
              <>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: '#00ff88', background: '#0a1520', border: '1px solid #0a2a1a', borderRadius: '4px', padding: '6px 12px' }}>👤 {user.name}</span>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid #ff3355', borderRadius: '4px', padding: '6px 16px', color: '#ff3355', fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.target.style.background = '#ff3355'; e.target.style.color = '#fff' }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#ff3355' }}
                >LOGOUT</button>
              </>
            ) : (
              <>
                <Link to="/login"><button style={{ background: 'transparent', border: '1px solid #0a2a1a', borderRadius: '4px', padding: '6px 16px', color: '#7a9a8a', fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.target.style.borderColor = '#00ff88'; e.target.style.color = '#00ff88' }}
                  onMouseLeave={e => { e.target.style.borderColor = '#0a2a1a'; e.target.style.color = '#7a9a8a' }}
                >LOGIN</button></Link>
                <Link to="/register"><button style={{ background: '#00ff88', border: 'none', borderRadius: '4px', padding: '6px 16px', color: '#000', fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.target.style.background = '#00cc66'}
                  onMouseLeave={e => e.target.style.background = '#00ff88'}
                >SIGN UP</button></Link>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>

          {/* History Panel */}
          {showHistory && (
            <div style={{ maxWidth: '900px', margin: '40px auto 0', padding: '0 40px' }}>
              <div style={{ background: '#060d12', border: '1px solid #0a2a1a', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#0a1520', padding: '16px 24px', borderBottom: '1px solid #0a2a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', color: '#00ff88', letterSpacing: '2px' }}>📋 SCAN HISTORY</span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a' }}>{history.length} scans found</span>
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {historyLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#00ff88', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px' }}>⟳ Loading scan history...</div>
                  ) : history.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#7a9a8a', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px' }}>No scans found. Run your first scan!</div>
                  ) : (
                    history.map((scan) => (
                      <div key={scan.id}>
                        <div
                          onClick={() => setSelectedScan(selectedScan?.id === scan.id ? null : scan)}
                          style={{ padding: '16px 24px', borderBottom: '1px solid #0a2a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.2s', background: selectedScan?.id === scan.id ? '#0a1520' : 'transparent' }}
                          onMouseEnter={e => { if (selectedScan?.id !== scan.id) e.currentTarget.style.background = '#060d12ee' }}
                          onMouseLeave={e => { if (selectedScan?.id !== scan.id) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getRiskColor(scan.risk_level), boxShadow: `0 0 8px ${getRiskColor(scan.risk_level)}` }} />
                            <div>
                              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '13px', color: '#fff', marginBottom: '4px' }}>{scan.target}</div>
                              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#7a9a8a' }}>{formatDate(scan.created_at)}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: getRiskColor(scan.risk_level) + '22', border: `1px solid ${getRiskColor(scan.risk_level)}`, borderRadius: '4px', padding: '2px 10px', color: getRiskColor(scan.risk_level), fontFamily: 'Orbitron, sans-serif', fontSize: '10px', fontWeight: '700' }}>{scan.risk_level}</div>
                            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '13px', color: getRiskColor(scan.risk_level) }}>{scan.security_score}/100</div>
                            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#7a9a8a' }}>{scan.critical_findings_count} findings</div>
                            <a href={`https://api.vulnforge.app/api/history/download/${scan.id}`} download onClick={e => e.stopPropagation()}>
                              <button style={{ background: '#00ff8822', border: '1px solid #00ff88', borderRadius: '4px', padding: '4px 12px', color: '#00ff88', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.target.style.background = '#00ff88'; e.target.style.color = '#000' }}
                                onMouseLeave={e => { e.target.style.background = '#00ff8822'; e.target.style.color = '#00ff88' }}
                              >📄 PDF</button>
                            </a>
                            <span style={{ color: '#7a9a8a', fontSize: '12px' }}>{selectedScan?.id === scan.id ? '▲' : '▼'}</span>
                          </div>
                        </div>
                        {selectedScan?.id === scan.id && (
                          <div style={{ padding: '20px 24px', background: '#0a1520', borderBottom: '1px solid #0a2a1a' }}>
                            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#7a9a8a', letterSpacing: '2px', marginBottom: '10px' }}>EXECUTIVE SUMMARY</div>
                            <p style={{ color: '#e0f0e0', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>{scan.executive_summary || 'No summary available.'}</p>
                            {scan.critical_findings_count > 0 && (
                              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#ff3355' }}>
                                ⚠️ {scan.critical_findings_count} critical findings detected — download report for full details
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 40px 40px', textAlign: 'center' }}>
            {!scanning && !complete && (
              <>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a', letterSpacing: '4px', marginBottom: '20px' }}>AUTONOMOUS PENETRATION TESTING PLATFORM</div>
                <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: '900', color: '#00ff88', textShadow: '0 0 40px #00ff8866', marginBottom: '16px', lineHeight: '1' }}>
                  VULN<span style={{ color: '#fff' }}>FORGE</span>
                </h1>
                <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: '#7a9a8a', marginBottom: '16px', lineHeight: '1.8' }}>
                  Enter a domain. Our AI runs all scans, analyzes vulnerabilities,<br />executes targeted attacks, and generates a full pentest report.
                </p>
                {!user && (
                  <div style={{ display: 'inline-block', background: '#ff335511', border: '1px solid #ff3355', borderRadius: '6px', padding: '10px 20px', marginBottom: '30px', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: '#ff3355' }}>
                    🔒 You must <Link to="/login" style={{ color: '#00ff88' }}>login</Link> or <Link to="/register" style={{ color: '#00ff88' }}>register</Link> to use the scanner
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginBottom: '50px', flexWrap: 'wrap' }}>
                  {[{ value: '15+', label: 'TOOLS' }, { value: '9000+', label: 'CVE TEMPLATES' }, { value: 'AI', label: 'POWERED' }, { value: '24/7', label: 'CLOUD' }].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '28px', fontWeight: '900', color: '#00ff88', textShadow: '0 0 20px #00ff8844' }}>{stat.value}</div>
                      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#7a9a8a', letterSpacing: '2px', marginTop: '4px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Scan Input */}
            <div style={{ display: 'flex', gap: '12px', maxWidth: '700px', margin: '0 auto 40px' }}>
              <input
                type="text"
                value={target}
                onChange={e => setTarget(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !scanning && startScan()}
                placeholder={user ? 'Enter target domain (e.g. example.com)' : 'Login to start scanning...'}
                disabled={scanning || !user}
                style={{ flex: 1, background: '#060d12', border: `1px solid ${user ? '#0a2a1a' : '#ff335533'}`, borderRadius: '6px', padding: '16px 20px', color: user ? '#00ff88' : '#7a9a8a', fontFamily: 'Share Tech Mono, monospace', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', cursor: user ? 'text' : 'not-allowed' }}
                onFocus={e => user && (e.target.style.borderColor = '#00ff88')}
                onBlur={e => e.target.style.borderColor = user ? '#0a2a1a' : '#ff335533'}
              />
              <button onClick={startScan} disabled={scanning} style={{ background: !user ? '#0a1520' : scanning ? '#0a1520' : '#00ff88', border: (!user || scanning) ? '1px solid #0a2a1a' : 'none', borderRadius: '6px', padding: '16px 32px', color: (!user || scanning) ? '#7a9a8a' : '#000', fontFamily: 'Orbitron, sans-serif', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', cursor: scanning ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: (user && !scanning) ? '0 0 30px #00ff8833' : 'none' }}>
                {!user ? '🔒 LOGIN TO SCAN' : scanning ? '[ SCANNING... ]' : '[ LAUNCH SCAN ]'}
              </button>
            </div>

            {/* Phase Progress */}
            {(scanning || complete) && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {PHASES.map(phase => (
                  <div key={phase.id} style={{ background: currentPhase >= phase.id ? '#0a1520' : '#060d12', border: `1px solid ${currentPhase >= phase.id ? '#00ff88' : '#0a2a1a'}`, borderRadius: '4px', padding: '8px 16px', fontFamily: 'Orbitron, sans-serif', fontSize: '11px', color: currentPhase >= phase.id ? '#00ff88' : '#7a9a8a', letterSpacing: '1px', transition: 'all 0.3s', boxShadow: currentPhase === phase.id ? '0 0 15px #00ff8833' : 'none' }}>
                    {complete && currentPhase >= phase.id ? '✅' : currentPhase === phase.id ? '⟳' : '○'} P{phase.id}: {phase.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Terminal Logs */}
          {logs.length > 0 && (
            <div style={{ maxWidth: '900px', margin: '0 auto 40px', padding: '0 40px' }}>
              <div style={{ background: '#060d12', border: '1px solid #0a2a1a', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#0a1520', padding: '10px 20px', borderBottom: '1px solid #0a2a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff3355' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffcc00' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00ff88' }} />
                  <span style={{ marginLeft: '10px', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a' }}>vulnforge@{target} — scan_log</span>
                </div>
                <div style={{ padding: '20px', maxHeight: '350px', overflowY: 'auto', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', lineHeight: '1.8' }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '2px' }}>
                      <span style={{ color: '#7a9a8a', minWidth: '80px' }}>[{log.timestamp}]</span>
                      <span style={{ color: '#00aaff', minWidth: '24px' }}>P{log.phase}</span>
                      <span style={{ color: getStatusColor(log.status), minWidth: '16px' }}>{getStatusIcon(log.status)}</span>
                      <span style={{ color: '#fff', minWidth: '180px' }}>{log.tool}</span>
                      <span style={{ color: getStatusColor(log.status) }}>
                        {log.status.toUpperCase()}
                        {log.status === 'done' && log.data && (
                          <span style={{ color: '#7a9a8a', marginLeft: '8px' }}>
                            {log.data.total !== undefined && `→ ${log.data.total} found`}
                            {log.data.risk_level && `→ Risk: ${log.data.risk_level}`}
                            {log.data.attacks && `→ ${log.data.attacks.length} attacks executed`}
                            {log.data.report_path && '→ Report ready!'}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  {scanning && <div style={{ color: '#ffcc00' }}>⟳ {currentTool} running...</div>}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {aiAnalysis && (
            <div style={{ maxWidth: '900px', margin: '0 auto 40px', padding: '0 40px' }}>
              <div style={{ background: '#060d12', border: `1px solid ${getRiskColor(aiAnalysis.risk_level)}`, borderRadius: '8px', padding: '30px', boxShadow: `0 0 30px ${getRiskColor(aiAnalysis.risk_level)}22` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #0a2a1a' }}>
                  <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px', color: '#00ff88', letterSpacing: '2px' }}>🤖 AI SECURITY ANALYSIS</div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: getRiskColor(aiAnalysis.risk_level) + '22', border: `1px solid ${getRiskColor(aiAnalysis.risk_level)}`, borderRadius: '4px', padding: '4px 12px', color: getRiskColor(aiAnalysis.risk_level), fontFamily: 'Orbitron, sans-serif', fontSize: '12px', fontWeight: '700' }}>{aiAnalysis.risk_level}</div>
                    <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '24px', color: getRiskColor(aiAnalysis.risk_level) }}>{aiAnalysis.security_score}/100</div>
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#7a9a8a', letterSpacing: '2px', marginBottom: '8px' }}>EXECUTIVE SUMMARY</div>
                  <p style={{ color: '#e0f0e0', fontSize: '15px', lineHeight: '1.7' }}>{aiAnalysis.executive_summary}</p>
                </div>
                {aiAnalysis.critical_findings?.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#7a9a8a', letterSpacing: '2px', marginBottom: '12px' }}>CRITICAL FINDINGS ({aiAnalysis.critical_findings.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {aiAnalysis.critical_findings.map((finding, i) => (
                        <div key={i} style={{ background: '#0a1520', border: `1px solid ${getRiskColor(finding.severity)}44`, borderLeft: `3px solid ${getRiskColor(finding.severity)}`, borderRadius: '4px', padding: '12px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '12px', color: '#fff' }}>{finding.title}</span>
                            <span style={{ fontSize: '11px', color: getRiskColor(finding.severity), fontFamily: 'Share Tech Mono, monospace' }}>{finding.severity}</span>
                          </div>
                          <p style={{ color: '#7a9a8a', fontSize: '13px', fontFamily: 'Share Tech Mono, monospace', margin: 0 }}>{finding.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {aiAnalysis.remediation_steps?.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#7a9a8a', letterSpacing: '2px', marginBottom: '12px' }}>REMEDIATION STEPS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {aiAnalysis.remediation_steps.map((step, i) => (
                        <div key={i} style={{ background: '#0a1520', border: '1px solid #0a2a1a', borderRadius: '4px', padding: '12px 16px', display: 'flex', gap: '12px' }}>
                          <span style={{ color: '#00ff88' }}>→</span>
                          <div>
                            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '11px', color: '#fff', marginBottom: '4px' }}>{step.issue}</div>
                            <div style={{ color: '#7a9a8a', fontSize: '13px', fontFamily: 'Share Tech Mono, monospace' }}>{step.fix}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Report */}
          {complete && downloadUrl && (
            <div style={{ maxWidth: '900px', margin: '0 auto 60px', padding: '0 40px', textAlign: 'center' }}>
              <div style={{ background: '#060d12', border: '1px solid #00ff88', borderRadius: '8px', padding: '40px', boxShadow: '0 0 40px #00ff8822' }}>
                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', color: '#00ff88', marginBottom: '10px' }}>🎯 SCAN COMPLETE!</div>
                <p style={{ color: '#7a9a8a', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', marginBottom: '30px' }}>Full report generated for {target} and saved to history.</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href={downloadUrl} download>
                    <button style={{ background: '#00ff88', border: 'none', borderRadius: '6px', padding: '14px 32px', color: '#000', fontFamily: 'Orbitron, sans-serif', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 0 20px #00ff8833', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.target.style.background = '#00cc66'}
                      onMouseLeave={e => e.target.style.background = '#00ff88'}
                    >📄 DOWNLOAD PDF</button>
                  </a>
                  <button onClick={toggleHistory} style={{ background: 'transparent', border: '1px solid #00aaff', borderRadius: '6px', padding: '14px 32px', color: '#00aaff', fontFamily: 'Orbitron, sans-serif', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.target.style.background = '#00aaff22'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >📋 VIEW HISTORY</button>
                  <button onClick={() => { setScanning(false); setComplete(false); setLogs([]); setAiAnalysis(null); setDownloadUrl(null); setTarget(''); setCurrentPhase(0) }} style={{ background: 'transparent', border: '1px solid #0a2a1a', borderRadius: '6px', padding: '14px 32px', color: '#7a9a8a', fontFamily: 'Orbitron, sans-serif', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.target.style.borderColor = '#00ff88'; e.target.style.color = '#00ff88' }}
                    onMouseLeave={e => { e.target.style.borderColor = '#0a2a1a'; e.target.style.color = '#7a9a8a' }}
                  >🔄 NEW SCAN</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #0a2a1a', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: 'rgba(6,13,18,0.8)' }}>
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a', letterSpacing: '1px', margin: 0 }}>
            © 2026 <span style={{ color: '#00ff88' }}>VulnForge</span> — Harmanjot Singh
          </p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="https://github.com/harman1418" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7a9a8a', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00ff88'}
              onMouseLeave={e => e.currentTarget.style.color = '#7a9a8a'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/harmanjotcs/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7a9a8a', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00aaff'}
              onMouseLeave={e => e.currentTarget.style.color = '#7a9a8a'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}