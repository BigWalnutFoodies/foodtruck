import React, { useState } from 'react'

export default function Header({ view, setView }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navTo = (v) => { setView(v); setMenuOpen(false) }

  return (
    <>
      {/* Credit bar */}
      <div style={styles.creditBar}>
        <span style={{ opacity: 0.5 }}>✦</span>
        &nbsp; Vibe coded using <strong>Claude</strong> &nbsp;·&nbsp; For Upwork &nbsp;·&nbsp; 28th March 2026 &nbsp;
        <span style={{ opacity: 0.5 }}>✦</span>
      </div>

      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navTo('home')}>
          🚚 <span style={styles.logoText}>RollIn</span>
          <span style={styles.logoSub}>Food Truck Bookings</span>
        </div>

        {/* Desktop nav */}
        <nav style={styles.desktopNav}>
          <button style={view === 'home' ? { ...styles.navBtn, ...styles.navActive } : styles.navBtn} onClick={() => navTo('home')}>Calendar</button>
          <button style={view === 'book' ? { ...styles.navBtn, ...styles.navActive } : styles.navBtn} onClick={() => navTo('book')}>Request a Date</button>
          <button style={view === 'dashboard' ? { ...styles.navCta, ...styles.navCtaActive } : styles.navCta} onClick={() => navTo('dashboard')}>Operator Dashboard</button>
        </nav>

        {/* Mobile hamburger */}
        <button style={styles.hamburger} onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <button style={styles.mobileNavBtn} onClick={() => navTo('home')}>📅 Calendar</button>
          <button style={styles.mobileNavBtn} onClick={() => navTo('book')}>+ Request a Date</button>
          <button style={{ ...styles.mobileNavBtn, color: 'var(--accent)', fontWeight: 700 }} onClick={() => navTo('dashboard')}>⚙ Operator Dashboard</button>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
        @media (min-width: 601px) {
          .desktop-nav { display: flex !important; }
          .hamburger   { display: none !important; }
        }
      `}</style>
    </>
  )
}

const styles = {
  creditBar: {
    background: '#ff5c1a', color: '#fff',
    textAlign: 'center', fontSize: '0.78rem', fontWeight: 500,
    padding: '0.4rem 1rem', letterSpacing: 0.3,
    position: 'sticky', top: 0, zIndex: 101,
  },
  header: {
    position: 'sticky', top: 29, zIndex: 100,
    background: 'rgba(255,253,247,0.97)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e8e0d0',
    padding: '0 1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 60,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    cursor: 'pointer', fontSize: '1.3rem', flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800,
    fontSize: '1.2rem', color: '#1a1208',
  },
  logoSub: {
    fontSize: '0.68rem', color: '#8a7f6e', fontWeight: 500,
    marginLeft: 4, marginTop: 2,
    display: 'none', // hidden on very small screens via inline, shown on larger
  },
  desktopNav: {
    display: 'flex', gap: '0.5rem', alignItems: 'center',
    // className: 'desktop-nav' — controlled via style tag
  },
  navBtn: {
    background: 'transparent', border: '1px solid transparent',
    borderRadius: 8, padding: '0.4rem 0.85rem',
    fontSize: '0.85rem', fontWeight: 500, color: '#8a7f6e',
    cursor: 'pointer',
  },
  navActive: {
    background: '#fff5f0', border: '1px solid #ffd0c0',
    color: '#ff5c1a',
  },
  navCta: {
    background: '#ff5c1a', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '0.45rem 1rem', fontSize: '0.85rem',
    fontWeight: 600, cursor: 'pointer',
  },
  navCtaActive: { background: '#e04000' },
  hamburger: {
    background: 'transparent', border: '1px solid #e8e0d0',
    borderRadius: 8, width: 38, height: 38,
    display: 'none', // shown via media query
    alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', cursor: 'pointer', color: '#1a1208',
    flexShrink: 0,
  },
  mobileMenu: {
    position: 'sticky', top: 89, zIndex: 99,
    background: '#fff', borderBottom: '1px solid #e8e0d0',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  mobileNavBtn: {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid #f0ece4',
    padding: '1rem 1.25rem', textAlign: 'left',
    fontSize: '0.95rem', fontWeight: 500,
    color: '#1a1208', cursor: 'pointer',
  },
}
