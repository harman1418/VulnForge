import { useEffect, useRef } from 'react'

export default function TerminalTyping({ lines, charDelay = 38, lineDelay = 380 }) {
  const ref = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    const container = ref.current
    if (!container) return
    container.innerHTML = ''
    timers.current.forEach(clearTimeout)
    timers.current = []

    let globalDelay = 0

    lines.forEach((line, li) => {
      const lineEl = document.createElement('div')
      lineEl.style.cssText = 'min-height:1.8em; font-family: Share Tech Mono, monospace; font-size:14px;'

      const promptEl = document.createElement('span')
      promptEl.textContent = line.prompt + ' '
      promptEl.style.color = '#00c966'

      const textEl = document.createElement('span')
      const cursorEl = document.createElement('span')
      cursorEl.textContent = '_'
      cursorEl.style.cssText = 'color:#00c966; animation: blink 1s step-end infinite;'

      lineEl.append(promptEl, textEl, cursorEl)
      container.appendChild(lineEl)

      line.text.split('').forEach((ch, ci) => {
        const t = setTimeout(() => { textEl.textContent += ch }, globalDelay + ci * charDelay)
        timers.current.push(t)
      })

      const doneDelay = globalDelay + line.text.length * charDelay
      if (li < lines.length - 1) {
        const t2 = setTimeout(() => cursorEl.remove(), doneDelay + 200)
        timers.current.push(t2)
      }
      globalDelay = doneDelay + lineDelay
    })

    return () => timers.current.forEach(clearTimeout)
  }, [lines, charDelay, lineDelay])

  return <div ref={ref} />
}