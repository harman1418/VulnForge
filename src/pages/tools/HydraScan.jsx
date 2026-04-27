import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import ScanInput from '../../components/ScanInput'
import ResultBox from '../../components/ResultBox'
import API from '../../utils/api'

export default function HydraScan() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [service, setService] = useState('ssh')
  const [username, setUsername] = useState('admin')

  const handleScan = async (target) => {
    if (!target) return
    setLoading(true)
    setResult(null)
    try {
      const res = await API.get(`/api/hydra/?target=${target}&service=${service}&username=${username}`)
      setResult(res.data)
    } catch (err) {
      setResult({ status: 'error', message: err.message })
    }
    setLoading(false)
  }

  return (
    <ToolLayout title="PASSWORD AUDITOR" description="Audit password strength using Hydra brute-forcer" icon="🔑">
      <ScanInput
        onScan={handleScan}
        loading={loading}
        placeholder="Enter target IP or domain"
        extraFields={
          <>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              style={{
                background: '#0a1520',
                border: '1px solid #0a2a1a',
                borderRadius: '4px',
                padding: '12px 16px',
                color: '#00ff88',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '14px',
                outline: 'none',
                width: '120px',
              }}
              onFocus={e => e.target.style.borderColor = '#00ff88'}
              onBlur={e => e.target.style.borderColor = '#0a2a1a'}
            />
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              style={{
                background: '#0a1520',
                border: '1px solid #0a2a1a',
                borderRadius: '4px',
                padding: '12px 16px',
                color: '#00ff88',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ssh">SSH</option>
              <option value="ftp">FTP</option>
              <option value="http-get">HTTP</option>
              <option value="smb">SMB</option>
              <option value="rdp">RDP</option>
            </select>
          </>
        }
      />
      <ResultBox data={result} loading={loading} />
    </ToolLayout>
  )
}