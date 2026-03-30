import React from 'react'
import { TEST_TEMPLATES } from '../data'

const STATUS = {
  draft:       { label: 'Draft',     bg: 'var(--amber-light)',  color: 'var(--amber)',  dot: '#d97706' },
  'in-review': { label: 'In Review', bg: 'var(--accent-light)', color: 'var(--accent)', dot: '#1d4ed8' },
  complete:    { label: 'Complete',  bg: 'var(--green-light)',  color: 'var(--green)',  dot: '#16a34a' },
}

export default function Dashboard({ reports, onOpen, onCreate }) {
  const counts = {
    total:    reports.length,
    draft:    reports.filter(r => r.status === 'draft').length,
    review:   reports.filter(r => r.status === 'in-review').length,
    complete: reports.filter(r => r.status === 'complete').length,
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.25rem' }}>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Reports', val: counts.total,    color: 'var(--accent)' },
          { label: 'In Draft',      val: counts.draft,    color: 'var(--amber)' },
          { label: 'In Review',     val: counts.review,   color: '#0ea5e9' },
          { label: 'Complete',      val: counts.complete, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Reports</h2>
        <button style={btnPrimary} onClick={onCreate}>+ New Report</button>
      </div>

      {/* Desktop table — hidden on mobile */}
      <div style={styles.desktopTable}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <div style={{ ...tableRow, background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <div style={{ flex: '0 0 120px' }}>Report ID</div>
            <div style={{ flex: 2 }}>Title</div>
            <div style={{ flex: 1 }}>Client</div>
            <div style={{ flex: '0 0 110px' }}>Analyst</div>
            <div style={{ flex: '0 0 70px' }}>Tests</div>
            <div style={{ flex: '0 0 100px' }}>Status</div>
            <div style={{ flex: '0 0 90px' }}>Modified</div>
            <div style={{ flex: '0 0 60px' }}></div>
          </div>
          {reports.map((r, i) => {
            const st = STATUS[r.status] || STATUS.draft
            const doneCount = Object.keys(r.results).length
            return (
              <div
                key={r.id}
                style={{ ...tableRow, borderBottom: i < reports.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
                onClick={() => onOpen(r)}
              >
                <div style={{ flex: '0 0 120px', fontFamily: 'JetBrains Mono', fontSize: '0.78rem', fontWeight: 500, color: 'var(--accent)' }}>{r.id}</div>
                <div style={{ flex: 2 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 1 }}>{r.product}</div>
                </div>
                <div style={{ flex: 1, fontSize: '0.83rem', color: 'var(--muted)' }}>{r.client}</div>
                <div style={{ flex: '0 0 110px', fontSize: '0.83rem' }}>{r.analyst || '—'}</div>
                <div style={{ flex: '0 0 70px', fontSize: '0.82rem', fontWeight: 600, color: doneCount === r.selectedTests.length && r.selectedTests.length > 0 ? 'var(--green)' : 'var(--muted)' }}>
                  {doneCount}/{r.selectedTests.length}
                </div>
                <div style={{ flex: '0 0 100px' }}>
                  <StatusBadge st={st} />
                </div>
                <div style={{ flex: '0 0 90px', fontSize: '0.78rem', color: 'var(--muted)' }}>{r.modified}</div>
                <div style={{ flex: '0 0 60px' }}>
                  <button style={btnSmall} onClick={e => { e.stopPropagation(); onOpen(r) }}>Open</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile cards — shown only on small screens */}
      <div style={styles.mobileCards}>
        {reports.map(r => {
          const st = STATUS[r.status] || STATUS.draft
          const doneCount = Object.keys(r.results).length
          return (
            <div
              key={r.id}
              style={styles.mobileCard}
              onClick={() => onOpen(r)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>{r.id}</div>
                <StatusBadge st={st} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>{r.product}</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                <span>👤 {r.analyst || '—'}</span>
                <span>🏢 {r.client}</span>
                <span>📋 {doneCount}/{r.selectedTests.length} tests</span>
                <span>📅 {r.modified}</span>
              </div>
              <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }} onClick={e => { e.stopPropagation(); onOpen(r) }}>
                Open Report →
              </button>
            </div>
          )
        })}
      </div>

      {/* Responsive styles injected */}
      <style>{`
        @media (max-width: 700px) {
          .desktop-table { display: none !important; }
          .mobile-cards  { display: flex !important; }
        }
        @media (min-width: 701px) {
          .desktop-table { display: block !important; }
          .mobile-cards  { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function StatusBadge({ st }) {
  return (
    <span style={{ background: st.bg, color: st.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, flexShrink: 0 }}></span>
      {st.label}
    </span>
  )
}

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    // mobile override via media query below
  },
  statCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '1rem 1.2rem',
    boxShadow: 'var(--shadow)',
  },
  desktopTable: { className: 'desktop-table' },
  mobileCards: {
    flexDirection: 'column', gap: '0.75rem',
    className: 'mobile-cards',
  },
  mobileCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '1.1rem',
    boxShadow: 'var(--shadow)', cursor: 'pointer',
  },
}

const tableRow = { display: 'flex', alignItems: 'center', padding: '0.8rem 1.1rem', gap: '0.75rem' }
const btnPrimary = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, padding: '0.55rem 1.1rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }
const btnSmall = { background: 'transparent', border: '1px solid var(--border)', borderRadius: 5, padding: '0.25rem 0.55rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }
