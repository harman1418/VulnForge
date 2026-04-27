import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import ScanInput from '../../components/ScanInput'
import ResultBox from '../../components/ResultBox'
import API from '../../utils/api'

export default function HeaderScan() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleScan = async (target) => {
    if (!target) return
    setLoading(true)
    setResult(null)
    try {
      const res = await API.get(`/api/headers/?target=${target}`)
      setResult(res.data)
    } catch (err) {
      setResult({ status: 'error', message: err.message })
    }
    setLoading(false)
  }

  return (
    <ToolLayout title="HEADER SCANNER" description="Fingerprint technologies and check security headers" icon="🔎">
      <ScanInput onScan={handleScan} loading={loading} placeholder="Enter URL (e.g. https://example.com)" />
      <ResultBox data={result} loading={loading} />
    </ToolLayout>
  )
}