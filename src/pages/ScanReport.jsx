import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import API from '../utils/api'
import GenerateReportModal from '../components/GenerateReportModal'

export default function ScanReport() {
  const { id } = useParams()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState('center')
  const navigate = useNavigate()

  useEffect(() => { fetchScan() }, [id])

  const fetchScan = async () => {
    try {
      const res = await API.get(`/api/history/${id}`)
      setScan(res.data.scan)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  // ── Download with auth token ───────────────────────────────────────────────
  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const res = await API.get(`/api/history/download/${id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `vulnforge_${scan?.target || id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
      alert('Download failed. Please try again.')
    }
    setDownloading(false)
  }

  // ── Client-side JSON Exporter ──────────────────────────────────────────────
  const downloadJSON = () => {
    const dataStr = JSON.stringify(scan, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `vulnforge_${scan?.target || id}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  // ── Client-side CSV/XLSX Exporter ──────────────────────────────────────────
  const downloadCSV = () => {
    let csvRows = []
    
    // Header section
    csvRows.push("Category,Item,Details / Severity,Description / Value")
    csvRows.push(`Audit Target,${scan?.target || 'Unknown'},Risk Rating: ${scan?.ai_analysis?.risk_level || 'UNKNOWN'},CVSS Score: ${scan?.ai_analysis?.security_score || 0}/10.0`)
    csvRows.push("") // spacing row

    // Open Ports
    csvRows.push("--- NETWORK INFRASTRUCTURE (OPEN PORTS) ---")
    const ports = scan?.scan_results?.portscan?.ports || []
    if (ports.length > 0) {
      ports.forEach(p => {
        csvRows.push(`Open Port,${p.port}/${p.protocol},${p.service},${(p.version || '').replace(/,/g, ' ')}`)
      })
    } else {
      csvRows.push("Open Port,None,No open ports detected,")
    }
    csvRows.push("") // spacing row

    // Subdomains
    csvRows.push("--- DISCOVERED SUBDOMAINS ---")
    const subdomains = scan?.scan_results?.subdomain?.subdomains || []
    if (subdomains.length > 0) {
      subdomains.forEach(s => {
        csvRows.push(`Subdomain,${s},Alive,`)
      })
    } else {
      csvRows.push("Subdomain,None,No subdomains discovered,")
    }
    csvRows.push("") // spacing row

    // AI Critical Findings
    csvRows.push("--- AI SECURITY AUDIT VULNERABILITIES ---")
    const findings = scan?.ai_analysis?.critical_findings || []
    if (findings.length > 0) {
      findings.forEach(f => {
        const titleClean = f.title.replace(/"/g, '""')
        const descClean = f.description.replace(/"/g, '""')
        csvRows.push(`Security Finding,"${titleClean}",[${f.severity}],"${descClean}"`)
      })
    } else {
      csvRows.push("Security Finding,None,No security findings,")
    }
    csvRows.push("") // spacing row

    // Remediation Steps
    csvRows.push("--- SECURITY REMEDIATION STEPS ---")
    const remediation = scan?.ai_analysis?.remediation_steps || []
    if (remediation.length > 0) {
      remediation.forEach(r => {
        const issueClean = r.issue.replace(/"/g, '""')
        const fixClean = r.fix.replace(/"/g, '""')
        csvRows.push(`Remediation Step,"${issueClean}",Priority: ${r.priority},"${fixClean}"`)
      })
    }

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `vulnforge_${scan?.target || id}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  // ── Client-side HTML Single-Page Report Exporter ───────────────────────────
  const downloadHTML = () => {
    const ai = scan?.ai_analysis || {}
    const ports = scan?.scan_results?.portscan?.ports || []
    const subdomains = scan?.scan_results?.subdomain?.subdomains || []
    const findings = ai.critical_findings || []
    const remediation = ai.remediation_steps || []
    const target = scan?.target || 'Unknown'

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>VulnForge Audit Report - ${target}</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: #030712; color: #f3f4f6; padding: 40px 20px; line-height: 1.6; }
        .wrapper { max-width: 900px; margin: 0 auto; background: #0b1329; border: 1px solid #00ff8833; border-radius: 12px; padding: 40px; box-shadow: 0 10px 40px rgba(0,255,136,0.08); }
        h1 { font-family: 'Orbitron', sans-serif; font-size: 28px; color: #fff; border-bottom: 2px solid #00ff88; padding-bottom: 15px; margin-top: 0; }
        h2 { font-size: 20px; color: #00aaff; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-top: 35px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #070d19; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .score { font-size: 36px; font-weight: 800; color: #ff3355; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .badge-critical { background: rgba(255,51,85,0.15); color: #ff3355; border: 1px solid #ff3355; }
        .badge-high { background: rgba(255,102,51,0.15); color: #ff6633; border: 1px solid #ff6633; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; border: 1px solid #1e293b; text-align: left; }
        th { background: #070d19; color: #94a3b8; font-size: 11px; text-transform: uppercase; }
        .port-number { color: #00ff88; font-weight: bold; font-family: monospace; }
        .card { background: #070d19; border: 1px solid #1e293b; border-left: 4px solid #ff3355; padding: 18px; border-radius: 6px; margin-bottom: 15px; }
        .remedy-card { background: #070d19; border: 1px solid #1e293b; border-left: 4px solid #00ff88; padding: 18px; border-radius: 6px; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <h1>SECURITY AUDIT REPORT</h1>
        <div class="meta-grid">
            <div>
                <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Target Scope</div>
                <div style="font-size: 20px; font-weight: bold; margin-top: 4px;">${target}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Generated on: ${new Date(scan?.created_at).toLocaleString()}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">CVSS Score</div>
                <div class="score">${ai.security_score || 0}<span style="font-size: 18px; color: #64748b;">/10.0</span></div>
                <div style="margin-top: 8px;"><span class="badge badge-critical">${ai.risk_level || 'UNKNOWN'} RISK</span></div>
            </div>
        </div>

        <h2>Executive Summary</h2>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.8;">${ai.executive_summary || 'No summary available.'}</p>

        <h2>Network Audit (Open Ports)</h2>
        <table>
            <thead>
                <tr><th>Port</th><th>Protocol</th><th>Service</th><th>Version</th></tr>
            </thead>
            <tbody>
                ${ports.map(p => `<tr><td class="port-number">${p.port}</td><td>${p.protocol}</td><td>${p.service}</td><td>${p.version || '—'}</td></tr>`).join('')}
                ${ports.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:#64748b;">No open ports identified.</td></tr>' : ''}
            </tbody>
        </table>

        <h2>Subdomain Mapping</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px;">
            ${subdomains.map(s => `<span style="background: #070d19; border: 1px solid #1e293b; padding: 4px 12px; border-radius: 4px; font-size: 13px; color: #00aaff;">${s}</span>`).join('')}
            ${subdomains.length === 0 ? '<span style="color:#64748b;">No subdomains discovered.</span>' : ''}
        </div>

        <h2>Vulnerability Findings</h2>
        ${findings.map(f => `
            <div class="card" style="border-left-color: ${f.severity === 'CRITICAL' || f.severity === 'HIGH' ? '#ff3355' : '#ffcc00'}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 16px;">${f.title}</strong>
                    <span class="badge ${f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'badge-critical' : 'badge-high'}">${f.severity}</span>
                </div>
                <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0 0;">${f.description}</p>
            </div>
        `).join('')}

        <h2>Security Remediation Guideline</h2>
        ${remedyHtml(remediation)}
    </div>
</body>
</html>`

    function remedyHtml(remedies) {
        return remedies.map(r => `
            <div class="remedy-card" style="border-left-color: ${r.priority === 'HIGH' ? '#ff3355' : '#00ff88'}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 15px;">Issue: ${r.issue}</strong>
                    <span class="badge" style="background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid #00ff88;">${r.priority} PRIORITY</span>
                </div>
                <p style="color: #cbd5e1; font-size: 13px; margin: 8px 0 0 0;"><strong>Fix:</strong> ${r.fix}</p>
            </div>
        `).join('')
    }

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `vulnforge_${target.replace('.', '_')}_report.html`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const getRiskColor = (risk) => {
    if (risk === 'CRITICAL') return '#ff3355'
    if (risk === 'HIGH')     return '#ff6633'
    if (risk === 'MEDIUM')   return '#ffcc00'
    if (risk === 'LOW')      return '#00ff88'
    return '#7a9a8a'
  }

  const getScanTypeColor = (type) => {
    if (type === 'deep')   return '#ff3355'
    if (type === 'medium') return '#ffcc00'
    return '#00ff88'
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const card = {
    background: '#060d12',
    border: '1px solid #0a2a1a',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
  }

  const sectionLabel = {
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: '11px',
    color: '#7a9a8a',
    letterSpacing: '2px',
    marginBottom: '14px',
    display: 'block',
  }

  if (loading) return (
    <PageWrapper>
      <div style={{ textAlign: 'center', color: '#00ff88', fontFamily: 'Share Tech Mono, monospace', padding: '100px' }}>
        ⟳ Loading report...
      </div>
    </PageWrapper>
  )

  if (!scan) return (
    <PageWrapper>
      <div style={{ textAlign: 'center', color: '#ff3355', fontFamily: 'Share Tech Mono, monospace', padding: '100px' }}>
        Report not found.
      </div>
    </PageWrapper>
  )

  const ai         = scan.ai_analysis || {}
  const ports      = scan.scan_results?.portscan?.ports || []
  const subdomains = scan.scan_results?.subdomain?.subdomains || []
  const techs      = scan.scan_results?.headers?.technologies || {}
  const secHeaders = scan.scan_results?.headers?.security_headers || {}
  const dnsRecords = scan.scan_results?.dns?.records || {}
  const waf        = scan.scan_results?.waf || {}
  const ssl        = scan.scan_results?.ssl || {}
  const attacks    = scan.attack_results || []
  const whois      = scan.scan_results?.whois || {}

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>

        {/* Back button */}
        <button onClick={() => navigate('/scans')}
          style={{ background: 'transparent', border: '1px solid #0a2a1a', borderRadius: '4px', padding: '8px 16px', color: '#7a9a8a', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.target.style.borderColor = '#00ff88'; e.target.style.color = '#00ff88' }}
          onMouseLeave={e => { e.target.style.borderColor = '#0a2a1a'; e.target.style.color = '#7a9a8a' }}
        >← BACK TO SCANS</button>

        {/* ── Report Header ─────────────────────────────────────────────────── */}
        <div style={{ background: '#060d12', border: `1px solid ${getRiskColor(ai.risk_level)}`, borderRadius: '8px', padding: '28px', marginBottom: '24px', boxShadow: `0 0 30px ${getRiskColor(ai.risk_level)}22` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '22px', color: '#fff', marginBottom: '6px' }}>
                {scan.target}
              </h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a' }}>
                  Scanned: {new Date(scan.created_at).toLocaleString()}
                </span>
                {scan.scan_type && (
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '10px', color: getScanTypeColor(scan.scan_type), background: getScanTypeColor(scan.scan_type) + '22', border: `1px solid ${getScanTypeColor(scan.scan_type)}44`, borderRadius: '4px', padding: '2px 10px' }}>
                    {scan.scan_type.toUpperCase()} SCAN
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ background: getRiskColor(ai.risk_level) + '22', border: `1px solid ${getRiskColor(ai.risk_level)}`, borderRadius: '6px', padding: '8px 18px', color: getRiskColor(ai.risk_level), fontFamily: 'Orbitron, sans-serif', fontSize: '14px', fontWeight: '700' }}>
                {ai.risk_level || 'UNKNOWN'}
              </div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '28px', fontWeight: '900', color: getRiskColor(ai.risk_level) }}>
                {ai.security_score || 0}<span style={{ fontSize: '14px', color: '#7a9a8a' }}>/10.0</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Open Ports',  value: ports.length,      color: '#00aaff' },
              { label: 'Subdomains',  value: subdomains.length,  color: '#00ff88' },
              { label: 'AI Findings', value: ai.critical_findings?.length || 0, color: getRiskColor(ai.risk_level) },
              { label: 'CVEs Found',  value: scan.scan_results?.nuclei?.total || 0, color: '#ff3355' },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#0a1520', border: '1px solid #0a2a1a', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '22px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#7a9a8a', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Download button */}
          <button onClick={() => { setModalPosition('top'); setIsModalOpen(true); }} disabled={downloading}
            style={{ background: '#00ff88', border: 'none', borderRadius: '6px', padding: '10px 24px', color: '#000', fontFamily: 'Orbitron, sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', cursor: downloading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 0 15px #00ff8833', opacity: downloading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!downloading) e.target.style.background = '#00cc66' }}
            onMouseLeave={e => { if (!downloading) e.target.style.background = '#00ff88' }}
          >
            {downloading ? '⟳ GENERATING...' : '📄 GENERATE REPORT'}
          </button>
        </div>

        {/* ── Executive Summary ─────────────────────────────────────────────── */}
        {ai.executive_summary && (
          <div style={card}>
            <span style={sectionLabel}>EXECUTIVE SUMMARY</span>
            <p style={{ color: '#e0f0e0', fontSize: '15px', lineHeight: '1.8', margin: 0 }}>{ai.executive_summary}</p>
          </div>
        )}

        {/* ── Critical Findings ─────────────────────────────────────────────── */}
        {ai.critical_findings?.length > 0 && (
          <div style={card}>
            <span style={sectionLabel}>CRITICAL FINDINGS ({ai.critical_findings.length})</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ai.critical_findings.map((f, i) => (
                <div key={i} style={{ background: '#0a1520', border: `1px solid ${getRiskColor(f.severity)}44`, borderLeft: `3px solid ${getRiskColor(f.severity)}`, borderRadius: '4px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '13px', color: '#fff' }}>{f.title}</span>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: getRiskColor(f.severity), background: getRiskColor(f.severity) + '22', padding: '2px 8px', borderRadius: '3px', fontWeight: '700' }}>{f.severity}</span>
                  </div>
                  <p style={{ color: '#7a9a8a', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', marginBottom: f.evidence ? '8px' : 0, lineHeight: '1.6' }}>{f.description}</p>
                  {f.evidence && (
                    <p style={{ color: '#00aaff', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', margin: 0, padding: '8px', background: '#00aaff11', borderRadius: '4px' }}>
                      Evidence: {f.evidence}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Port Scan ─────────────────────────────────────────────────────── */}
        {ports.length > 0 && (
          <div style={card}>
            <span style={sectionLabel}>OPEN PORTS ({ports.length})</span>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0a1520' }}>
                    {['PORT', 'PROTO', 'SERVICE', 'VERSION'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#7a9a8a', fontSize: '10px', letterSpacing: '1px', borderBottom: '1px solid #0a2a1a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ports.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #0a2a1a', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0a1520'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px', color: '#00ff88', fontWeight: '700' }}>{p.port}</td>
                      <td style={{ padding: '10px 14px', color: '#7a9a8a' }}>{p.protocol}</td>
                      <td style={{ padding: '10px 14px', color: '#fff' }}>{p.service}</td>
                      <td style={{ padding: '10px 14px', color: '#7a9a8a' }}>{p.version || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Subdomains ────────────────────────────────────────────────────── */}
        {subdomains.length > 0 && (
          <div style={card}>
            <span style={sectionLabel}>SUBDOMAINS FOUND ({subdomains.length})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {subdomains.slice(0, 40).map((s, i) => (
                <span key={i} style={{ background: '#0a1520', border: '1px solid #0a2a1a', borderRadius: '4px', padding: '4px 12px', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#00aaff' }}>{s}</span>
              ))}
              {subdomains.length > 40 && (
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a', alignSelf: 'center' }}>+{subdomains.length - 40} more in PDF report</span>
              )}
            </div>
          </div>
        )}

        {/* ── Security Headers ──────────────────────────────────────────────── */}
        {Object.keys(secHeaders).length > 0 && (
          <div style={card}>
            <span style={sectionLabel}>SECURITY HEADERS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(secHeaders).map(([header, value], i) => {
                const missing = value === 'NOT SET' || value === 'Missing'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#0a1520', borderRadius: '4px', borderLeft: `3px solid ${missing ? '#ff3355' : '#00ff88'}` }}>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '3px', background: missing ? '#ff335522' : '#00ff8822', color: missing ? '#ff3355' : '#00ff88', minWidth: '55px', textAlign: 'center' }}>
                      {missing ? 'MISSING' : 'SET'}
                    </span>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#fff', minWidth: '220px' }}>{header}</span>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#7a9a8a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {missing ? 'Not configured' : value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Technologies ─────────────────────────────────────────────────── */}
        {Object.keys(techs).length > 0 && (
          <div style={card}>
            <span style={sectionLabel}>TECHNOLOGIES DETECTED</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(techs).flatMap(([cat, items]) => items.map((item, i) => (
                <span key={`${cat}-${i}`} style={{ background: '#0a1520', border: '1px solid #ffcc0044', borderRadius: '4px', padding: '4px 12px', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#ffcc00' }}>{item}</span>
              )))}
            </div>
          </div>
        )}

        {/* ── DNS Records ───────────────────────────────────────────────────── */}
        {Object.keys(dnsRecords).length > 0 && (
          <div style={card}>
            <span style={sectionLabel}>DNS RECORDS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(dnsRecords).map(([type, vals], i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '10px 14px', background: '#0a1520', borderRadius: '4px', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '11px', color: '#00aaff', fontWeight: '700', minWidth: '45px' }}>{type}</span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a', flex: 1, lineHeight: '1.6' }}>{vals.slice(0, 5).join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WAF Detection ─────────────────────────────────────────────────── */}
        {waf.detected !== undefined && (
          <div style={card}>
            <span style={sectionLabel}>WAF DETECTION</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: waf.detected ? '#ff3355' : '#00ff88', boxShadow: `0 0 8px ${waf.detected ? '#ff3355' : '#00ff88'}` }} />
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: waf.detected ? '#ff3355' : '#00ff88' }}>
                {waf.detected ? `WAF Detected: ${waf.waf}` : 'No WAF detected'}
              </span>
            </div>
          </div>
        )}

        {/* ── SSL Info ──────────────────────────────────────────────────────── */}
        {ssl.status === 'success' && (ssl.tls_1_0 || ssl.tls_1_2 || ssl.tls_1_3) && (
          <div style={card}>
            <span style={sectionLabel}>SSL / TLS CONFIGURATION</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
              {[
                { label: 'TLS 1.0', value: ssl.tls_1_0 },
                { label: 'TLS 1.1', value: ssl.tls_1_1 },
                { label: 'TLS 1.2', value: ssl.tls_1_2 },
                { label: 'TLS 1.3', value: ssl.tls_1_3 },
              ].filter(t => t.value).map((t, i) => (
                <div key={i} style={{ background: '#0a1520', border: '1px solid #0a2a1a', borderRadius: '4px', padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '11px', color: '#7a9a8a', marginBottom: '4px' }}>{t.label}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: t.value === 'ERROR' ? '#ff3355' : '#00ff88' }}>{t.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WHOIS ─────────────────────────────────────────────────────────── */}
        {whois.registrar && whois.registrar !== 'None' && (
          <div style={card}>
            <span style={sectionLabel}>WHOIS INFORMATION</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Registrar',    value: whois.registrar },
                { label: 'Organisation', value: whois.org },
                { label: 'Country',      value: whois.country },
                { label: 'Created',      value: whois.creation_date },
                { label: 'Expires',      value: whois.expiration_date },
              ].filter(w => w.value && w.value !== 'None').map((w, i) => (
                <div key={i} style={{ background: '#0a1520', borderRadius: '4px', padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#7a9a8a', marginBottom: '4px', letterSpacing: '1px' }}>{w.label.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#fff' }}>{String(w.value).slice(0, 60)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI Attack Results ─────────────────────────────────────────────── */}
        {attacks.length > 0 && (
          <div style={card}>
            <span style={sectionLabel}>AI-DIRECTED ATTACKS ({attacks.length})</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attacks.map((a, i) => (
                <div key={i} style={{ background: '#0a1520', border: '1px solid #0a2a1a', borderLeft: '3px solid #ff6633', borderRadius: '4px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '12px', color: '#ff6633', fontWeight: '700' }}>{a.tool?.toUpperCase()}</span>
                    {a.result?.vulnerable === true && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#ff3355', background: '#ff335522', padding: '2px 8px', borderRadius: '3px' }}>VULNERABLE</span>}
                    {a.result?.vulnerable === false && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#00ff88', background: '#00ff8822', padding: '2px 8px', borderRadius: '3px' }}>NOT VULNERABLE</span>}
                  </div>
                  <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a', margin: '0 0 4px 0' }}>{a.reason}</p>
                  <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#555', margin: 0 }}>Target: {a.target}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Remediation ───────────────────────────────────────────────────── */}
        {ai.remediation_steps?.length > 0 && (
          <div style={card}>
            <span style={sectionLabel}>REMEDIATION STEPS ({ai.remediation_steps.length})</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ai.remediation_steps.map((s, i) => (
                <div key={i} style={{ background: '#0a1520', border: '1px solid #0a2a1a', borderLeft: `3px solid ${getRiskColor(s.priority)}`, borderRadius: '4px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '12px', color: '#fff' }}>{s.issue}</span>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: getRiskColor(s.priority), background: getRiskColor(s.priority) + '22', padding: '2px 8px', borderRadius: '3px' }}>
                      {s.priority} PRIORITY
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#7a9a8a', margin: 0, lineHeight: '1.6' }}>{s.fix}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom Download ───────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <button onClick={() => { setModalPosition('bottom'); setIsModalOpen(true); }} disabled={downloading}
            style={{ background: '#00ff88', border: 'none', borderRadius: '6px', padding: '14px 40px', color: '#000', fontFamily: 'Orbitron, sans-serif', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', cursor: downloading ? 'not-allowed' : 'pointer', boxShadow: '0 0 20px #00ff8833', transition: 'all 0.2s', opacity: downloading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!downloading) e.target.style.background = '#00cc66' }}
            onMouseLeave={e => { if (!downloading) e.target.style.background = '#00ff88' }}
          >
            {downloading ? '⟳ GENERATING...' : '📄 GENERATE FULL REPORT'}
          </button>
        </div>

        <GenerateReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetDomain={scan?.target}
          position={modalPosition}
          onGenerate={async (config) => {
            setIsModalOpen(false)
            if (config.format === 'JSON') {
              downloadJSON()
            } else if (config.format === 'CSV' || config.format === 'XLSX') {
              downloadCSV()
            } else if (config.format === 'HTML') {
              downloadHTML()
            } else {
              await downloadPDF()
            }
          }}
        />

      </div>
    </PageWrapper>
  )
}
