import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}

function instagramUrl(handle) {
  const clean = handle.replace(/^@/, '').trim()
  return `https://www.instagram.com/${clean}/`
}

export default function CommunityCalendar() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const todayIso = today.toISOString().slice(0, 10)
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() + 90)
    const cutoffIso = cutoff.toISOString().slice(0, 10)

    supabase
      .from('applications')
      .select('requested_date, business_name, instagram, menu_link')
      .eq('status', 'approved')
      .gte('requested_date', todayIso)
      .lte('requested_date', cutoffIso)
      .order('requested_date', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setEvents(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <section style={s.section}>
      <div style={s.container}>
        <div style={s.pageHeader}>
          <h1 style={s.h1}>Popup Calendar</h1>
          <p style={s.sub}>Upcoming food trucks — next 90 days</p>
        </div>

        {loading && <div style={s.state}>Loading…</div>}

        {!loading && events.length === 0 && (
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>🗓</div>
            <p style={s.emptyTitle}>No events scheduled yet</p>
            <p style={s.emptySub}>Check back soon — new dates are added regularly.</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div style={s.grid}>
            {events.map((ev, i) => (
              <div key={i} style={s.card}>
                <div style={s.dateChip}>{formatDate(ev.requested_date)}</div>
                <div style={s.truckName}>{ev.business_name}</div>
                <div style={s.links}>
                  {ev.instagram && (
                    <a href={instagramUrl(ev.instagram)} target="_blank" rel="noopener noreferrer" style={s.link}>
                      Instagram
                    </a>
                  )}
                  {ev.menu_link && (
                    <a href={ev.menu_link} target="_blank" rel="noopener noreferrer" style={{ ...s.link, ...s.linkMenu }}>
                      Menu / Site
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const s = {
  section:    { padding: '2rem 1.25rem 4rem', background: '#fffdf7', minHeight: 'calc(100vh - 80px)' },
  container:  { maxWidth: 860, margin: '0 auto' },
  pageHeader: { marginBottom: '2rem' },
  h1:         { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#1a1208', marginBottom: '0.35rem' },
  sub:        { color: '#6b6055', fontSize: '0.9rem' },
  state:      { textAlign: 'center', padding: '4rem 0', color: '#6b6055', fontSize: '0.95rem' },
  emptyCard:  { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' },
  emptyIcon:  { fontSize: '2.5rem', marginBottom: '0.75rem' },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#1a1208', marginBottom: '0.4rem' },
  emptySub:   { color: '#6b6055', fontSize: '0.9rem' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card:       { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 16, padding: '1.25rem 1.25rem 1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  dateChip:   { display: 'inline-block', background: '#fff8ec', border: '1px solid #F5A800', color: '#a06800', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '0.4rem' },
  truckName:  { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#C41230', lineHeight: 1.2 },
  links:      { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' },
  link:       { fontSize: '0.78rem', fontWeight: 600, color: '#C41230', textDecoration: 'none', background: '#fff0f0', border: '1px solid #f0c0c0', borderRadius: 6, padding: '0.2rem 0.6rem' },
  linkMenu:   { color: '#1a8a4a', background: '#edfaf3', border: '1px solid #b8e8cc' },
}
