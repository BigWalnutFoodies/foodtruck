import React, { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarView({ bookedDates, submissions, setView }) {
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const approvedDates = submissions.filter(s => s.status === 'approved').map(s => s.requestedDate)
  const pendingDates = submissions.filter(s => s.status === 'pending').map(s => s.requestedDate)

  const getStatus = (date) => {
    const ds = date.toDateString()
    if (bookedDates.includes(ds) || approvedDates.includes(ds)) return 'booked'
    if (pendingDates.includes(ds)) return 'pending'
    if (date < today) return 'past'
    return 'available'
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
            <p style={styles.sub}>Green = open · Orange = pending review · Red = booked</p>
          </div>
          <button style={styles.bookBtn} onClick={() => setView('book')}>+ Request a Date</button>
        </div>

        <div style={styles.card}>
          {/* Month nav */}
          <div style={styles.monthNav}>
            <button style={styles.navBtn} onClick={() => setCurrent(new Date(year, month - 1, 1))}>‹</button>
            <span style={styles.monthLabel}>{MONTHS[month]} {year}</span>
            <button style={styles.navBtn} onClick={() => setCurrent(new Date(year, month + 1, 1))}>›</button>
          </div>

          {/* Day headers */}
          <div style={styles.grid}>
            {DAYS.map(d => <div key={d} style={styles.dayHead}>{d}</div>)}
          </div>

          {/* Date cells */}
          <div style={styles.grid}>
            {cells.map((date, i) => {
              if (!date) return <div key={`e${i}`} />
              const status = getStatus(date)
              const isToday = date.toDateString() === today.toDateString()
              return (
                <div key={i} style={{
                  ...styles.cell,
                  ...(status === 'available' ? styles.cellAvail : {}),
                  ...(status === 'pending' ? styles.cellPending : {}),
                  ...(status === 'booked' ? styles.cellBooked : {}),
                  ...(status === 'past' ? styles.cellPast : {}),
                  ...(isToday ? styles.cellToday : {}),
                }}>
                  <span style={styles.dateNum}>{date.getDate()}</span>
                  {status === 'available' && <span style={styles.dot('#22a05a')} />}
                  {status === 'pending' && <span style={styles.dot('#ffb800')} />}
                  {status === 'booked' && <span style={styles.dot('#e03030')} />}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            {[
              { color: '#22a05a', label: 'Available' },
              { color: '#ffb800', label: 'Pending' },
              { color: '#e03030', label: 'Booked' },
              { color: '#d0c8b8', label: 'Past' },
            ].map(l => (
              <div key={l.label} style={styles.legendItem}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                <span style={{ color: '#8a7f6e', fontSize: '0.8rem' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const styles = {
  section: { padding: '2rem 2rem 4rem', background: '#fffdf7' },
  container: { maxWidth: 800, margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  h2: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.8rem', marginBottom: 4 },
  sub: { color: '#8a7f6e', fontSize: '0.88rem' },
  bookBtn: {
    background: '#ff5c1a', color: '#fff',
    border: 'none', borderRadius: 10,
    padding: '0.65rem 1.4rem', fontWeight: 700,
    fontSize: '0.9rem', cursor: 'pointer',
  },
  card: {
    background: '#fff', border: '1px solid #e8e0d0',
    borderRadius: 16, padding: '1.5rem',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  },
  monthNav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.2rem',
  },
  navBtn: {
    background: '#f5f0e8', border: 'none', borderRadius: 8,
    width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer',
    color: '#1a1208',
  },
  monthLabel: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4, marginBottom: 4,
  },
  dayHead: {
    textAlign: 'center', fontSize: '0.72rem', fontWeight: 700,
    color: '#8a7f6e', padding: '0.4rem 0', letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cell: {
    minHeight: 52, borderRadius: 8, padding: '0.4rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 3, position: 'relative',
    background: '#f5f0e8',
  },
  cellAvail: { background: '#edfaf3', border: '1px solid #b8e8cc' },
  cellPending: { background: '#fff8e6', border: '1px solid #ffe0a0' },
  cellBooked: { background: '#fef0f0', border: '1px solid #f0c0c0' },
  cellPast: { background: '#f0ece4', opacity: 0.5 },
  cellToday: { outline: '2px solid #ff5c1a', outlineOffset: 1 },
  dateNum: { fontSize: '0.88rem', fontWeight: 600, color: '#1a1208' },
  dot: (color) => ({
    width: 6, height: 6, borderRadius: '50%',
    background: color, display: 'inline-block',
  }),
  legend: { display: 'flex', gap: '1.2rem', marginTop: '1rem', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
}
