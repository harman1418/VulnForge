import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import API from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'

const PHASES = [
  { id: 1, name: 'Recon' },
  { id: 2, name: 'AI Analysis' },
  { id: 3, name: 'AI Attacks' },
  { id: 4, name: 'Report' },
]

const SCAN_TYPES = [
  { id: 'light',  label: 'Light',  time: '5–7 min',     color: 'var(--green)',  dimColor: 'var(--green-dim)',       bdColor: 'var(--green-bd)' },
  { id: 'medium', label: 'Medium', time: '10–15 min',   color: 'var(--orange)', dimColor: 'rgba(245,158,11,0.1)',   bdColor: 'rgba(245,158,11,0.3)' },
  { id: 'deep',   label: 'Deep',   time: 'Up to 30 min', color: 'var(--red)',    dimColor: 'var(--red-dim)',         bdColor: 'var(--red-bd)' },
]

export default function Targets() {
  usePageTitle('Targets')
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTarget, setNewTarget] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [scanning, setScanning] = useState(null)
  const [scanLogs, setScanLogs] = useState([])
  const [scanPhase, setScanPhase] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanId, setScanId] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [stopping, setStopping] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [selectedScanType, setSelectedScanType] = useState('medium')
  const [showScanModal, setShowScanModal] = useState(null)
  const wsRef = useRef(null)
  const logsEndRef = useRef(null)
  const navigate = useNavigate()

  const fetchTargets = async () => {
    try {
      const res = await API.get('/api/targets/')
      setTargets(res.data.targets || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  // ── On load: check if any scan is active (reconnect) ──────────────────────
  useEffect(() => {
    fetchTargets()
    checkForActiveScan()
  }, [])

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [scanLogs])

  useEffect(() => {
    const handler = (e) => { if (scanning) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [scanning])

  // ── Check for active scan on page load ────────────────────────────────────
  const checkForActiveScan = async () => {
    try {
      // Get list of targets first to check each
      const res = await API.get('/api/targets/')
      const targets = res.data.targets || []

      for (const t of targets) {
        const tname = t.target || t
        try {
          const statusRes = await API.get(`/api/fullscan/active/${tname}`)
          const data = statusRes.data

          if (data.status === 'running') {
            // Found an active scan — reconnect!
            setReconnecting(true)
            setScanning(tname)
            setScanPhase(data.phase || 1)

            // Restore logs
            if (data.logs?.length) {
              setScanLogs(data.logs.map((l, i) => ({
                id: i,
                phase: l.phase,
                tool: l.tool,
                status: l.status,
                timestamp: l.timestamp?.split('T')[1]?.split('.')[0] || '',
                data: l.data,
              })))
            }

            setReconnecting(false)

            // Reconnect WebSocket
            reconnectWebSocket(tname, data.scan_type || 'medium')
            break
          } else if (data.status === 'complete' && data.scan_id) {
            // Scan finished while away
            setScanComplete(true)
            setScanId(data.scan_id)
            if (data.logs?.length) {
              setScanLogs(data.logs.map((l, i) => ({
                id: i,
                phase: l.phase,
                tool: l.tool,
                status: l.status,
                timestamp: l.timestamp?.split('T')[1]?.split('.')[0] || '',
                data: l.data,
              })))
            }
            setScanPhase(4)
            break
          }
        } catch (e) { /* no active scan for this target */ }
      }
    } catch (err) { console.error(err) }
  }

  // ── Reconnect to existing WebSocket scan ─────────────────────────────────
  const reconnectWebSocket = (target, scanType) => {
    const token = localStorage.getItem('token') || ''
    const ws = new WebSocket(`wss://api.vulnforge.app/api/fullscan/ws/${scanType}/${target}?token=${token}`)
    wsRef.current = ws
    attachWsHandlers(ws, target)
  }

  // ── WebSocket event handlers ──────────────────────────────────────────────
  const attachWsHandlers = (ws, target) => {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.phase) setScanPhase(data.phase)

        setScanLogs(prev => [...prev, {
          id: Date.now() + Math.random(),
          phase: data.phase,
          tool: data.tool,
          status: data.status,
          timestamp: new Date().toLocaleTimeString(),
          data: data.data,
        }])

        if (data.status === 'complete') {
          setScanComplete(true)
          setScanning(null)
          setStopping(false)
          if (data.data?.scan_id) setScanId(data.data.scan_id)
          fetchTargets()
        }

        if (data.status === 'done' && data.tool === 'Report Generator') {
          if (data.data?.scan_id) setScanId(data.data.scan_id)
        }

        if (data.status === 'cancelled') {
          setScanning(null)
          setStopping(false)
          setScanError('Scan stopped by user.')
        }

        if (data.status === 'error') {
          setScanning(null)
          setStopping(false)
          setScanError(data.data?.message || 'Scan failed')
        }
      } catch (e) { console.error(e) }
    }

    ws.onerror = () => { setScanning(null); setStopping(false); setScanError('Connection error.') }
    ws.onclose = () => { /* scan may still be running on server */ }
  }

  // ── Start Scan ────────────────────────────────────────────────────────────
  const startScan = (target, scanType) => {
    setShowScanModal(null)
    setScanning(target)
    setScanLogs([])
    setScanPhase(1)
    setScanComplete(false)
    setScanId(null)
    setScanError(null)
    setStopping(false)

    const token = localStorage.getItem('token') || ''
    const ws = new WebSocket(`wss://api.vulnforge.app/api/fullscan/ws/${scanType}/${target}?token=${token}`)
    wsRef.current = ws
    attachWsHandlers(ws, target)
  }

  // ── Stop Scan ─────────────────────────────────────────────────────────────
  const stopScan = async () => {
  if (!scanning || stopping) return
  setStopping(true)
  try {
    // Close WebSocket immediately
    if (wsRef.current) wsRef.current.close()
    // Signal backend
    await API.delete(`/api/fullscan/stop/${scanning}`)
    // Update UI immediately
    setScanning(null)
    setStopping(false)
    setScanError('Scan stopped by user.')
  } catch (err) {
    console.error('Stop scan error:', err)
    // Even if API fails, close frontend
    setScanning(null)
    setStopping(false)
    setScanError('Scan stopped.')
  }
}

  const addTarget = async () => {
    if (!newTarget.trim()) return
    setAdding(true)
    try {
      await API.post('/api/targets/', { target: newTarget.trim() })
      setNewTarget('')
      setShowAdd(false)
      fetchTargets()
    } catch (err) { console.error(err) }
    setAdding(false)
  }

  const deleteTarget = async (target) => {
    if (!confirm(`Delete ${target}?`)) return
    try {
      await API.delete(`/api/targets/${encodeURIComponent(target)}`)
      fetchTargets()
    } catch (err) { console.error(err) }
  }

  const getStatusColor = (s) => {
    if (s === 'running')   return 'var(--orange)'
    if (s === 'done')      return 'var(--green)'
    if (s === 'complete')  return 'var(--green)'
    if (s === 'error')     return 'var(--red)'
    if (s === 'cancelled') return 'var(--red)'
    if (s === 'skipped')   return 'var(--text3)'
    return 'var(--text3)'
  }

  const getStatusIcon = (s) => {
    if (s === 'running')   return '⟳'
    if (s === 'done')      return '✓'
    if (s === 'complete')  return '✓'
    if (s === 'error')     return '✗'
    if (s === 'cancelled') return '✗'
    if (s === 'skipped')   return '—'
    return '○'
  }

  const resetScan = () => {
    setScanComplete(false)
    setScanLogs([])
    setScanId(null)
    setScanError(null)
    setScanPhase(0)
    setStopping(false)
  }

  const activeScanType = SCAN_TYPES.find(t => t.id === selectedScanType)

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px) clamp(12px, 4vw, 24px)' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>Target Management</h1>
            <p style={{ fontSize: '14px', color: 'var(--text2)' }}>Add domains or IPs — choose scan depth per target</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Add Target</button>
        </div>

        {/* ── Reconnecting banner ── */}
        {reconnecting && (
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="var(--blue)" strokeOpacity="0.3" strokeWidth="2"/>
              <path d="M14 8a6 6 0 0 0-6-6" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '14px', color: 'var(--blue)' }}>Reconnecting to active scan...</span>
          </div>
        )}

        {/* ── Add Target Input ── */}
        {showAdd && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--green-bd)', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input className="input" type="text" value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTarget()}
              placeholder="Enter domain or IP (e.g. example.com)"
              autoFocus style={{ flex: '1', minWidth: '200px' }} />
            <button className="btn btn-primary" onClick={addTarget} disabled={adding}>{adding ? 'Adding...' : 'Add'}</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        )}

        {/* ── Scan Type Modal ── */}
        {showScanModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: 'clamp(24px, 5vw, 36px)', width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow-lg)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Select scan type</h2>
              <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '20px' }}>
                Target: <span style={{ fontWeight: '600', color: 'var(--text)' }}>{showScanModal}</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {SCAN_TYPES.map(type => (
                  <div key={type.id} onClick={() => setSelectedScanType(type.id)}
                    style={{ background: selectedScanType === type.id ? type.dimColor : 'var(--bg3)', border: `1px solid ${selectedScanType === type.id ? type.bdColor : 'var(--border)'}`, borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '14px' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = type.bdColor}
                    onMouseLeave={e => e.currentTarget.style.borderColor = selectedScanType === type.id ? type.bdColor : 'var(--border)'}
                  >
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${type.color}`, background: selectedScanType === type.id ? type.color : 'transparent', flexShrink: 0, transition: 'all 0.15s' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: type.color }}>{type.label}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text2)', flexShrink: 0 }}>{type.time}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.4' }}>
                        {type.id === 'light' && 'Top 1000 ports, subdomain enum, headers, WAF, SSL, AI analysis'}
                        {type.id === 'medium' && 'Top 5000 ports + OS detection, full recon, CVE scan, URL fuzzing, AI attacks'}
                        {type.id === 'deep' && 'All ports, aggressive scan, Nikto, WPScan, DNS brute force, full AI exploitation'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-lg btn-full"
                  onClick={() => startScan(showScanModal, selectedScanType)}
                  style={{ background: activeScanType?.color, color: '#fff', border: 'none', flex: 1 }}>
                  Launch {selectedScanType} scan
                </button>
                <button className="btn btn-secondary" onClick={() => setShowScanModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Scan Progress Panel ── */}
        {(scanning || scanComplete || scanError) && (
          <div style={{ background: 'var(--bg2)', border: `1px solid ${scanError ? 'var(--red)' : scanComplete ? 'var(--green)' : 'var(--orange)'}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>

            {/* Panel Header */}
            <div style={{ background: 'var(--bg3)', padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              {/* Phase pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PHASES.map(p => (
                  <span key={p.id} style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '999px', background: scanPhase >= p.id ? 'var(--green-dim)' : 'var(--bg4)', border: `1px solid ${scanPhase >= p.id ? 'var(--green-bd)' : 'var(--border)'}`, color: scanPhase >= p.id ? 'var(--green)' : 'var(--text3)' }}>
                    {scanComplete && scanPhase >= p.id ? '✓ ' : scanPhase === p.id && !scanComplete ? '⟳ ' : ''}{p.name}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* STOP button — shown while scanning */}
                {scanning && !scanComplete && (
                  <button
                    onClick={stopScan}
                    disabled={stopping}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: stopping ? 'var(--bg4)' : 'var(--red-dim)', border: `1px solid ${stopping ? 'var(--border)' : 'var(--red-bd)'}`, borderRadius: '6px', padding: '5px 12px', color: stopping ? 'var(--text3)' : 'var(--red)', fontSize: '12px', fontWeight: '600', cursor: stopping ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}
                  >
                    {stopping ? (
                      <>
                        <svg style={{ animation: 'spin 0.8s linear infinite' }} width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/>
                          <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Stopping...
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
                        </svg>
                        Stop Scan
                      </>
                    )}
                  </button>
                )}

                {/* Complete actions */}
                {scanComplete && (
                  <>
                    <span style={{ fontSize: '13px', color: 'var(--green)' }}>Scan complete!</span>
                    {scanId
                      ? <button className="btn btn-primary btn-sm" onClick={() => navigate(`/scans/${scanId}`)}>View Report →</button>
                      : <button className="btn btn-secondary btn-sm" onClick={() => navigate('/scans')}>Go to Scans →</button>
                    }
                    <button className="btn btn-ghost btn-sm" onClick={resetScan}>✕</button>
                  </>
                )}

                {/* Error actions */}
                {scanError && (
                  <>
                    <span style={{ fontSize: '13px', color: 'var(--red)' }}>{scanError}</span>
                    <button className="btn btn-sm btn-danger" onClick={resetScan}>Dismiss</button>
                  </>
                )}
              </div>
            </div>

            {/* Reconnected banner */}
            {scanComplete && !scanId && (
              <div style={{ background: 'rgba(245,158,11,0.08)', padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--orange)' }}>Report saved — check Scans page.</span>
              </div>
            )}

            {/* Logs */}
            {scanLogs.length > 0 && (
              <div style={{ padding: '14px 16px', maxHeight: '260px', overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', lineHeight: '1.8' }}>
                {scanLogs.map(log => (
                  <div key={log.id} style={{ display: 'flex', gap: '8px', marginBottom: '1px' }}>
                    <span style={{ color: 'var(--text3)', flexShrink: 0 }}>[{log.timestamp}]</span>
                    <span style={{ color: getStatusColor(log.status), flexShrink: 0 }}>{getStatusIcon(log.status)}</span>
                    <span style={{ color: 'var(--text)', minWidth: '140px', flexShrink: 0 }}>{log.tool}</span>
                    <span style={{ color: getStatusColor(log.status) }}>
                      {log.status.toUpperCase()}
                      {log.status === 'done' && log.data?.total !== undefined &&
                        <span style={{ color: 'var(--text2)', marginLeft: '6px' }}>→ {log.data.total} found</span>}
                      {log.status === 'done' && log.data?.risk_level &&
                        <span style={{ color: 'var(--text2)', marginLeft: '6px' }}>→ Risk: {log.data.risk_level} | Score: {log.data.security_score}</span>}
                      {log.status === 'done' && log.data?.scan_id &&
                        <span style={{ color: 'var(--green)', marginLeft: '6px' }}>→ Saved ✓</span>}
                    </span>
                  </div>
                ))}
                {scanning && <div style={{ color: 'var(--orange)', marginTop: '4px' }}>⟳ Scanning {scanning}...</div>}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        )}

        {/* ── Targets List ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '10px' }} />)}
          </div>
        ) : targets.length === 0 ? (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: 'clamp(40px, 8vw, 60px) 20px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', background: 'var(--bg3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 16 16" fill="var(--text3)">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
                <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
              </svg>
            </div>
            <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)', marginBottom: '6px' }}>No targets yet</p>
            <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '20px' }}>Add your first target to begin scanning.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add First Target</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {targets.map((t, i) => {
              const tname = t.target || t
              const isScanning = scanning === tname
              return (
                <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${isScanning ? 'var(--orange)' : 'var(--border)'}`, borderRadius: '10px', padding: 'clamp(14px, 3vw, 18px) clamp(14px, 3vw, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!isScanning) e.currentTarget.style.borderColor = 'var(--green-bd)' }}
                  onMouseLeave={e => { if (!isScanning) e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: isScanning ? 'rgba(245,158,11,0.1)' : 'var(--bg3)', border: `1px solid ${isScanning ? 'var(--orange)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isScanning
                        ? <span style={{ color: 'var(--orange)', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                        : <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--green)"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/><path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></svg>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: '600', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{tname}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
                        Added {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'recently'}
                        {' · '}{t.scan_count || 0} scan{t.scan_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <button className="btn btn-sm"
                      onClick={() => !scanning && setShowScanModal(tname)}
                      disabled={!!scanning}
                      style={{ background: isScanning ? 'rgba(245,158,11,0.1)' : 'var(--green-dim)', border: `1px solid ${isScanning ? 'var(--orange)' : 'var(--green-bd)'}`, color: isScanning ? 'var(--orange)' : 'var(--green)', cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning && !isScanning ? 0.5 : 1 }}>
                      {isScanning ? '⟳ Scanning...' : 'Scan'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteTarget(tname)} style={{ padding: '5px 10px' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}