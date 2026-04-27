import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import ScanInput from '../../components/ScanInput'
import ResultBox from '../../components/ResultBox'
import API from '../../utils/api'

export default function GobusterScan() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [wordlist, setWordlist] = useState('common')

  const handleScan = async (target) => {
    if (!target) return
    setLoading(true)
    setResult(null)
    try {
      const res = await API.get(`/api/gobuster/?target=${target}&wordlist=${wordlist}`)
      setResult(res.data)
    } catch (err) {
      setResult({ status: 'error', message: err.message })
    }
    setLoading(false)
  }

  return (
    <ToolLayout title="URL FUZZER" description="Discover hidden files and directories using Gobuster" icon="📁">
      <ScanInput
        onScan={handleScan}
        loading={loading}
        placeholder="Enter URL (e.g. https://example.com)"
        extraFields={
          <select
            value={wordlist}
            onChange={e => setWordlist(e.target.value)}
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
            <option value="common">Common</option>
            <option value="big">Big</option>
          </select>
        }
      />
      <ResultBox data={result} loading={loading} />
    </ToolLayout>
  )
}