import { useState } from 'react'

export default function ScanInput({ onScan, placeholder, loading, extraFields }) {
  const [target, setTarget] = useState('')

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder={placeholder || 'Enter target (e.g. example.com)'}
          onKeyDown={e => e.key === 'Enter' && onScan(target)}
          className="input"
          style={{ flex: 1, minWidth: '200px' }}
        />
        {extraFields}
        <button
          onClick={() => onScan(target)}
          disabled={loading || !target}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/>
                <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Scanning...
            </>
          ) : 'Scan'}
        </button>
      </div>
    </div>
  )
}
