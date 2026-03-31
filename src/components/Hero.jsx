import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section style={styles.hero}>
      <div style={styles.inner}>
        <div style={styles.tag}>🎪 Now Accepting Applications</div>
        <h1 style={styles.h1}>Bring Your Truck<br /><span style={styles.accent}>To Our Pop-Up</span></h1>
        <p style={styles.p}>Check available dates, submit your info, and we'll confirm your spot. Simple, fast, no back-and-forth emails.</p>
        <div style={styles.btnRow}>
          <button style={styles.btnPrimary} onClick={() => document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth' })}>View Calendar</button>
        </div>
        <div style={styles.pills}>
          {['Free to apply', 'Response within 24hrs', 'Email notifications', 'Easy approval process'].map(t => (
            <span key={t} style={styles.pill}>✓ {t}</span>
          ))}
        </div>
      </div>
      <div style={styles.illustration}>
        <div style={styles.truckEmoji}>🚚</div>
        <div style={styles.sparkles}>
          <span style={{ ...styles.spark, top: '10%', left: '15%', animationDelay: '0s' }}>✦</span>
          <span style={{ ...styles.spark, top: '20%', right: '10%', animationDelay: '0.4s' }}>★</span>
          <span style={{ ...styles.spark, bottom: '25%', left: '10%', animationDelay: '0.8s' }}>◆</span>
          <span style={{ ...styles.spark, bottom: '15%', right: '20%', animationDelay: '1.2s' }}>✦</span>
        </div>
      </div>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
      `}</style>
    </section>
  )
}

const styles = {
  hero:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2.5rem 4rem 2rem', gap: '2rem', flexWrap: 'wrap', maxWidth: 1200, margin: '0 auto' },
  inner:     { flex: '1 1 400px', maxWidth: 560 },
  tag:       { display: 'inline-block', background: '#fff0f0', border: '1px solid #f0c0c0', color: '#C41230', fontSize: '0.78rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '0.35rem 1rem', borderRadius: 100, marginBottom: '1.5rem' },
  h1:        { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.3rem, 2vw, 1.8rem)', lineHeight: 1.1, marginBottom: '1rem', color: '#1a1208' },
  accent:    { color: '#C41230' },
  p:         { color: '#6b6055', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 440 },
  btnRow:    { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
  btnPrimary:   { background: '#C41230', color: '#fff', border: 'none', borderRadius: 10, padding: '0.85rem 1.8rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  btnSecondary: { background: '#fff', color: '#1a1208', border: '1.5px solid #e8e0d0', borderRadius: 10, padding: '0.85rem 1.8rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' },
  pills:     { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  pill:      { background: '#fff0f0', border: '1px solid #f0c0c0', color: '#C41230', fontSize: '0.78rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: 100 },
  illustration: { flex: '0 0 auto', position: 'relative', width: 260, height: 260, background: 'linear-gradient(135deg, #fff0f0 0%, #fff8e8 100%)', borderRadius: '50%', border: '2px solid #f0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  truckEmoji: { fontSize: '7rem', animation: 'float 3s ease-in-out infinite', display: 'block' },
  sparkles:  { position: 'absolute', inset: 0 },
  spark:     { position: 'absolute', color: '#F5A800', fontSize: '1.2rem', animation: 'pulse 2s ease-in-out infinite' },
}
