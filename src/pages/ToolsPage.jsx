import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import HackerText from '../components/HackerText'
import ScrollReveal from '../components/ScrollReveal'
import { usePageTitle } from '../hooks/usePageTitle'
import { ALL_TOOLS, TOOL_CATEGORIES, getToolsByCategory, getFrequentlyUsed, TOOL_COUNT } from '../config/toolsConfig'

export default function ToolsPage() {
  usePageTitle('Tools')
  const [activeCategory, setActiveCategory] = useState('recon')

  const displayTools = activeCategory === 'frequent'
    ? getFrequentlyUsed()
    : getToolsByCategory(activeCategory)

  const activeLabel = activeCategory === 'frequent'
    ? 'Frequently Used'
    : TOOL_CATEGORIES.find(c => c.id === activeCategory)?.label || ''

  const sidebarItems = [
    { id: 'frequent', label: 'Frequently Used', count: getFrequentlyUsed().length, color: 'var(--green)' },
    ...TOOL_CATEGORIES.map(c => ({ id: c.id, label: c.label, count: getToolsByCategory(c.id).length, color: c.color })),
  ]

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(16px, 4vw, 28px) clamp(12px, 4vw, 24px)' }}>

        {/* Header */}
        <ScrollReveal duration={400} delay={50}>
          <div style={{ marginBottom: '20px' }}>
            <HackerText text="Security Tools" tag="h1"
              style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '700', color: 'var(--text)', marginBottom: '4px', display: 'block' }}
              delay={100} duration={700} />
            <p style={{ fontSize: '14px', color: 'var(--text2)' }}>
              {TOOL_COUNT} tools — click any to run a targeted scan
            </p>
          </div>
        </ScrollReveal>

        {/* Mobile: horizontal scrolling category tabs */}
        <ScrollReveal duration={400} delay={80}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', marginBottom: '16px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
            className="hide-scrollbar">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => setActiveCategory(item.id)}
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: activeCategory === item.id ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: `1px solid ${activeCategory === item.id ? item.color : 'var(--border)'}`,
                  background: activeCategory === item.id ? item.color + '15' : 'var(--bg2)',
                  color: activeCategory === item.id ? item.color : 'var(--text2)',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                }}>
                {item.label}
                <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>{item.count}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

          {/* Desktop sidebar — hidden on small screens via JS */}
          <DesktopSidebar
            items={sidebarItems}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {/* Tools grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ScrollReveal duration={300} delay={120}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{activeLabel}</h2>
                <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{displayTools.length} tools</span>
              </div>
            </ScrollReveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '10px' }}>
              {displayTools.map((tool, i) => (
                <ScrollReveal key={tool.id} delay={i * 35} duration={320} direction="up">
                  <ToolCard tool={tool} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* Hide scrollbar globally */}
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      </div>
    </PageWrapper>
  )
}

function DesktopSidebar({ items, activeCategory, onSelect }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)
  if (isMobile) return null
  return (
    <div style={{ width: '190px', flexShrink: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', position: 'sticky', top: '72px' }}>
      {items.map((item, i) => (
        <div key={item.id}>
          {i === 1 && <div style={{ height: '1px', background: 'var(--border)' }} />}
          <button onClick={() => onSelect(item.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: activeCategory === item.id ? item.color + '10' : 'transparent', borderLeft: `3px solid ${activeCategory === item.id ? item.color : 'transparent'}`, border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}
            onMouseEnter={e => { if (activeCategory !== item.id) e.currentTarget.style.background = 'var(--bg3)' }}
            onMouseLeave={e => { if (activeCategory !== item.id) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: '13px', fontWeight: activeCategory === item.id ? '600' : '500', color: activeCategory === item.id ? item.color : 'var(--text2)', flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: '999px' }}>{item.count}</span>
          </button>
        </div>
      ))}
    </div>
  )
}

function ToolCard({ tool }) {
  return (
    <Link to={tool.path} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: 'clamp(14px, 3vw, 18px)', cursor: 'pointer', transition: 'all 0.15s', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = tool.color + '60'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${tool.color}10` }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
      >
        {tool.isNew && (
          <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', fontWeight: '700', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-bd)', borderRadius: '999px', padding: '1px 7px' }}>NEW</span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: tool.color + '15', border: `1px solid ${tool.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill={tool.color}>
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg>
          </div>
          <span style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', fontWeight: '600', color: 'var(--text)' }}>{tool.name}</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.5', margin: 0 }}>{tool.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: tool.color }}>Run tool</span>
          <svg width="11" height="11" viewBox="0 0 16 16" fill={tool.color}>
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </div>
      </div>
    </Link>
  )
}
