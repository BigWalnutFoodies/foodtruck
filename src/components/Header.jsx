import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/BW Foodies Logo.svg'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navTo = (path) => { navigate(path); setMenuOpen(false) }
  const isActive = (path) => location.pathname === path || (path === '/calendar' && location.pathname === '/')

  return (
    <>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navTo('/')}>
          <img src={logo} alt="Big Walnut Foodies" style={{ height: 64, width: 'auto' }} />
        </div>
        <nav style={styles.desktopNav}>
          <button style={isActive('/calendar')   ? { ...styles.navBtn, ...styles.navActive } : styles.navBtn} onClick={() => navTo('/calendar')}>Calendar</button>
          <button style={isActive('/apply')     ? { ...styles.navBtn, ...styles.navActive } : styles.navBtn} onClick={() => navTo('/apply')}>Request a Date</button>
          <button style={isActive('/dashboard') ? { ...styles.navCta, ...styles.navCtaActive } : styles.navCta} onClick={() => navTo('/dashboard')}>Organiser Dashboard</button>
        </nav>
        <button style={styles.hamburger} onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          <button style={styles.mobileNavBtn} onClick={() => navTo('/calendar')}>📅 Calendar</button>
          <button style={styles.mobileNavBtn} onClick={() => navTo('/apply')}>+ Request a Date</button>
          <button style={{ ...styles.mobileNavBtn, color: '#C41230', fontWeight: 700 }} onClick={() => navTo('/dashboard')}>⚙ Organiser Dashboard</button>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) { .desktop-nav { display: none !important; } .hamburger { display: flex !important; } }
        @media (min-width: 601px) { .desktop-nav { display: flex !important; } .hamburger { display: none !important; } }
      `}</style>
    </>
  )
}

const styles = {
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(255,253,247,0.97)', backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e8e0d0',
    padding: '0.5rem 1.5rem',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', minHeight: 80,
  },
  logo: { display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 },
  desktopNav: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  navBtn: {
    background: 'transparent', border: '1px solid transparent',
    borderRadius: 8, padding: '0.4rem 0.85rem',
    fontSize: '0.85rem', fontWeight: 500, color: '#6b6055', cursor: 'pointer',
  },
  navActive:    { background: '#fff0f0', border: '1px solid #f0c0c0', color: '#C41230' },
  navCta:       { background: '#C41230', color: '#fff', border: 'none', borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  navCtaActive: { background: '#a00f25' },
  hamburger: {
    background: 'transparent', border: '1px solid #e8e0d0',
    borderRadius: 8, width: 38, height: 38, display: 'none',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', cursor: 'pointer', color: '#1a1208', flexShrink: 0,
  },
  mobileMenu: {
    position: 'sticky', top: 80, zIndex: 99,
    background: '#fff', borderBottom: '1px solid #e8e0d0',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  mobileNavBtn: {
    background: 'transparent', border: 'none', borderBottom: '1px solid #f0ece4',
    padding: '1rem 1.25rem', textAlign: 'left',
    fontSize: '0.95rem', fontWeight: 500, color: '#1a1208', cursor: 'pointer',
  },
}
