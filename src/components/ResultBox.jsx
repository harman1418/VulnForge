export default function ResultBox({ data, loading }) {
  if (loading) return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>
        <svg style={{ animation: 'spin 0.8s linear infinite' }} width="18" height="18" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/>
          <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Scanning target... please wait
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Scan Results</span>
        <span style={{ fontSize: '12px', fontWeight: '500', color: data.status === 'success' ? 'var(--green)' : 'var(--red)' }}>
          ● {data.status?.toUpperCase()}
        </span>
      </div>
      <pre style={{ color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '500px', overflowY: 'auto', margin: 0 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
