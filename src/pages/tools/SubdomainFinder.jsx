import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import ScanInput from '../../components/ScanInput'
import ResultBox from '../../components/ResultBox'
import API from '../../utils/api'

export default function SubdomainFinder() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleScan = async (target) => {
    if (!target) return
    setLoading(true)
    setResult(null)
    try {
      const res = await API.get(`/api/subdomain/?target=${target}`)
      setResult(res.data)
    } catch (err) {
      setResult({ status: 'error', message: err.message })
    }
    setLoading(false)
  }

  return (
    <ToolLayout title="SUBDOMAIN FINDER" description="Enumerate subdomains using Subfinder" icon="🌐">
      <ScanInput onScan={handleScan} loading={loading} placeholder="Enter domain (e.g. example.com)" />
      <ResultBox data={result} loading={loading} />
    </ToolLayout>
  )
}