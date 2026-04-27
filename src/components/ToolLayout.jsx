import Navbar from './Navbar'

export default function ToolLayout({ title, description, icon, children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: '60px' }}>
      <Navbar />

      {/* Tool Header */}
      <div style={{
        background: 'linear-gradient(135deg, #060d12 0%, #0a1520 100%)',
        borderBottom: '1px solid #0a2a1a',
        padding: '40px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <span style={{ fontSize: '36px' }}>{icon}</span>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              fontWeight: '700',
              color: '#00ff88',
              textShadow: '0 0 20px #00ff8844',
            }}>{title}</h1>
          </div>
          <p style={{ color: '#7a9a8a', fontSize: '15px', fontFamily: 'Share Tech Mono, monospace' }}>
            {description}
          </p>
        </div>
      </div>

      {/* Tool Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
        {children}
      </div>
    </div>
  )
}