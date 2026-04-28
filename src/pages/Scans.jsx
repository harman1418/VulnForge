import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import API from '../utils/api'
import { usePageTitle } from '../hooks/usePageTitle'
import HackerText from '../components/HackerText'
import ScrollReveal from '../components/ScrollReveal'

export default function Scans() {
  usePageTitle('Scans')
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState([])
  const [bulkMode, setBulkMode] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [scanToDelete, setScanToDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchScans() }, [])

  const fetchScans = async () => {
    try {
      const res = await API.get('/api/history/')
      setScans(res.data.scans || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const getRiskColor = (risk) => {
    if (risk === 'CRITICAL') return 'var(--red)'
    if (risk === 'HIGH')     return '#F97316'
    if (risk === 'MEDIUM')   return 'var(--orange)'
    if (risk === 'LOW')      return 'var(--green)'
    return 'var(--text2)'
  }

  const getScanTypeColor = (type) => {
    if (type === 'deep')   return 'var(--red)'
    if (type === 'medium') return 'var(--orange)'
    return 'var(--green)'
  }

  const filters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const filtered = filter === 'ALL' ? scans : scans.filter(s => s.risk_level === filter)

  const toggleSelect  = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const selectAll     = () => setSelected(filtered.map(s => s.id))
  const unselectAll   = () => setSelected([])
  const isAllSelected = filtered.length > 0 && filtered.every(s => selected.includes(s.id))

  const requestDeleteScan = (id, e) => {
    e.stopPropagation()
    setScanToDelete(id)
  }

  const deleteScan = async () => {
    if (!scanToDelete) return
    setDeleting(true)
    try {
      await API.delete(`/api/history/${scanToDelete}`)
      setScans(prev => prev.filter(s => s.id !== scanToDelete))
      setSelected(prev => prev.filter(i => i !== scanToDelete))
      setScanToDelete(null)
    } catch (err) { console.error(err) }
    setDeleting(false)
  }

  const requestBulkDelete = () => {
    if (!selected.length) return
    setShowBulkConfirm(true)
  }

  const bulkDelete = async () => {
    if (!selected.length) return
    setDeleting(true)
    try {
      await API.delete('/api/history/bulk/delete', { data: { scan_ids: selected } })
      setScans(prev => prev.filter(s => !selected.includes(s.id)))
      setSelected([])
      setBulkMode(false)
      setShowBulkConfirm(false)
    } catch (err) { console.error(err) }
    setDeleting(false)
  }

  const clearAll = async () => {
    setDeleting(true)
    try {
      await API.delete('/api/history/clear/all')
      setScans([])
      setSelected([])
      setBulkMode(false)
      setShowClearConfirm(false)
    } catch (err) { console.error(err) }
    setDeleting(false)
  }

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px) clamp(12px, 4vw, 24px)' }}>

        {/* Header */}
        <ScrollReveal duration={500} delay={50}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <HackerText text="Scan History" tag="h1" style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '700', color: 'var(--text)', marginBottom: '4px', display: 'block' }} delay={100} duration={700} />
              <p style={{ fontSize: '14px', color: 'var(--text2)' }}>Click any scan to view full report</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button className={`btn btn-sm ${bulkMode ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => { setBulkMode(!bulkMode); setSelected([]) }}>
                {bulkMode ? 'Cancel' : 'Select'}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => setShowClearConfirm(true)}>Clear all</button>
            </div>
          </div>
        </ScrollReveal>

        {/* Clear All Confirm Modal */}
        {showClearConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--red)', borderRadius: '12px', padding: 'clamp(24px, 5vw, 36px)', maxWidth: '400px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.2s ease' }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--red-dim)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="var(--red)"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Clear all scans?</h3>
              <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '24px' }}>This will permanently delete all {scans.length} scans and cannot be undone.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-danger" onClick={clearAll} disabled={deleting}>{deleting ? 'Deleting...' : 'Yes, clear all'}</button>
                <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirm Modal */}
        {showBulkConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--red)', borderRadius: '12px', padding: 'clamp(24px, 5vw, 36px)', maxWidth: '400px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.2s ease' }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--red-dim)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="var(--red)"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Delete {selected.length} scans?</h3>
              <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '24px' }}>Are you sure you want to delete the selected scans? This cannot be undone.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-danger" onClick={bulkDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Yes, delete'}</button>
                <button className="btn btn-secondary" onClick={() => setShowBulkConfirm(false)} disabled={deleting}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Single Delete Confirm Modal */}
        {scanToDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--red)', borderRadius: '12px', padding: 'clamp(24px, 5vw, 36px)', maxWidth: '400px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.2s ease' }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--red-dim)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="var(--red)"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Delete scan?</h3>
              <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '24px' }}>Are you sure you want to delete this scan report? This cannot be undone.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-danger" onClick={deleteScan} disabled={deleting}>{deleting ? 'Deleting...' : 'Yes, delete'}</button>
                <button className="btn btn-secondary" onClick={() => setScanToDelete(null)} disabled={deleting}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Action Bar */}
        {bulkMode && (
          <ScrollReveal duration={300}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--orange)', borderRadius: '8px', padding: '10px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-secondary" onClick={isAllSelected ? unselectAll : selectAll}>
                {isAllSelected ? 'Unselect all' : 'Select all'}
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{selected.length} of {filtered.length} selected</span>
              {selected.length > 0 && (
                <button className="btn btn-sm btn-danger" onClick={requestBulkDelete} disabled={deleting} style={{ marginLeft: 'auto' }}>
                  {deleting ? 'Deleting...' : `Delete ${selected.length}`}
                </button>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Filters */}
        <ScrollReveal delay={100} duration={400}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', border: `1px solid ${filter === f ? getRiskColor(f === 'ALL' ? 'LOW' : f) : 'var(--border)'}`, background: filter === f ? getRiskColor(f === 'ALL' ? 'LOW' : f) + '15' : 'transparent', color: filter === f ? getRiskColor(f === 'ALL' ? 'LOW' : f) : 'var(--text2)', fontFamily: 'Inter, sans-serif' }}>
                {f}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text2)' }}>
              {filtered.length} scan{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </ScrollReveal>

        {/* Scans List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '8px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <ScrollReveal duration={500}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--bg3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="var(--text3)"><path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5M3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2.5 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2.5 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2.5 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2.5 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z"/></svg>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text2)' }}>No scans found. Run your first scan from Targets!</p>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={150} duration={500}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              {filtered.map((scan, i) => (
                <div key={scan.id}
                  onClick={() => !bulkMode && navigate(`/scans/${scan.id}`)}
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(12px, 2vw, 20px)', borderBottom: i < filtered.length - 1 ? '1px solid var(--border2)' : 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: bulkMode ? 'default' : 'pointer', transition: 'background 0.15s', background: selected.includes(scan.id) ? 'rgba(245,158,11,0.05)' : 'transparent' }}
                  onMouseEnter={e => { if (!bulkMode) e.currentTarget.style.background = 'var(--bg3)' }}
                  onMouseLeave={e => { if (!bulkMode) e.currentTarget.style.background = selected.includes(scan.id) ? 'rgba(245,158,11,0.05)' : 'transparent' }}
                >
                  {bulkMode && (
                    <div onClick={e => { e.stopPropagation(); toggleSelect(scan.id) }}
                      style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${selected.includes(scan.id) ? 'var(--orange)' : 'var(--border)'}`, background: selected.includes(scan.id) ? 'var(--orange)' : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {selected.includes(scan.id) && <svg width="10" height="10" viewBox="0 0 16 16" fill="white"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>}
                    </div>
                  )}
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getRiskColor(scan.risk_level), flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '500', color: 'var(--text)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.target}</div>
                    <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: 'var(--text2)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                      {scan.critical_findings_count > 0 && <span>· {scan.critical_findings_count} findings</span>}
                      {scan.scan_type && <span style={{ color: getScanTypeColor(scan.scan_type) }}>· {scan.scan_type}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${getRiskColor(scan.risk_level)}40`, background: getRiskColor(scan.risk_level) + '15', color: getRiskColor(scan.risk_level) }}>{scan.risk_level}</span>
                    <span style={{ fontSize: 'clamp(12px, 2vw, 13px)', fontWeight: '600', color: getRiskColor(scan.risk_level), minWidth: '38px', textAlign: 'right' }}>{scan.security_score}</span>
                    <button onClick={e => requestDeleteScan(scan.id, e)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                    </button>
                    {!bulkMode && <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--text3)"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </PageWrapper>
  )
}
