import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import ScanInput from '../../components/ScanInput'
import ResultBox from '../../components/ResultBox'
import API from '../../utils/api'

export default function NucleiScanner() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [severity, setSeverity] = useState('critical,high')

  const handleScan = async (target) => {
    if (!target) return
    setLoading(true)
    setResult(null)
    try {
      const res = await API.get(`/api/nuclei/?target=${target}&severity=${severity}`)
      setResult(res.data)
    } catch (err) {
      setResult({ status: 'error', message: err.message })
    }
    setLoading(false)
  }

  return (
    <ToolLayout title="CVE SCANNER" description="Scan for 9000+ known CVEs using Nuclei templates" icon="☢️">
      <ScanInput
        onScan={handleScan}
        loading={loading}
        placeholder="Enter URL (e.g. https://example.com)"
        extraFields={
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value)}
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
            <option value="critical">Critical Only</option>
            <option value="critical,high">Critical + High</option>
            <option value="critical,high,medium">Critical + High + Medium</option>
            <option value="all">All Severities</option>
          </select>
        }
      />
      <ResultBox data={result} loading={loading} />
    </ToolLayout>
  )
}