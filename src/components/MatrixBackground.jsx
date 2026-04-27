import { useEffect, useRef } from 'react'

export default function MatrixBackground({ opacity = 0.25 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+'.split('')
    const fontSize = 14
    let columns = Math.ceil(W / fontSize)
    let drops = Array(columns).fill(1)

    const draw = () => {
      // Check theme dynamically inside the render loop for seamless toggling
      const isLight = document.documentElement.getAttribute('data-theme') === 'light'
      ctx.fillStyle = isLight ? 'rgba(246, 248, 250, 0.08)' : 'rgba(15, 17, 23, 0.08)'
      ctx.fillRect(0, 0, W, H)

      // Green text
      ctx.fillStyle = isLight ? '#059669' : '#10B981' 
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > H && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }
    
    const interval = setInterval(draw, 50)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        opacity: opacity,
        zIndex: 0,
      }}
    />
  )
}
