import { useEffect, useRef, useState } from 'react'

/**
 * ScrollReveal - animates children when they enter the viewport
 * 
 * Props:
 *   delay     - delay in ms (default: 0)
 *   duration  - animation duration in ms (default: 500)
 *   direction - 'up' | 'down' | 'left' | 'right' | 'none' (default: 'up')
 *   distance  - translate distance in px (default: 20)
 *   threshold - intersection threshold 0-1 (default: 0.1)
 *   className - extra CSS classes
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 500,
  direction = 'up',
  distance = 20,
  threshold = 0.1,
  className = '',
  style = {},
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold])

  const getTransform = () => {
    if (visible) return 'translate(0, 0)'
    switch (direction) {
      case 'up':    return `translateY(${distance}px)`
      case 'down':  return `translateY(-${distance}px)`
      case 'left':  return `translateX(${distance}px)`
      case 'right': return `translateX(-${distance}px)`
      default:      return 'none'
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
