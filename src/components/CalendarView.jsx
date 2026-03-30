import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarView() {
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [eventDates, setEventDates]   = useState([])
  const [bookedTrucks, setBookedTrucks] = useState([]) // approved applications
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('event_dates').select('date, status'),
      supabase.from('applications').select('requested_date, business_name, cuisine').eq('status', 'approved'),
    ]).then(([{ data: dates, error: e1 }, { data: apps, error: e2 }]) => {
      if (!e1) setEventDates(dates || [])
      if (!e2) setBookedTrucks(apps || [])
      setLoading(false)
    })
  }, [])

  const year = current.getFullYear(), month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const isoDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  const getDateInfo = (date) => {
    const iso = isoDate(date)
    const entry = eventDates.find(e => e.date === iso)
    if (!entry) return { status: date < today ? 'past' : 'none' }
    if (entry.status === 'booked') {
      const truck = bookedTrucks.find(a => a.requested_date === iso)
      return { status: 'booked', truck }
    }
    if (entry.status === 'available') return { status: 'available' }
    return { status: 'none' }
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <section id="calendar-section" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.h2}>Pop-Up Schedule</h2>
            <p style={styles.sub}>Upcoming events and available dates</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.monthNav}>
            <button style={styles.navBtn} onClick={() => setCurrent(new Date(year, month - 1, 1))}>‹</button>
            <span style={styles.monthLabel}>{MONTHS[month]} {year}</span>
            <button style={styles.navBtn} onClick={() => setCurrent(new Date(year, month + 1, 1))}>›</button>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading calendar…</div>
          ) : (
            <>
              <div style={styles.grid}>
                {DAYS.map(d => <div key={d} style={styles.dayHead}>{d}</div>)}
              </div>
              <div style={styles.grid}>
                {cells.map((date, i) => {
                  if (!date) return <div key={`e${i}`} />
                  const { status, truck } = getDateInfo(date)
                  const isToday = date.toDateString() === today.toDateString()
                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.cell,
                        ...styles['cell_' + status],
                        ...(isToday ? styles.cellToday : {}),
                        ...(status === 'booked' ? styles.cellBooked : {}),
                      }}
                    >
                      <span style={{ ...styles.dateNum, ...(status === 'past' || status === 'none' ? { color: '#bbb' } : {}) }}>
                        {date.getDate()}
                      </span>
                      {status === 'available' && (
                        <span style={styles.availableLabel}>Open</span>
                      )}
                      {status === 'booked' && truck && (
                        <span style={styles.truckLabel}>
                          {truck.business_name}
                          {truck.cuisine ? <span style={styles.cuisineLabel}> · {truck.cuisine}</span> : null}
                        </span>
                      )}
                      {status === 'booked' && !truck && (
                        <span style={styles.bookedLabel}>Booked</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div style={styles.legend}>
            {[
              { color: '#1a8a4a', label: 'Available' },
              { color: '#C41230', label: 'Booked' },
            ].map(l => (
              <div key={l.label} style={styles.legendItem}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                <span style={{ color: '#6b6055', fontSize: '0.8rem' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const styles = {
  section:    { padding: '2rem 2rem 4rem', background: '#fffdf7' },
  container:  { maxWidth: 860, margin: '0 auto' },
  header:     { marginBottom: '1.5rem' },
  h2:         { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.8rem', marginBottom: 4, color: '#1a1208' },
  sub:        { color: '#6b6055', fontSize: '0.88rem' },
  card:       { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  monthNav:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' },
  navBtn:     { background: '#f5f0e8', border: 'none', borderRadius: 8, width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer', color: '#1a1208' },
  monthLabel: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#1a1208' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 },
  dayHead:    { textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#6b6055', padding: '0.4rem 0', letterSpacing: 0.5, textTransform: 'uppercase' },
  cell:       { minHeight: 64, borderRadius: 8, padding: '0.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '0.5rem', gap: 3, background: '#f5f0e8' },
  cell_available: { background: '#edfaf3', border: '1px solid #b8e8cc' },
  cell_booked:    { background: '#fef0f0', border: '1px solid #f0c0c0' },
  cell_past:      { background: '#f0ece4', opacity: 0.5 },
  cell_none:      { background: '#f5f0e8' },
  cellToday:      { outline: '2px solid #C41230', outlineOffset: 1 },
  cellBooked:     { minHeight: 80 },
  dateNum:        { fontSize: '0.82rem', fontWeight: 600, color: '#1a1208', lineHeight: 1 },
  availableLabel: { fontSize: '0.62rem', fontWeight: 600, color: '#1a8a4a', textTransform: 'uppercase', letterSpacing: 0.3 },
  truckLabel:     { fontSize: '0.62rem', fontWeight: 700, color: '#C41230', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word' },
  cuisineLabel:   { fontWeight: 400, color: '#a00f25' },
  bookedLabel:    { fontSize: '0.62rem', fontWeight: 600, color: '#C41230' },
  legend:     { display: 'flex', gap: '1.2rem', marginTop: '1rem', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  loading:    { textAlign: 'center', padding: '3rem', color: '#6b6055', fontSize: '0.9rem' },
}
