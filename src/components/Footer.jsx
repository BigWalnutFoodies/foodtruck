import React from 'react'
import logo from '../assets/BW Foodies Logo.svg'

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.top}>
          <div>
            <div style={styles.logo}>
              <img src={logo} alt="Big Walnut Foodies" style={{ height: 44, width: 'auto' }} />
            </div>
            <p style={styles.tagline}>Simple food truck booking for pop-up events.<br />Community-run, no fuss, just good food.</p>
          </div>
          <div style={styles.col}>
            <div style={styles.colTitle}>For Trucks</div>
            <span style={styles.footItem}>View available dates</span>
            <span style={styles.footItem}>Submit booking request</span>
          </div>
          <div style={styles.col}>
            <div style={styles.colTitle}>For Organisers</div>
            <span style={styles.footItem}>Review submissions</span>
            <span style={styles.footItem}>Approve or decline</span>
            <span style={styles.footItem}>Filter by cuisine / status</span>
          </div>
          <div style={styles.col}>
            <div style={styles.colTitle}>Contact</div>
            <a href="mailto:hello@bigwalnutfoodies.com" style={styles.footLink}>✉ hello@bigwalnutfoodies.com</a>
            <span style={styles.footItem}>📍 Big Walnut area</span>
          </div>
        </div>
        <div style={styles.bottom}>
          <span style={styles.copy}>© 2026 Big Walnut Foodies. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer:    { background: '#1a1208', padding: '3.5rem 2rem 2rem' },
  container: { maxWidth: 1100, margin: '0 auto' },
  top:       { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' },
  logo:      { marginBottom: '0.75rem' },
  tagline:   { color: '#8a7f6e', fontSize: '0.85rem', lineHeight: 1.6 },
  col:       { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  colTitle:  { color: '#fff', fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  footItem:  { color: '#8a7f6e', fontSize: '0.85rem' },
  footLink:  { color: '#8a7f6e', textDecoration: 'none', fontSize: '0.85rem' },
  bottom:    { borderTop: '1px solid #2e2418', paddingTop: '1.2rem' },
  copy:      { color: '#5a5040', fontSize: '0.8rem' },
}
