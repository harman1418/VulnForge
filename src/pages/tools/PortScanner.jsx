import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import ScanInput from '../../components/ScanInput'
import ResultBox from '../../components/ResultBox'
import API from '../../utils/api'

export default function PortScanner() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanType, setScanType] = useState('basic')

  const handleScan = async (target) => {
    if (!target) return
    setLoading(true)
    setResult(null)
    try {
      const res = await API.get(`/api/portscan/?target=${target}&scan_type=${scanType}`)
      setResult(res.data)
    } catch (err) {
      setResult({ status: 'error', message: err.message })
    }
    setLoading(false)
  }

  return (
    <ToolLayout
      title="PORT SCANNER"
      description="Discover open ports and running services using Nmap"
      icon="🔍"
    >
      <ScanInput
        onScan={handleScan}
        loading={loading}
        placeholder="Enter target IP or domain (e.g. scanme.nmap.org)"
        extraFields={
          <select
            value={scanType}
            onChange={e => setScanType(e.target.value)}
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
            <option value="basic">Basic (Top 1000)</option>
            <option value="full">Full (All Ports)</option>
            <option value="service">Service Detection</option>
            <option value="udp">UDP Scan</option>
          </select>
        }
      />
      <ResultBox data={result} loading={loading} />
    </ToolLayout>
  )
}