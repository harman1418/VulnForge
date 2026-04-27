import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import ScanInput from '../../components/ScanInput'
import ResultBox from '../../components/ResultBox'
import API from '../../utils/api'

export default function SqliScanner() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleScan = async (target) => {
    if (!target) return
    setLoading(true)
    setResult(null)
    try {
      const res = await API.get(`/api/sqli/?target=${target}`)
      setResult(res.data)
    } catch (err) {
      setResult({ status: 'error', message: err.message })
    }
    setLoading(false)
  }

  return (
    <ToolLayout title="SQLI SCANNER" description="Detect SQL injection vulnerabilities using SQLMap" icon="💉">
      <ScanInput onScan={handleScan} loading={loading} placeholder="Enter URL with params (e.g. http://example.com/page?id=1)" />
      <ResultBox data={result} loading={loading} />
    </ToolLayout>
  )
}