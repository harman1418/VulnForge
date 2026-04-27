import Navbar from './Navbar'
import Footer from './Footer'
import MatrixBackground from './MatrixBackground'

export default function PageWrapper({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background 0.2s',
      position: 'relative',
    }}>
      <MatrixBackground opacity={0.15} />
      <div style={{ position: 'relative', zIndex: 100 }}>
        <Navbar />
      </div>
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {children}
      </div>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Footer />
      </div>
    </div>
  )
}
