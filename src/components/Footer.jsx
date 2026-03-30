import React from 'react'

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.top}>
          <div>
            <div style={styles.logo}>🚚 <span style={styles.logoText}>RollIn</span></div>
            <p style={styles.tagline}>Simple food truck booking for pop-up events.<br />No overbuilding. Just what you need.</p>
          </div>
          <div style={styles.col}>
            <div style={styles.colTitle}>For Trucks</div>
            <span style={styles.footItem}>View available dates</span>
            <span style={styles.footItem}>Submit booking request</span>
            <span style={styles.footItem}>Email + SMS updates</span>
          </div>
          <div style={styles.col}>
            <div style={styles.colTitle}>For Organizers</div>
            <span style={styles.footItem}>Review submissions</span>
            <span style={styles.footItem}>Approve or decline</span>
            <span style={styles.footItem}>Filter by cuisine / status</span>
          </div>
          <div style={styles.col}>
            <div style={styles.colTitle}>Contact</div>
            <a href="mailto:hello@rollin.events" style={styles.footLink}>✉ hello@rollin.events</a>
            <a href="tel:+14155550100" style={styles.footLink}>📞 (415) 555-0100</a>
            <span style={styles.footItem}>📍 San Francisco, CA</span>
          </div>
        </div>

        <div style={styles.creditBanner}>
          <span style={{ opacity: 0.5 }}>✦</span>
          &nbsp; Vibe coded using <strong>Claude</strong> &nbsp;·&nbsp; For Upwork &nbsp;·&nbsp; 28th March 2026 &nbsp;
          <span style={{ opacity: 0.5 }}>✦</span>
        </div>

        <div style={styles.bottom}>
          <span style={styles.copy}>© 2026 RollIn. All rights reserved.</span>
          <div style={styles.legal}>
            <a href="#" style={styles.legalLink}>Privacy</a>
            <a href="#" style={styles.legalLink}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: { background: '#1a1208', padding: '3.5rem 2rem 2rem' },
  container: { maxWidth: 1100, margin: '0 auto' },
  top: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '2.5rem', marginBottom: '2.5rem',
  },
  logo: { fontSize: '1.3rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#fff', fontSize: '1.3rem' },
  tagline: { color: '#6a5f4e', fontSize: '0.85rem', lineHeight: 1.6 },
  col: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  colTitle: { color: '#fff', fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  footItem: { color: '#6a5f4e', fontSize: '0.85rem' },
  footLink: { color: '#6a5f4e', textDecoration: 'none', fontSize: '0.85rem' },
  creditBanner: {
    background: 'rgba(255,92,26,0.12)', border: '1px solid rgba(255,92,26,0.25)',
    borderRadius: 10, padding: '0.65rem 1.2rem',
    color: '#ff9060', fontSize: '0.82rem', fontWeight: 500,
    textAlign: 'center', marginBottom: '2rem',
  },
  bottom: {
    borderTop: '1px solid #2e2418', paddingTop: '1.2rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
  },
  copy: { color: '#4a4030', fontSize: '0.8rem' },
  legal: { display: 'flex', gap: '1rem' },
  legalLink: { color: '#4a4030', textDecoration: 'none', fontSize: '0.8rem' },
}
