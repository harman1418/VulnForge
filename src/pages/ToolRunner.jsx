import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import HackerText from '../components/HackerText'
import ScrollReveal from '../components/ScrollReveal'
import API from '../utils/api'
import { getToolById, ALL_TOOLS, TOOL_CATEGORIES, getToolsByCategory } from '../config/toolsConfig'
import { usePageTitle } from '../hooks/usePageTitle'

export default function ToolRunner() {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const tool = getToolById(toolId)

  usePageTitle(tool ? tool.name : 'Tool')

  const [target, setTarget] = useState('')
  const [extraParams, setExtraParams] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(null)

  // Set default extra param values
  useEffect(() => {
    if (tool?.fields) {
      const defaults = {}
      tool.fields.forEach(f => { if (f.default) defaults[f.name] = f.default })
      setExtraParams(defaults)
    }
    setResult(null); setError(''); setElapsed(null)
  }, [toolId])

  if (!tool) return (
    <PageWrapper>
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: '20px', color: 'var(--text)', marginBottom: '8px' }}>Tool not found</h1>
        <p style={{ color: 'var(--text2)', marginBottom: '20px' }}>The tool "{toolId}" doesn't exist.</p>
        <Link to="/tools"><button className="btn btn-primary">Browse all tools</button></Link>
      </div>
    </PageWrapper>
  )

  const handleScan = async () => {
    if (!target.trim()) { setError('Please enter a target'); return }
    setLoading(true); setError(''); setResult(null); setElapsed(null)
    const start = Date.now()
    try {
      const params = { target: target.trim(), ...extraParams }
      const res = await API.get(tool.endpoint, { params })
      setResult(res.data)
      setElapsed(((Date.now() - start) / 1000).toFixed(1))
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Scan failed')
    }
    setLoading(false)
  }

  const catTools = getToolsByCategory(tool.category)
  const catInfo  = TOOL_CATEGORIES.find(c => c.id === tool.category)

  return (
    <PageWrapper>
      <div className="tool-runner-layout" style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(16px, 4vw, 28px) clamp(12px, 4vw, 24px)' }}>

        {/* ── Left sidebar — related tools ── */}
        <div className="tool-runner-sidebar">
          <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', padding: '0 4px' }}>
            {catInfo?.label}
          </p>
          {catTools.map(t => (
            <Link key={t.id} to={t.path} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '9px 12px', borderRadius: '8px', background: t.id === toolId ? tool.color + '12' : 'transparent', borderLeft: `3px solid ${t.id === toolId ? tool.color : 'transparent'}`, transition: 'all 0.15s', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={e => { if (t.id !== toolId) e.currentTarget.style.background = 'var(--bg2)' }}
                onMouseLeave={e => { if (t.id !== toolId) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '13px', fontWeight: t.id === toolId ? '600' : '400', color: t.id === toolId ? tool.color : 'var(--text2)', lineHeight: 1.3 }}>{t.shortName}</span>
                {t.isNew && <span style={{ fontSize: '9px', fontWeight: '700', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-bd)', borderRadius: '999px', padding: '0px 5px', flexShrink: 0 }}>NEW</span>}
              </div>
            </Link>
          ))}

          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
          <Link to="/tools" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text3)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
              All Tools
            </div>
          </Link>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <ScrollReveal duration={400} delay={50}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: tool.color + '15', border: `1px solid ${tool.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill={tool.color}>
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <HackerText text={tool.name} tag="h1" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '700', color: 'var(--text)', display: 'inline-block' }} delay={100} duration={700} />
                  {tool.isNew && <span style={{ fontSize: '10px', fontWeight: '700', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-bd)', borderRadius: '999px', padding: '2px 8px' }}>NEW</span>}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text2)' }}>{tool.desc}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Input card */}
          <ScrollReveal duration={400} delay={100}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
              <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Target</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input className="input" type="text" value={target}
                  onChange={e => setTarget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && handleScan()}
                  placeholder={tool.placeholder || 'Enter target (e.g. example.com)'}
                  style={{ flex: '1', minWidth: '200px' }}
                  autoFocus
                />

                {/* Extra fields */}
                {tool.fields?.map(f => (
                  f.type === 'select' ? (
                    <select key={f.name} className="input" style={{ width: 'auto', minWidth: '150px' }}
                      value={extraParams[f.name] || f.default || ''}
                      onChange={e => setExtraParams(p => ({ ...p, [f.name]: e.target.value }))}>
                      {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input key={f.name} className="input" type="text" placeholder={f.placeholder}
                      style={{ width: '160px' }}
                      value={extraParams[f.name] || ''}
                      onChange={e => setExtraParams(p => ({ ...p, [f.name]: e.target.value }))} />
                  )
                ))}

                <button className="btn btn-primary" onClick={handleScan} disabled={loading}
                  style={{ background: loading ? 'var(--bg3)' : tool.color, border: 'none', minWidth: '90px' }}>
                  {loading
                    ? <><svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Scanning...</>
                    : 'Scan'
                  }
                </button>
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginTop: '12px' }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
                  {error}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '8px' }} />)}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <ScrollReveal duration={400}>
              <div style={{ background: 'var(--bg2)', border: `1px solid ${tool.color}30`, borderRadius: '10px', overflow: 'hidden' }}>

                {/* Result header */}
                <div style={{ background: 'var(--bg3)', padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: result.status === 'success' ? 'var(--green)' : 'var(--red)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
                      {result.status === 'success' ? 'Scan Complete' : 'Scan Failed'}
                    </span>
                    {result.target && (
                      <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>{result.target}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {result.risk_level && <RiskBadge level={result.risk_level} />}
                    {elapsed && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{elapsed}s</span>}
                  </div>
                </div>

                {/* Result body */}
                <div style={{ padding: '18px' }}>
                  <ResultRenderer tool={tool} result={result} />
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

// ── Smart result renderer ──────────────────────────────────────────────────────
function ResultRenderer({ tool, result }) {
  if (result.status === 'error') return <div className="alert alert-error">{result.message || 'Scan failed'}</div>
  if (tool.id === 'portscan')  return <PortscanResult result={result} />
  if (tool.id === 'subdomain') return <SubdomainResult result={result} />
  if (tool.id === 'whois')     return <WhoisResult result={result} />
  if (tool.id === 'headers')   return <HeadersResult result={result} />
  if (tool.id === 'waf')       return <WafResult result={result} />
  if (tool.id === 'ssl')       return <SslResult result={result} />
  if (tool.id === 'nuclei')    return <NucleiResult result={result} />
  if (tool.id === 'sqli')      return <SqliResult result={result} />
  if (tool.id === 'xss')       return <XssResult result={result} />
  if (tool.id === 'wpscan')    return <WpscanResult result={result} />
  if (tool.id === 'gobuster')  return <GobusterResult result={result} />
  if (tool.id === 'hydra')     return <HydraResult result={result} />
  if (tool.id === 'dork')      return <DorkResult result={result} />
  if (tool.id === 'cors')      return <CorsResult result={result} />
  if (tool.id === 'takeover')  return <TakeoverResult result={result} />
  if (tool.id === 'jwt')       return <JwtResult result={result} />
  if (tool.id === 'robots')    return <RobotsResult result={result} />
  if (tool.id === 'cookie')    return <CookieResult result={result} />
  if (tool.id === 'clickjacking') return <ClickjackingResult result={result} />
  if (tool.id === 'tech')      return <TechResult result={result} />
  if (tool.id === 'dns_brute') return <DnsBruteResult result={result} />
  if (tool.id === 'vhost')     return <VhostResult result={result} />
  if (tool.id === 'api_scan')  return <ApiScanResult result={result} />
  if (tool.id === 'drupal')    return <CmsResult result={result} name="Drupal" />
  if (tool.id === 'joomla')    return <CmsResult result={result} name="Joomla" />
  if (tool.id === 'harvester') return <HarvesterResult result={result} />
  if (tool.id === 'shodan')    return <ShodanResult result={result} />
  if (tool.id === 'reverse_ip') return <ReverseIpResult result={result} />
  return <JsonResult result={result} />
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function SummaryRow({ items }) {
  return (
    <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'14px'}}>
      {items.map((item,i) => (
        <div key={i} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'8px',padding:'10px 14px',minWidth:'80px'}}>
          <div style={{fontSize:'clamp(16px,3vw,20px)',fontWeight:'700',color:item.color||'var(--text)',marginBottom:'2px'}}>{item.value}</div>
          <div style={{fontSize:'11px',color:'var(--text2)',fontWeight:'500'}}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}
function EmptyState({ icon, text }) {
  return <div style={{textAlign:'center',padding:'28px 20px'}}><div style={{fontSize:'28px',marginBottom:'8px'}}>{icon}</div><p style={{fontSize:'14px',color:'var(--text2)'}}>{text}</p></div>
}
function RiskBadge({ level }) {
  const c = level==='CRITICAL'?'var(--red)':level==='HIGH'?'#F97316':level==='MEDIUM'?'var(--orange)':level==='LOW'?'var(--green)':'var(--text2)'
  const b = level==='CRITICAL'?'var(--red-dim)':level==='HIGH'?'rgba(249,115,22,0.1)':level==='MEDIUM'?'rgba(245,158,11,0.1)':level==='LOW'?'var(--green-dim)':'var(--bg3)'
  return <span style={{fontSize:'11px',fontWeight:'600',padding:'2px 10px',borderRadius:'4px',background:b,color:c,border:`1px solid ${c}40`,flexShrink:0}}>{level}</span>
}

// ── XSS ───────────────────────────────────────────────────────────────────────
function XssResult({ result }) {
  const findings = result.findings || []
  const headers  = result.security_headers || {}
  return (
    <div>
      <SummaryRow items={[
        { label: 'Payloads Tested', value: result.payloads_tested || 0 },
        { label: 'Forms Found', value: result.forms_found || 0 },
        { label: 'Vulnerabilities', value: findings.length, color: findings.length > 0 ? 'var(--red)' : 'var(--green)' },
      ]} />
      {findings.length === 0
        ? <div className="alert alert-success" style={{marginBottom:'14px'}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{flexShrink:0}}><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/></svg>
            No XSS vulnerabilities found with the tested payloads.
          </div>
        : <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'14px'}}>
            {findings.map((f,i) => (
              <div key={i} style={{background:'var(--red-dim)',border:'1px solid var(--red-bd)',borderRadius:'8px',padding:'12px 14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px',flexWrap:'wrap',gap:'6px'}}>
                  <span style={{fontSize:'13px',fontWeight:'600',color:'var(--red)'}}>{f.type}</span>
                  <RiskBadge level={f.severity}/>
                </div>
                <div style={{fontSize:'12px',color:'var(--text2)',marginBottom:'6px'}}>Location: <span style={{color:'var(--text)',fontWeight:'500'}}>{f.location}</span></div>
                <div style={{background:'var(--bg)',borderRadius:'5px',padding:'6px 10px',fontFamily:'JetBrains Mono,monospace',fontSize:'11px',color:'var(--orange)',wordBreak:'break-all'}}>{f.payload}</div>
              </div>
            ))}
          </div>
      }
      {Object.keys(headers).length > 0 && (
        <div>
          <p style={{fontSize:'12px',fontWeight:'600',color:'var(--text2)',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Security Headers</p>
          <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
            {Object.entries(headers).map(([k,v],i) => {
              const missing = v.includes('Missing')
              return (
                <div key={i} style={{display:'flex',justifyContent:'space-between',background:missing?'var(--red-dim)':'var(--green-dim)',border:`1px solid ${missing?'var(--red-bd)':'var(--green-bd)'}`,borderRadius:'6px',padding:'8px 12px',gap:'10px',flexWrap:'wrap'}}>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'12px',color:missing?'var(--red)':'var(--green)'}}>{k}</span>
                  <span style={{fontSize:'12px',color:missing?'var(--red)':'var(--text2)'}}>{v}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── WAF ───────────────────────────────────────────────────────────────────────
function WafResult({ result }) {
  const detected = result.waf_detected||result.detected
  const wafName  = result.waf_name||result.waf||(detected?'WAF Detected':'None')
  return <div><div style={{display:'flex',alignItems:'center',gap:'14px',background:detected?'rgba(245,158,11,0.1)':'var(--green-dim)',border:`1px solid ${detected?'rgba(245,158,11,0.3)':'var(--green-bd)'}`,borderRadius:'10px',padding:'16px 20px'}}><div style={{fontSize:'28px'}}>{detected?'🛡️':'✅'}</div><div><div style={{fontSize:'15px',fontWeight:'700',color:detected?'var(--orange)':'var(--green)',marginBottom:'2px'}}>{detected?`WAF: ${wafName}`:'No WAF Detected'}</div><div style={{fontSize:'13px',color:'var(--text2)'}}>{detected?'Target is protected by a Web Application Firewall.':'No WAF or CDN protection detected.'}</div></div></div></div>
}

// ── SSL ───────────────────────────────────────────────────────────────────────
function SslResult({ result }) {
  const cert = result.certificate||result.cert||{}
  return <div><div style={{display:'flex',flexDirection:'column',gap:'5px'}}>{Object.entries(cert).filter(([,v])=>v).map(([k,v],i) => <div key={i} style={{display:'flex',gap:'10px',background:'var(--bg3)',borderRadius:'6px',padding:'8px 12px',flexWrap:'wrap'}}><span style={{fontSize:'12px',fontWeight:'600',color:'var(--text2)',minWidth:'130px',flexShrink:0,textTransform:'capitalize'}}>{k.replace(/_/g,' ')}</span><span style={{fontSize:'12px',color:'var(--text)',fontFamily:'JetBrains Mono,monospace',wordBreak:'break-all'}}>{String(v).slice(0,200)}</span></div>)}</div>{!Object.keys(cert).length&&<JsonResult result={result}/>}</div>
}

// ── SQLi ──────────────────────────────────────────────────────────────────────
function SqliResult({ result }) {
  const v = result.vulnerable
  return <div><div style={{display:'flex',alignItems:'center',gap:'14px',background:v?'var(--red-dim)':'var(--green-dim)',border:`1px solid ${v?'var(--red-bd)':'var(--green-bd)'}`,borderRadius:'10px',padding:'16px 20px'}}><div style={{fontSize:'28px'}}>{v?'💉':'✅'}</div><div><div style={{fontSize:'15px',fontWeight:'700',color:v?'var(--red)':'var(--green)'}}>{v?'SQL Injection Detected!':'No SQL Injection Found'}</div></div></div></div>
}

// ── WPScan ────────────────────────────────────────────────────────────────────
function WpscanResult({ result }) {
  const vulns=result.vulnerabilities||[]; const plugins=result.plugins||[]; const version=result.wordpress_version||result.version
  return <div><SummaryRow items={[{label:'WP Version',value:version||'Unknown'},{label:'Vulnerabilities',value:vulns.length,color:vulns.length>0?'var(--red)':'var(--green)'},{label:'Plugins',value:plugins.length}]}/>{!vulns.length&&<div className="alert alert-success" style={{marginBottom:'14px'}}>No WordPress vulnerabilities found.</div>}{vulns.length>0&&<div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'14px'}}>{vulns.map((v,i) => <div key={i} style={{background:'var(--red-dim)',border:'1px solid var(--red-bd)',borderRadius:'8px',padding:'12px 14px'}}><div style={{fontSize:'13px',fontWeight:'600',color:'var(--red)'}}>{v.title||v.name}</div></div>)}</div>}</div>
}

// ── Hydra ─────────────────────────────────────────────────────────────────────
function HydraResult({ result }) {
  const cracked=result.cracked||result.found||[]; const v=cracked.length>0
  return <div><div style={{display:'flex',alignItems:'center',gap:'14px',background:v?'var(--red-dim)':'var(--green-dim)',border:`1px solid ${v?'var(--red-bd)':'var(--green-bd)'}`,borderRadius:'10px',padding:'16px 20px',marginBottom:'14px'}}><div style={{fontSize:'28px'}}>{v?'🔓':'🔒'}</div><div><div style={{fontSize:'15px',fontWeight:'700',color:v?'var(--red)':'var(--green)',marginBottom:'2px'}}>{v?`${cracked.length} credential(s) cracked!`:'No credentials cracked'}</div><div style={{fontSize:'13px',color:'var(--text2)'}}>{result.attempts_made||0} combinations tested</div></div></div>{cracked.map((c,i) => <div key={i} style={{background:'var(--red-dim)',border:'1px solid var(--red-bd)',borderRadius:'8px',padding:'12px 14px',marginBottom:'8px'}}><div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'13px',color:'var(--red)'}}>user: <strong>{c.username||c.login}</strong> · pass: <strong>{c.password}</strong></div></div>)}</div>
}

// ── Takeover ──────────────────────────────────────────────────────────────────
function TakeoverResult({ result }) {
  const vulns=result.vulnerable||[]
  return <div><SummaryRow items={[{label:'Subdomains Checked',value:result.subdomains_checked||0},{label:'Vulnerable',value:vulns.length,color:vulns.length>0?'var(--red)':'var(--green)'}]}/>{vulns.length===0?<div className="alert alert-success">No subdomain takeover vulnerabilities found.</div>:<div style={{display:'flex',flexDirection:'column',gap:'8px'}}>{vulns.map((v,i) => <div key={i} style={{background:'var(--red-dim)',border:'1px solid var(--red-bd)',borderRadius:'8px',padding:'12px 14px'}}><div style={{fontSize:'13px',fontWeight:'600',color:'var(--red)',marginBottom:'6px'}}>{v.subdomain}</div><div style={{fontSize:'12px',color:'var(--text2)'}}>Service: <span style={{color:'var(--orange)'}}>{v.service}</span></div></div>)}</div>}</div>
}

// ── Whois ─────────────────────────────────────────────────────────────────────
function WhoisResult({ result }) {
  const data=result.data||result
  const fields=[{label:'Domain',key:'domain_name'},{label:'Registrar',key:'registrar'},{label:'Created',key:'creation_date'},{label:'Expires',key:'expiration_date'},{label:'Name Servers',key:'name_servers'},{label:'Status',key:'status'},{label:'Country',key:'country'}]
  return <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>{fields.map(({label,key}) => { const val=data[key]; if(!val) return null; const display=Array.isArray(val)?val.slice(0,3).join(', '):String(val).slice(0,120); return <div key={key} style={{display:'flex',gap:'12px',background:'var(--bg3)',borderRadius:'6px',padding:'9px 12px',flexWrap:'wrap'}}><span style={{fontSize:'12px',fontWeight:'600',color:'var(--text2)',minWidth:'110px',flexShrink:0}}>{label}</span><span style={{fontSize:'12px',color:'var(--text)',fontFamily:'JetBrains Mono,monospace',wordBreak:'break-all'}}>{display}</span></div>})}</div>
}

function PortscanResult({ result }) {
  const ports = result.ports || []
  if (!ports.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No open ports found.</p>
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>{ports.length} open port{ports.length !== 1 ? 's' : ''} found</p>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: '400px' }}>
          <thead><tr><th>Port</th><th>Protocol</th><th>Service</th><th>Version</th><th>State</th></tr></thead>
          <tbody>
            {ports.map((p, i) => (
              <tr key={i}>
                <td><span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--blue)', fontWeight: '600' }}>{p.port}</span></td>
                <td style={{ color: 'var(--text2)' }}>{p.protocol || 'tcp'}</td>
                <td style={{ color: 'var(--text)' }}>{p.service || '—'}</td>
                <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{p.version || '—'}</td>
                <td><span style={{ color: 'var(--green)', fontSize: '12px', fontWeight: '600' }}>{p.state || 'open'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SubdomainResult({ result }) {
  const subs = result.subdomains || []
  if (!subs.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No subdomains found.</p>
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>{subs.length} subdomain{subs.length !== 1 ? 's' : ''} found</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
        {subs.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg3)', borderRadius: '6px', padding: '7px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)' }}>{s}</div>
        ))}
      </div>
    </div>
  )
}

function DorkResult({ result }) {
  const links = result.google_links || []
  return (
    <div>
      <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg>
        Click any link to search Google. Results depend on indexing.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map((l, i) => (
          <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)' }}>{l.dork}</span>
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ flexShrink: 0 }}>
              Search →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

function CorsResult({ result }) {
  const rows = result.results || []
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>
        Tested {result.total_tested || rows.length} origins
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ background: 'var(--bg3)', border: `1px solid ${r.vulnerable ? 'var(--red-bd)' : 'var(--border)'}`, borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)' }}>{r.origin_tested}</span>
              {r.vulnerable && <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--red)', background: 'var(--red-dim)', padding: '2px 8px', borderRadius: '4px' }}>{r.severity}</span>}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
              ACAO: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: r.vulnerable ? 'var(--red)' : 'var(--green)' }}>{r.acao_header}</span>
              {' · '}ACAC: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.acac_header}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function JwtResult({ result }) {
  const findings = result.findings || []
  if (!findings.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No JWT tokens found on this page.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {findings.map((f, i) => (
        <div key={i} style={{ background: 'var(--bg3)', border: `1px solid ${f.severity === 'CRITICAL' ? 'var(--red-bd)' : 'var(--border)'}`, borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text2)' }}>{f.token_preview}</span>
            <RiskBadge level={f.severity} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px' }}>
            Algorithm: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)', fontWeight: '600' }}>{f.algorithm}</span>
          </div>
          {f.issues?.map((issue, j) => (
            <div key={j} style={{ fontSize: '12px', color: issue.severity === 'CRITICAL' ? 'var(--red)' : issue.severity === 'MEDIUM' ? 'var(--orange)' : 'var(--text2)', marginBottom: '4px' }}>
              ⚠ {issue.issue}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function HeadersResult({ result }) {
  const headers = result.headers || {}
  const missing = result.missing_headers || []
  return (
    <div>
      {missing.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--red)', marginBottom: '8px' }}>{missing.length} missing security headers</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {missing.map((h, i) => <span key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', background: 'var(--red-dim)', color: 'var(--red)', padding: '3px 8px', borderRadius: '4px' }}>{h}</span>)}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(headers).map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', background: 'var(--bg3)', borderRadius: '6px', padding: '8px 12px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--blue)', minWidth: '200px', flexShrink: 0 }}>{k}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text2)', wordBreak: 'break-all' }}>{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NucleiResult({ result }) {
  const findings = result.findings || result.vulnerabilities || []
  if (!findings.length) return <p style={{ color: 'var(--green)', fontSize: '14px' }}>✓ No CVEs found for the selected severity.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {findings.map((f, i) => (
        <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{f.name || f.template_id}</span>
            <RiskBadge level={(f.severity || 'info').toUpperCase()} />
          </div>
          {f.description && <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px', lineHeight: 1.5 }}>{f.description}</p>}
          {f.matched_at && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text3)' }}>{f.matched_at}</p>}
        </div>
      ))}
    </div>
  )
}

function GobusterResult({ result }) {
  const paths = result.paths || result.found || []
  if (!paths.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No paths found.</p>
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>{paths.length} path{paths.length !== 1 ? 's' : ''} discovered</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
        {paths.map((p, i) => (
          <div key={i} style={{ background: 'var(--bg3)', borderRadius: '6px', padding: '7px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--green)' }}>
            {typeof p === 'string' ? p : p.path || p.url}
          </div>
        ))}
      </div>
    </div>
  )
}

function JsonResult({ result }) {
  return (
    <pre style={{ color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '500px', overflowY: 'auto', margin: 0 }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}

// ── New Tools ─────────────────────────────────────────────────────────────────
function TechResult({ result }) {
  const techs = result.technologies || {}
  const keys = Object.keys(techs)
  if (!keys.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No technologies detected.</p>
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>{result.total_categories || keys.length} categories detected</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {keys.map((cat, i) => (
          <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{cat}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {techs[cat].map((t, j) => (
                <span key={j} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '4px' }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RobotsResult({ result }) {
  const disallowed = result.disallowed_count || 0
  const sensitive = result.sensitive_paths_found || []
  if (!result.found) return <div className="alert alert-warning">No robots.txt found on target.</div>
  return (
    <div>
      <SummaryRow items={[
        { label: 'Disallowed Paths', value: disallowed },
        { label: 'Sensitive Paths', value: sensitive.length, color: sensitive.length > 0 ? 'var(--red)' : 'var(--green)' }
      ]} />
      {sensitive.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--red)', marginBottom: '4px' }}>Sensitive Paths Exposed:</p>
          {sensitive.map((p, i) => <div key={i} style={{ background: 'var(--red-dim)', border: '1px solid var(--red-bd)', color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', padding: '8px 12px', borderRadius: '6px' }}>{p}</div>)}
        </div>
      )}
      {result.raw_content && (
        <>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)', marginBottom: '8px' }}>Raw Content Preview:</p>
          <pre style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)' }}>
            {result.raw_content}
          </pre>
        </>
      )}
    </div>
  )
}

function CookieResult({ result }) {
  const details = result.details || []
  if (details.length === 0) return <div className="alert alert-success">No cookies found.</div>
  return (
    <div>
      <SummaryRow items={[
        { label: 'Total Cookies', value: result.total_cookies || 0 },
        { label: 'Vulnerable', value: result.vulnerable_cookies || 0, color: result.vulnerable_cookies > 0 ? 'var(--orange)' : 'var(--green)' }
      ]} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {details.map((c, i) => (
          <div key={i} style={{ background: 'var(--bg3)', border: `1px solid ${c.issues?.length > 0 ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`, borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '600' }}>{c.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{c.domain}</span>
            </div>
            {c.issues?.length === 0 ? <span style={{ fontSize: '12px', color: 'var(--green)' }}>✓ Secure configuration</span> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {c.issues.map((iss, j) => <span key={j} style={{ fontSize: '12px', color: 'var(--orange)' }}>⚠ {iss}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ClickjackingResult({ result }) {
  const v = result.is_vulnerable
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: v ? 'var(--red-dim)' : 'var(--green-dim)', border: `1px solid ${v ? 'var(--red-bd)' : 'var(--green-bd)'}`, borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '28px' }}>{v ? '🎯' : '🛡️'}</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: v ? 'var(--red)' : 'var(--green)', marginBottom: '2px' }}>{v ? 'Vulnerable to Clickjacking!' : 'Protected against Clickjacking'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{v ? 'Missing X-Frame-Options or CSP frame-ancestors headers.' : 'Security headers correctly block framing.'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg3)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '6px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>X-Frame-Options</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: result.x_frame_options === 'Missing' ? 'var(--red)' : 'var(--green)' }}>{result.x_frame_options}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg3)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '6px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Content-Security-Policy</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: result.csp === 'Missing' ? 'var(--red)' : 'var(--green)', wordBreak: 'break-all' }}>{result.csp}</span>
        </div>
      </div>
    </div>
  )
}

function DnsBruteResult({ result }) {
  const subs = result.subdomains || []
  if (!subs.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No subdomains found via brute force.</p>
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>{subs.length} subdomains discovered</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
        {subs.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg3)', borderRadius: '6px', padding: '7px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--blue)' }}>{s}</div>
        ))}
      </div>
    </div>
  )
}

function VhostResult({ result }) {
  const vhosts = result.vhosts || []
  if (!vhosts.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No virtual hosts found.</p>
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>{vhosts.length} virtual hosts discovered</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
        {vhosts.map((v, i) => (
          <div key={i} style={{ background: 'var(--bg3)', borderRadius: '6px', padding: '7px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--purple)' }}>{v}</div>
        ))}
      </div>
    </div>
  )
}

function ReverseIpResult({ result }) {
  const domains = result.domains || []
  if (!domains.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No other domains hosted on this IP.</p>
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>{domains.length} domains hosted on the same server</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
        {domains.map((d, i) => (
          <div key={i} style={{ background: 'var(--bg3)', borderRadius: '6px', padding: '7px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)' }}>{d}</div>
        ))}
      </div>
    </div>
  )
}

function ApiScanResult({ result }) {
  const eps = result.endpoints || []
  if (!eps.length) return <p style={{ color: 'var(--text2)', fontSize: '14px' }}>No common API endpoints found.</p>
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>{eps.length} API endpoints exposed</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {eps.map((ep, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', borderRadius: '6px', padding: '10px 14px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--purple)' }}>{ep.endpoint}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: ep.status_code === 200 ? 'var(--green)' : 'var(--orange)' }}>HTTP {ep.status_code}</span>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{ep.length} bytes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CmsResult({ result, name }) {
  const detected = result.detected
  const version = result.version || 'Unknown'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: detected ? 'rgba(245,158,11,0.1)' : 'var(--green-dim)', border: `1px solid ${detected ? 'rgba(245,158,11,0.3)' : 'var(--green-bd)'}`, borderRadius: '10px', padding: '16px 20px' }}>
      <div style={{ fontSize: '28px' }}>{detected ? '📦' : '✅'}</div>
      <div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: detected ? 'var(--orange)' : 'var(--green)', marginBottom: '2px' }}>{detected ? `${name} Detected!` : `${name} Not Detected`}</div>
        {detected && <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Version: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{version}</span></div>}
      </div>
    </div>
  )
}

function HarvesterResult({ result }) {
  const emails = result.emails || []
  const hosts = result.hosts || []
  return (
    <div>
      <SummaryRow items={[
        { label: 'Emails Found', value: emails.length, color: emails.length > 0 ? 'var(--orange)' : 'var(--green)' },
        { label: 'Hosts Found', value: hosts.length }
      ]} />
      {emails.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)', marginBottom: '8px' }}>Discovered Emails</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {emails.map((e, i) => <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: 'var(--orange)' }}>{e}</div>)}
          </div>
        </div>
      )}
      {hosts.length > 0 && (
        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)', marginBottom: '8px' }}>Discovered Hosts</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {hosts.map((h, i) => <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: 'var(--text)' }}>{h}</div>)}
          </div>
        </div>
      )}
    </div>
  )
}

function ShodanResult({ result }) {
  const ports = result.ports || []
  const vulns = result.vulns || []
  return (
    <div>
      <SummaryRow items={[
        { label: 'IP Address', value: result.ip || 'Unknown' },
        { label: 'Organization', value: result.org || 'Unknown' },
        { label: 'OS', value: result.os || 'Unknown' }
      ]} />
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)', marginBottom: '8px' }}>Open Ports ({ports.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ports.map((p, i) => <span key={i} style={{ background: 'var(--blue)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' }}>{p}</span>)}
            {!ports.length && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>None</span>}
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)', marginBottom: '8px' }}>Vulnerabilities ({vulns.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {vulns.map((v, i) => <span key={i} style={{ background: 'var(--red)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' }}>{v}</span>)}
            {!vulns.length && <span style={{ fontSize: '12px', color: 'var(--green)' }}>✓ No known CVEs via Shodan</span>}
          </div>
        </div>
      </div>
    </div>
  )
}