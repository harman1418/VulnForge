import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * PageTransition - wraps page content with a fade animation
 * on route change
 */
export default function PageTransition({ children }) {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState(location.pathname)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => {
      setKey(location.pathname)
      setVisible(true)
    }, 80)
    return () => clearTimeout(t)
  }, [location.pathname])

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div
      key={key}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {children}
    </div>
  )
}
