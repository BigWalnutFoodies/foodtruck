import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarView() {
  const navigate = useNavigate()
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [eventDates, setEventDates] = useState([]) // [{ date: 'YYYY-MM-DD', status: 'available'|'booked' }]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('event_dates')
      .select('date, status')
      .then(({ data, error }) => {
        if (!error) setEventDates(data || [])
        setLoading(false)
      })
  }, [])

  const year = current.getFullYear(), month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getStatus = (date) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const entry = eventDates.find(e => e.date === iso)
    if (!entry) return date < today ? 'past' : 'none'
    if (entry.status === 'available') return 'available'
    if (entry.status === 'booked')    return 'booked'
    return 'none' // pending — hidden from public
  }

  const handleDateClick = (date, status) => {
    if (status !== 'available') return
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    navigate(`/apply?date=${iso}`)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <section id="calendar-section" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.h2}>Availability Calendar</h2>
            <p style={styles.sub}>Green = available · Red = booked</p>
          </div>
          <button style={styles.bookBtn} onClick={() => navigate('/apply')}>+ Request a Date</button>
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
                  const status = getStatus(date)
                  const isToday = date.toDateString() === today.toDateString()
                  const clickable = status === 'available'
                  return (
                    <div
                      key={i}
                      onClick={() => handleDateClick(date, status)}
                      style={{
                        ...styles.cell,
                        ...styles['cell_' + status],
                        ...(isToday ? styles.cellToday : {}),
                        ...(clickable ? styles.cellClickable : {}),
                      }}
                    >
                      <span style={{ ...styles.dateNum, ...(status === 'past' || status === 'none' ? { color: '#bbb' } : {}) }}>
                        {date.getDate()}
                      </span>
                      {status === 'available' && <span style={dot('#1a8a4a')} />}
                      {status === 'booked'    && <span style={dot('#C41230')} />}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div style={styles.legend}>
            {[{ color: '#1a8a4a', label: 'Available — click to apply' }, { color: '#C41230', label: 'Booked' }].map(l => (
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

const dot = (color) => ({ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' })

const styles = {
  section:    { padding: '2rem 2rem 4rem', background: '#fffdf7' },
  container:  { maxWidth: 800, margin: '0 auto' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  h2:         { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.8rem', marginBottom: 4, color: '#1a1208' },
  sub:        { color: '#6b6055', fontSize: '0.88rem' },
  bookBtn:    { background: '#C41230', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.4rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },
  card:       { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  monthNav:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' },
  navBtn:     { background: '#f5f0e8', border: 'none', borderRadius: 8, width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer', color: '#1a1208' },
  monthLabel: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#1a1208' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 },
  dayHead:    { textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#6b6055', padding: '0.4rem 0', letterSpacing: 0.5, textTransform: 'uppercase' },
  cell:       { minHeight: 52, borderRadius: 8, padding: '0.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: '#f5f0e8' },
  cell_available:  { background: '#edfaf3', border: '1px solid #b8e8cc' },
  cell_booked:     { background: '#fef0f0', border: '1px solid #f0c0c0' },
  cell_past:       { background: '#f0ece4', opacity: 0.6 },
  cell_none:       { background: '#f5f0e8' },
  cellToday:       { outline: '2px solid #C41230', outlineOffset: 1 },
  cellClickable:   { cursor: 'pointer' },
  dateNum:    { fontSize: '0.88rem', fontWeight: 600, color: '#1a1208' },
  legend:     { display: 'flex', gap: '1.2rem', marginTop: '1rem', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  loading:    { textAlign: 'center', padding: '3rem', color: '#6b6055', fontSize: '0.9rem' },
}
