import { useState, useEffect } from 'react'
import PageWrapper from '../components/PageWrapper'
import ScrollReveal from '../components/ScrollReveal'
import useScramble from '../hooks/useScramble'

const OPERATIONS = [
  { id: 'base64_encode', label: 'Base64 Encode', type: 'encode' },
  { id: 'base64_decode', label: 'Base64 Decode', type: 'decode' },
  { id: 'url_encode', label: 'URL Encode', type: 'encode' },
  { id: 'url_decode', label: 'URL Decode', type: 'decode' },
  { id: 'hex_encode', label: 'Hex Encode', type: 'encode' },
  { id: 'hex_decode', label: 'Hex Decode', type: 'decode' },
  { id: 'binary_encode', label: 'Binary Encode', type: 'encode' },
  { id: 'binary_decode', label: 'Binary Decode', type: 'decode' },
  { id: 'morse_encode', label: 'Morse Encode', type: 'encode' },
  { id: 'morse_decode', label: 'Morse Decode', type: 'decode' },
  { id: 'html_encode', label: 'HTML Encode', type: 'encode' },
  { id: 'html_decode', label: 'HTML Decode', type: 'decode' },
  { id: 'rot13', label: 'ROT13', type: 'encode' },
  { id: 'rot47', label: 'ROT47', type: 'encode' },
  { id: 'reverse', label: 'Reverse String', type: 'encode' },
  { id: 'sha1', label: 'SHA-1 Hash', type: 'hash' },
  { id: 'sha256', label: 'SHA-256 Hash', type: 'hash' },
  { id: 'sha384', label: 'SHA-384 Hash', type: 'hash' },
  { id: 'sha512', label: 'SHA-512 Hash', type: 'hash' },
]

const morseMap = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/'
}
const morseRev = Object.fromEntries(Object.entries(morseMap).map(([k,v]) => [v,k]))


export default function CryptoLab() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [operation, setOperation] = useState('base64_encode')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const { ref: scrambleRef, trigger: triggerScramble } = useScramble('Crypto Lab')

  useEffect(() => {
    async function processText() {
      setError('')
      if (!input.trim()) {
        setOutput('')
        return
      }

      try {
        let res = ''
        switch (operation) {
          case 'base64_encode':
            res = btoa(unescape(encodeURIComponent(input)))
            break
          case 'base64_decode':
            res = decodeURIComponent(escape(atob(input.trim())))
            break
          case 'url_encode':
            res = encodeURIComponent(input)
            break
          case 'url_decode':
            res = decodeURIComponent(input)
            break
          case 'hex_encode':
            res = Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join(' ')
            break
          case 'hex_decode':
            const hex = input.replace(/\s/g, '')
            if (hex.length % 2 !== 0) throw new Error("Invalid hex")
            const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
            res = new TextDecoder().decode(bytes)
            break
          case 'binary_encode':
            res = Array.from(new TextEncoder().encode(input)).map(b => b.toString(2).padStart(8, '0')).join(' ')
            break
          case 'binary_decode':
            const bin = input.replace(/\s/g, '')
            if (bin.length % 8 !== 0) throw new Error("Invalid binary")
            const binBytes = new Uint8Array(bin.match(/.{1,8}/g).map(byte => parseInt(byte, 2)))
            res = new TextDecoder().decode(binBytes)
            break
          case 'morse_encode':
            res = input.toUpperCase().split('').map(c => morseMap[c] || c).join(' ')
            break
          case 'morse_decode':
            res = input.split(' ').map(c => morseRev[c] || c).join('')
            break
          case 'html_encode':
            res = input.replace(/[\u00A0-\u9999<>\&]/g, i => '&#'+i.charCodeAt(0)+';')
            break
          case 'html_decode':
            const textarea = document.createElement('textarea')
            textarea.innerHTML = input
            res = textarea.value
            break
          case 'rot13':
            res = input.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26))
            break
          case 'rot47':
            res = input.split('').map(c => {
              const j = c.charCodeAt(0)
              return (j >= 33 && j <= 126) ? String.fromCharCode(33 + ((j + 14) % 94)) : c
            }).join('')
            break
          case 'reverse':
            res = input.split('').reverse().join('')
            break
          case 'sha1':
          case 'sha256':
          case 'sha384':
          case 'sha512':
            const algoMap = { 'sha1': 'SHA-1', 'sha256': 'SHA-256', 'sha384': 'SHA-384', 'sha512': 'SHA-512' }
            const msgBuffer = new TextEncoder().encode(input)
            const hashBuffer = await crypto.subtle.digest(algoMap[operation], msgBuffer)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            res = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
            break
          default:
            res = input
        }
        setOutput(res)
      } catch (err) {
        setError('Invalid input or decoding failed for this format')
        setOutput('')
      }
    }
    
    // Add a small debounce for performance on huge inputs
    const timeout = setTimeout(() => {
      processText()
    }, 150)
    
    return () => clearTimeout(timeout)
  }, [input, operation])

  const copyToClipboard = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSwap = () => {
    if (output && !error) {
      setInput(output)
      
      // Auto-switch to decode if we were encoding, and vice versa
      const currentOp = OPERATIONS.find(o => o.id === operation)
      if (currentOp?.type === 'encode') {
        setOperation(operation.replace('encode', 'decode'))
      } else if (currentOp?.type === 'decode') {
        setOperation(operation.replace('decode', 'encode'))
      }
    }
  }

  const activeOpLabel = OPERATIONS.find(o => o.id === operation)?.label

  return (
    <PageWrapper title="Crypto Lab | VulnForge">
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px)' }}>
        
        <ScrollReveal>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--green-dim)', border: '1px solid var(--green-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M6 7.042V6.5a4 4 0 1 1 8 0v.542a2.5 2.5 0 0 1 1 2.292V13a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13V9.334a2.5 2.5 0 0 1 1-2.292M6 6.5v.5h4v-.5a2 2 0 1 0-4 0"/>
                </svg>
              </div>
              <div>
                <h1 
                  ref={scrambleRef} 
                  onMouseEnter={triggerScramble}
                  style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: 0, letterSpacing: '-0.5px', cursor: 'default' }}
                >
                  Crypto Lab
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--text2)', margin: '4px 0 0 0' }}>Encode, decode, and hash strings locally in your browser.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Operation Selector */}
          <ScrollReveal delay={100}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {OPERATIONS.map(op => {
                  const isActive = operation === op.id
                  const isHash = op.type === 'hash'
                  const color = isHash ? 'var(--blue)' : 'var(--green)'
                  const colorDim = isHash ? 'rgba(59, 130, 246, 0.1)' : 'var(--green-dim)'
                  const colorBd = isHash ? 'rgba(59, 130, 246, 0.3)' : 'var(--green-bd)'

                  return (
                    <button
                      key={op.id}
                      onClick={() => setOperation(op.id)}
                      style={{
                        background: isActive ? colorDim : 'var(--bg3)',
                        border: `1px solid ${isActive ? colorBd : 'var(--border)'}`,
                        color: isActive ? color : 'var(--text2)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: isActive ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.color = 'var(--text)'
                          e.currentTarget.style.borderColor = 'var(--text3)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.color = 'var(--text2)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                        }
                      }}
                    >
                      {op.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* I/O Areas Grid */}
          <ScrollReveal delay={200}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* INPUT */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Input</label>
                  <button 
                    onClick={() => setInput('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
                    Clear
                  </button>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your text here..."
                  spellCheck="false"
                  style={{
                    flex: 1,
                    minHeight: '300px',
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* ACTION BUTTON (Mobile visible, Desktop implicit) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                 <button 
                    onClick={handleSwap}
                    disabled={!output || error}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'var(--bg3)', 
                      border: '1px solid var(--border)',
                      color: (!output || error) ? 'var(--text3)' : 'var(--text)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: (!output || error) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: (!output || error) ? 0.5 : 1
                    }}
                    title="Swap Input & Output"
                    onMouseEnter={e => { if (output && !error) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' } }}
                    onMouseLeave={e => { if (output && !error) { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' } }}
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                  </button>
              </div>

              {/* OUTPUT */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                    Output <span style={{ color: 'var(--text3)', fontWeight: '400', fontSize: '12px', marginLeft: '6px' }}>({activeOpLabel})</span>
                  </label>
                  <button 
                    onClick={copyToClipboard}
                    disabled={!output || !!error}
                    style={{ background: 'transparent', border: 'none', color: copied ? 'var(--green)' : 'var(--text3)', fontSize: '12px', cursor: (!output || !!error) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
                    onMouseEnter={e => { if (!copied && output && !error) e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { if (!copied) e.currentTarget.style.color = 'var(--text3)' }}
                  >
                    {copied ? (
                      <><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg> Copied!</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/></svg> Copy</>
                    )}
                  </button>
                </div>
                
                <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <textarea
                    value={error || output}
                    readOnly
                    placeholder="Result will appear here..."
                    spellCheck="false"
                    style={{
                      flex: 1,
                      minHeight: '300px',
                      background: error ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg2)',
                      border: `1px solid ${error ? 'var(--red-dim)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      color: error ? 'var(--red)' : 'var(--text)',
                      fontSize: '14px',
                      fontFamily: 'JetBrains Mono, monospace',
                      lineHeight: '1.5',
                      resize: 'vertical',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  />
                  {/* Status Indicator */}
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                    {input && !error && output && (
                      <span style={{ fontSize: '11px', color: 'var(--green)', background: 'var(--bg2)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--green-dim)' }}>
                        Success • {output.length} chars
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </ScrollReveal>

        </div>
      </div>
    </PageWrapper>
  )
}
