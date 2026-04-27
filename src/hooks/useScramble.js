// Scramble characters used for the hacker effect
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>[]{}|/\\'

/**
 * Scrambles text on a DOM element with a hacker-style animation
 * Returns a cancel function
 */
export function scrambleText(el, finalText, duration = 800) {
  if (!el) return () => {}
  
  let frame = 0
  let cancelled = false
  const totalFrames = Math.floor(duration / 30)

  const tick = () => {
    if (cancelled) return
    
    frame++
    const progress = frame / totalFrames
    
    let result = ''
    for (let i = 0; i < finalText.length; i++) {
      if (finalText[i] === ' ') {
        result += ' '
      } else if (i < Math.floor(progress * finalText.length)) {
        result += finalText[i]
      } else {
        result += CHARS[Math.floor(Math.random() * CHARS.length)]
      }
    }
    
    el.textContent = result
    
    if (frame < totalFrames) {
      requestAnimationFrame(tick)
    } else {
      el.textContent = finalText
    }
  }

  requestAnimationFrame(tick)
  return () => { cancelled = true; el.textContent = finalText }
}

/**
 * React hook for scramble effect
 */
import { useRef, useCallback, useEffect } from 'react'

export function useScramble(text, { triggerOnMount = true, duration = 800, delay = 0 } = {}) {
  const ref = useRef(null)
  const cancelRef = useRef(null)

  const trigger = useCallback(() => {
    if (!ref.current) return
    if (cancelRef.current) cancelRef.current()
    cancelRef.current = scrambleText(ref.current, text, duration)
  }, [text, duration])

  useEffect(() => {
    if (triggerOnMount) {
      const t = setTimeout(trigger, delay)
      return () => clearTimeout(t)
    }
  }, [trigger, triggerOnMount, delay])

  return { ref, trigger }
}

export default useScramble
