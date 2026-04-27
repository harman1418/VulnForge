import { useScramble } from '../hooks/useScramble'

/**
 * HackerText - renders text with a scramble animation
 * 
 * Props:
 *   text        - the final text to display
 *   tag         - HTML tag to use (default: 'span')
 *   triggerOnMount - auto-scramble on load (default: true)
 *   delay       - delay in ms before scrambling (default: 0)
 *   duration    - scramble duration in ms (default: 800)
 *   className   - extra CSS classes
 *   style       - extra inline styles
 *   color       - text color (default: inherit)
 *   interactive - re-scramble on hover (default: true)
 */
export default function HackerText({
  text,
  tag = 'span',
  triggerOnMount = true,
  delay = 0,
  duration = 800,
  className = '',
  style = {},
  color,
  interactive = true,
}) {
  const { ref, trigger } = useScramble(text, { triggerOnMount, duration, delay })
  const Tag = tag

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        cursor: interactive ? 'pointer' : 'default',
        color: color || 'inherit',
        display: 'inline-block',
        ...style,
      }}
      onMouseEnter={interactive ? trigger : undefined}
    >
      {text}
    </Tag>
  )
}
