import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const isoStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`

export default function Dashboard() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={s.center}>Loading…</div>
  if (!session) return <LoginForm />
  return <DashboardContent session={session} />
}

function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    setError(null); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Invalid email or password.')
    setLoading(false)
  }

  return (
    <div style={s.loginPage}>
      <div style={s.loginCard}>
        <h2 style={s.loginTitle}>Organiser Login</h2>
        <p style={s.loginSub}>Big Walnut Foodies — organisers only</p>
        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="you@example.com" style={s.input} autoFocus />
        </div>
        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••" style={s.input} />
        </div>
        {error && <div style={s.errBox}>{error}</div>}
        <button style={{ ...s.btnPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}

const STATUS = {
  pending:   { label: 'Pending',   bg: '#fff8e6', color: '#996600', dot: '#F5A800' },
  approved:  { label: 'Approved',  bg: '#edfaf3', color: '#1a6e3e', dot: '#1a8a4a' },
  declined:  { label: 'Declined',  bg: '#fef0f0', color: '#a00f25', dot: '#C41230' },
  cancelled: { label: 'Cancelled', bg: '#f5f0e8', color: '#6b6055', dot: '#bbb' },
}

const CUISINE_FILTERS = ['All','American','Mexican','Korean','Indian','Italian','Thai','Mediterranean','BBQ','Desserts','Other']

function DashboardContent({ session }) {
  const [applications, setApplications] = useState([])
  const [eventDates, setEventDates]     = useState([])
  const [loadingData, setLoadingData]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [cuisineFilter, setCuisineFilter] = useState('All')
  const [expanded, setExpanded]         = useState(null)
  const [toast, setToast]               = useState(null)
  const [tab, setTab]                   = useState('applications')
  const [location, setLocation]         = useState('')
  const [locSaving, setLocSaving]       = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = async () => {
    const [{ data: apps }, { data: dates }, { data: cfg }] = await Promise.all([
      supabase.from('applications').select('*').order('submitted_at', { ascending: false }),
      supabase.from('event_dates').select('*').order('date', { ascending: true }),
      supabase.from('config').select('value').eq('key', 'event_location').single(),
    ])
    setApplications(apps || [])
    setEventDates(dates || [])
    if (cfg) setLocation(cfg.value || '')
    setLoadingData(false)
  }

  const saveLocation = async () => {
    setLocSaving(true)
    await supabase.from('config').upsert({ key: 'event_location', value: location })
    setLocSaving(false)
    showToast('Location saved')
  }

  useEffect(() => { fetchAll() }, [])

  const handleApprove = async (app) => {
    await supabase.from('applications').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', app.id)
    await fetchAll()
    showToast('✓ Application approved')
    try {
      await supabase.functions.invoke('notify-approved', {
        body: { businessName: app.business_name, email: app.email, contact: app.contact_name, requestedDate: app.requested_date, location },
      })
    } catch (_) { /* silent */ }
  }

  const handleDecline = async (app) => {
    await supabase.from('applications').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', app.id)
    await fetchAll()
    showToast('Application declined', 'error')
    try {
      await supabase.functions.invoke('notify-declined', {
        body: { businessName: app.business_name, email: app.email, contact: app.contact_name, requestedDate: app.requested_date },
      })
    } catch (_) { /* silent */ }
  }

  const handleCancel = async (app) => {
    await supabase.from('applications').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', app.id)
    await fetchAll()
    showToast('Booking cancelled')
    try {
      await supabase.functions.invoke('notify-cancelled', {
        body: { businessName: app.business_name, email: app.email, contact: app.contact_name, requestedDate: app.requested_date },
      })
    } catch (_) { /* silent */ }
  }

  const handleAddDate = async (date, capacity = 1) => {
    if (!date) return
    const { error } = await supabase.from('event_dates').insert({ date, capacity })
    if (error) { showToast('Date already exists or invalid.', 'error'); return }
    await fetchAll()
    showToast('Date added to calendar')
  }

  const handleRemoveDate = async (id) => {
    await supabase.from('event_dates').delete().eq('id', id)
    await fetchAll()
    showToast('Date removed')
  }

  const handleUpdateCapacity = async (id, newCapacity) => {
    if (newCapacity < 1) return
    await supabase.from('event_dates').update({ capacity: newCapacity }).eq('id', id)
    await fetchAll()
    showToast('Capacity updated')
  }

  const handleClearPast = async () => {
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('event_dates').delete().lt('date', today)
    await fetchAll()
    showToast('Past dates cleared')
  }

  const generateSnapshot = () => {
    const doc = new jsPDF()
    const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
    const active = [...applications]
      .filter(a => ['pending', 'approved'].includes(a.status))
      .sort((a, b) => a.requested_date.localeCompare(b.requested_date))

    doc.setFontSize(18)
    doc.setTextColor(196, 18, 48)
    doc.text('Big Walnut Foodies', 14, 18)
    doc.setFontSize(11)
    doc.setTextColor(80, 60, 40)
    doc.text('Booking Snapshot — Active Applications', 14, 26)
    doc.setFontSize(8)
    doc.setTextColor(120, 100, 80)
    doc.text(`Generated: ${timestamp}`, 14, 32)
    doc.text(`Total active: ${active.length} (${active.filter(a => a.status === 'approved').length} approved, ${active.filter(a => a.status === 'pending').length} pending)`, 14, 37)

    autoTable(doc, {
      startY: 43,
      head: [['Date', 'Business', 'Cuisine', 'Status', 'Contact', 'Phone', 'Email']],
      body: active.map(a => [
        a.requested_date,
        a.business_name,
        a.cuisine,
        a.status.charAt(0).toUpperCase() + a.status.slice(1),
        a.contact_name,
        a.phone,
        a.email,
      ]),
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      headStyles: { fillColor: [196, 18, 48], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 253, 247] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 38 },
        2: { cellWidth: 24 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 24 },
      },
      margin: { left: 14, right: 14 },
    })

    doc.save(`BigWalnutFoodies-Snapshot-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportPhones = () => {
    const rows = [['Business Name', 'Phone', 'Status', 'Date']]
    applications
      .filter(a => ['pending', 'approved'].includes(a.status))
      .forEach(a => rows.push([a.business_name, a.phone, a.status, a.requested_date]))
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'BigWalnutFoodies-Phones.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = applications.filter(a => {
    if (statusFilter  !== 'All' && a.status  !== statusFilter.toLowerCase())  return false
    if (cuisineFilter !== 'All' && a.cuisine !== cuisineFilter) return false
    return true
  })

  if (loadingData) return <div style={s.center}>Loading dashboard…</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#1a1208', margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#6b6055', fontSize: '0.82rem', margin: '2px 0 0' }}>Big Walnut Foodies — organiser view</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button style={s.btnExport} onClick={generateSnapshot}>↓ Save Snapshot</button>
          <button style={s.btnExport} onClick={exportPhones}>↓ Export Phones</button>
          <button style={s.btnLogout} onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Pending',   value: applications.filter(a => a.status === 'pending').length,   color: '#F5A800' },
          { label: 'Approved',  value: applications.filter(a => a.status === 'approved').length,  color: '#1a8a4a' },
          { label: 'Declined',  value: applications.filter(a => a.status === 'declined').length,  color: '#C41230' },
          { label: 'Cancelled', value: applications.filter(a => a.status === 'cancelled').length, color: '#bbb' },
        ].map(({ label, value, color }) => (
          <div key={label} style={s.statCard}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: '#6b6055', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['applications', 'schedule'].map(t => (
          <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }} onClick={() => setTab(t)}>
            {t === 'applications' ? '📋 Applications' : '📅 Schedule'}
          </button>
        ))}
      </div>

      {tab === 'applications' ? (
        <>
          {/* Filters */}
          <div style={s.filters}>
            <div style={s.filterRow}>
              <span style={s.filterLabel}>Status:</span>
              <div style={s.filterScroll}>
                {['All','Pending','Approved','Declined','Cancelled'].map(f => (
                  <button key={f}
                    style={{ ...s.chip, ...(statusFilter === f ? s.chipActive : {}) }}
                    onClick={() => setStatusFilter(f)}>{f}</button>
                ))}
              </div>
            </div>
            <div style={s.filterRow}>
              <span style={s.filterLabel}>Cuisine:</span>
              <div style={s.filterScroll}>
                {CUISINE_FILTERS.map(f => (
                  <button key={f}
                    style={{ ...s.chip, ...(cuisineFilter === f ? s.chipActive : {}) }}
                    onClick={() => setCuisineFilter(f)}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Applications list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map(app => (
              <div key={app.id} style={s.card}>
                <div style={s.row} onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS[app.status]?.dot || '#bbb', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1208', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {app.business_name}
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: STATUS[app.status]?.color || '#6b6055', background: STATUS[app.status]?.bg || '#f5f0e8', borderRadius: 100, padding: '0.1rem 0.55rem' }}>
                        {STATUS[app.status]?.label || app.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b6055', marginTop: 2 }}>
                      {app.requested_date} · {app.cuisine}
                    </div>
                  </div>
                  <span style={{ color: '#bbb', fontSize: '1.1rem' }}>{expanded === app.id ? '▲' : '▼'}</span>
                </div>

                {expanded === app.id && (
                  <div style={s.detail}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.5rem 1.5rem', marginBottom: '1rem' }}>
                      {[
                        ['Contact',  app.contact_name],
                        ['Email',    app.email],
                        ['Phone',    app.phone],
                        ['Years',    app.years_in_biz],
                        ['Cuisine',  app.cuisine],
                        ['Instagram',app.instagram],
                        ['Facebook', app.facebook],
                        ['Menu',     app.menu_link],
                      ].filter(([,v]) => v).map(([label, value]) => (
                        <div key={label}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6b6055', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                          <div style={{ fontSize: '0.85rem', color: '#1a1208', wordBreak: 'break-all' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    {app.bio && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6b6055', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Bio</div>
                        <div style={{ fontSize: '0.85rem', color: '#1a1208', lineHeight: 1.6 }}>{app.bio}</div>
                      </div>
                    )}
                    {app.references_text && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6b6055', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>References</div>
                        <div style={{ fontSize: '0.85rem', color: '#1a1208', lineHeight: 1.6 }}>{app.references_text}</div>
                      </div>
                    )}
                    {app.logo_url && (
                      <div style={{ marginBottom: '1rem' }}>
                        <img src={app.logo_url} alt="Truck logo" style={{ maxHeight: 80, maxWidth: 200, borderRadius: 8, border: '1px solid #e8e0d0' }} />
                      </div>
                    )}
                    {app.status === 'pending' && (() => {
                      const dateEntry  = eventDates.find(e => e.date === app.requested_date)
                      const filled     = applications.filter(a => a.requested_date === app.requested_date && a.status === 'approved').length
                      const cap        = dateEntry?.capacity || 0
                      const slotsLeft  = dateEntry ? cap - filled : null
                      const isFull     = slotsLeft !== null && slotsLeft <= 0
                      return (
                        <>
                          {dateEntry && (
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isFull ? '#C41230' : '#1a6e3e', marginBottom: '0.6rem' }}>
                              {isFull ? `Date full — ${filled}/${cap} slots filled` : `${slotsLeft} of ${cap} slot${cap !== 1 ? 's' : ''} available for ${app.requested_date}`}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {!isFull && <button style={s.btnApprove} onClick={() => handleApprove(app)}>✓ Approve</button>}
                            <button style={s.btnDecline} onClick={() => handleDecline(app)}>✗ Decline</button>
                          </div>
                        </>
                      )
                    })()}
                    {app.status === 'approved' && (
                      <button style={s.btnCancel} onClick={() => handleCancel(app)}>Cancel Booking</button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6055', border: '1px dashed #e8e0d0', borderRadius: 12 }}>
                No applications match the current filters.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ background: '#fff', border: '1px solid #e8e0d0', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1208', margin: '0 0 0.25rem' }}>Event Location & Parking</h3>
            <p style={{ fontSize: '0.78rem', color: '#6b6055', margin: '0 0 0.75rem' }}>Included in confirmation emails sent to approved trucks. Update before approving if location changes.</p>
            <textarea
              value={location}
              onChange={e => setLocation(e.target.value)}
              rows={3}
              placeholder="e.g. Main Street car park, enter from Oak St. Pitch 3 — look for the organisers on arrival."
              style={{ ...s.input, width: '100%', resize: 'vertical', marginBottom: '0.75rem', boxSizing: 'border-box' }}
            />
            <button style={{ ...s.btnApprove, opacity: locSaving ? 0.7 : 1 }} onClick={saveLocation} disabled={locSaving}>
              {locSaving ? 'Saving…' : 'Save Location'}
            </button>
          </div>
          <OrganiserCalendar
            applications={applications}
            eventDates={eventDates}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onCancel={handleCancel}
            onAddDate={handleAddDate}
            onRemoveDate={handleRemoveDate}
            onUpdateCapacity={handleUpdateCapacity}
            onClearPast={handleClearPast}
          />
        </>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#C41230' : '#1a8a4a', color: '#fff', borderRadius: 10, padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function OrganiserCalendar({ applications, eventDates, onApprove, onDecline, onCancel, onAddDate, onRemoveDate, onUpdateCapacity, onClearPast }) {
  const today   = new Date()
  const [current, setCurrent]   = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(null)
  const [newCap, setNewCap]     = useState(1)

  const year = current.getFullYear(), month = current.getMonth()
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getDateData = (date) => {
    const iso   = isoStr(date)
    const entry = eventDates.find(e => e.date === iso)
    if (!entry) return null
    const approved  = applications.filter(a => a.requested_date === iso && a.status === 'approved')
    const pending   = applications.filter(a => a.requested_date === iso && a.status === 'pending')
    const cap       = entry.capacity || 1
    const slotsLeft = cap - approved.length
    return { iso, entry, approved, pending, cap, slotsLeft, isFull: slotsLeft <= 0 }
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const selData = selected ? (() => {
    const entry    = eventDates.find(e => e.date === selected)
    if (!entry) return null
    const approved  = applications.filter(a => a.requested_date === selected && a.status === 'approved')
    const pending   = applications.filter(a => a.requested_date === selected && a.status === 'pending')
    const cap       = entry.capacity || 1
    const slotsLeft = cap - approved.length
    return { entry, approved, pending, cap, slotsLeft, isFull: slotsLeft <= 0 }
  })() : null

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #e8e0d0', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button style={s.navBtn} onClick={() => setCurrent(new Date(year, month - 1, 1))}>‹</button>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#1a1208' }}>
            {MONTHS[month]} {year}
          </span>
          <button style={s.navBtn} onClick={() => setCurrent(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <button style={s.btnRemove} onClick={onClearPast}>Clear past dates</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
          {DAYS.map(d => <div key={d} style={s.dayHead}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {cells.map((date, i) => {
            if (!date) return <div key={`e${i}`} />
            const data = getDateData(date)
            const iso  = isoStr(date)
            const isPast     = date < today && date.toDateString() !== today.toDateString()
            const isSelected = selected === iso
            if (!data) {
              return (
                <div key={i} onClick={() => !isPast && setSelected(isSelected ? null : iso)}
                  className="oc-cell"
                  style={{ ...s.ocCell, opacity: isPast ? 0.4 : 1, cursor: isPast ? 'default' : 'pointer' }}>
                  <span style={s.ocNum}>{date.getDate()}</span>
                </div>
              )
            }
            return (
              <div key={i} onClick={() => setSelected(isSelected ? null : iso)}
                className="oc-cell"
                style={{ ...s.ocCell, background: data.isFull ? '#fef0f0' : '#edfaf3', border: `1.5px solid ${isSelected ? '#C41230' : (data.isFull ? '#f0c0c0' : '#b8e8cc')}`, cursor: 'pointer', opacity: isPast ? 0.6 : 1, boxShadow: isSelected ? '0 0 0 2px #C41230' : 'none' }}>
                <span style={s.ocNum}>{date.getDate()}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: data.isFull ? '#C41230' : '#1a6e3e' }}>
                  {data.approved.length}/{data.cap}
                </span>
                {data.pending.length > 0 && (
                  <span style={{ fontSize: '0.55rem', background: '#F5A800', color: '#fff', borderRadius: 100, padding: '1px 5px', fontWeight: 700, lineHeight: 1.5 }}>
                    {data.pending.length}▲
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '0.75rem', textAlign: 'right', fontSize: '0.72rem', color: '#bbb' }}>
          Click any date to add or manage
        </div>
      </div>

      {selected && !selData && (
        <div style={{ background: '#fff', border: '1.5px solid #1a8a4a', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1208', margin: '0 0 0.75rem' }}>Add {selected} to calendar</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={s.label}>Slots</label>
              <input type="number" value={newCap} min={1} max={20}
                onChange={e => setNewCap(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ ...s.input, width: 70 }} />
            </div>
            <button style={s.btnApprove} onClick={() => { onAddDate(selected, newCap); setNewCap(1) }}>+ Add Date</button>
            <button style={s.btnCancel} onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </div>
      )}

      {selected && selData && (
        <div style={{ background: '#fff', border: '1.5px solid #C41230', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1208', margin: 0 }}>{selected}</h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b6055', display: 'flex', alignItems: 'center', gap: 4 }}>
                Slots:
                <button style={s.capBtn} onClick={() => onUpdateCapacity(selData.entry.id, Math.max(selData.approved.length, selData.cap - 1))}>−</button>
                <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{selData.cap}</span>
                <button style={s.capBtn} onClick={() => onUpdateCapacity(selData.entry.id, selData.cap + 1)}>+</button>
              </span>
              {selData.approved.length === 0 ? (
                <button style={s.btnRemove} onClick={() => { onRemoveDate(selData.entry.id); setSelected(null) }}>Remove Date</button>
              ) : (
                <span style={{ fontSize: '0.72rem', color: '#999' }}>Cancel bookings to remove</span>
              )}
            </div>
          </div>
          {selData.approved.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={s.sectionLabel}>Approved — {selData.approved.length} of {selData.cap} slot{selData.cap > 1 ? 's' : ''} filled</div>
              {selData.approved.map(app => (
                <div key={app.id} style={{ ...s.appRow, background: '#edfaf3', border: '1px solid #b8e8cc' }}>
                  <span style={s.appName}>{app.business_name} <span style={{ fontWeight: 400, color: '#6b6055' }}>· {app.cuisine}</span></span>
                  <button style={s.btnCancel} onClick={() => onCancel(app)}>Cancel</button>
                </div>
              ))}
            </div>
          )}
          {selData.pending.length > 0 && (
            <div>
              <div style={s.sectionLabel}>Pending ({selData.pending.length})</div>
              {selData.pending.map(app => (
                <div key={app.id} style={{ ...s.appRow, background: '#fff8e6', border: '1px solid #f0d88a' }}>
                  <span style={s.appName}>{app.business_name} <span style={{ fontWeight: 400, color: '#6b6055' }}>· {app.cuisine}</span></span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {selData.slotsLeft > 0 && <button style={s.btnApprove} onClick={() => onApprove(app)}>✓ Approve</button>}
                    <button style={s.btnDecline} onClick={() => onDecline(app)}>✗ Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selData.approved.length === 0 && selData.pending.length === 0 && (
            <p style={{ color: '#6b6055', fontSize: '0.85rem', margin: 0 }}>No applications for this date.</p>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  center:      { textAlign: 'center', padding: '4rem', color: '#6b6055' },
  loginPage:   { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem', background: '#fffdf7' },
  loginCard:   { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  loginTitle:  { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#1a1208', marginBottom: 6 },
  loginSub:    { color: '#6b6055', fontSize: '0.85rem', marginBottom: '1.5rem' },
  field:       { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' },
  label:       { fontSize: '0.82rem', fontWeight: 600, color: '#1a1208', marginBottom: 2, display: 'block' },
  input:       { border: '1.5px solid #e8e0d0', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.9rem', outline: 'none', color: '#1a1208', background: '#fff', boxSizing: 'border-box' },
  errBox:      { background: '#fef0f0', border: '1px solid #f0c0c0', borderRadius: 8, padding: '0.65rem 1rem', color: '#C41230', fontSize: '0.85rem', marginBottom: '1rem' },
  statCard:    { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 10, padding: '1rem 1.2rem' },
  tab:         { background: 'transparent', border: '1.5px solid #e8e0d0', borderRadius: 8, padding: '0.45rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, color: '#6b6055', cursor: 'pointer' },
  tabActive:   { background: '#C41230', border: '1.5px solid #C41230', color: '#fff' },
  filters:     { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', background: '#fff', border: '1px solid #e8e0d0', borderRadius: 10, padding: '0.9rem 1.1rem' },
  filterRow:   { display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' },
  filterScroll:{ display: 'flex', gap: '0.4rem', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 2, WebkitOverflowScrolling: 'touch' },
  filterLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#6b6055', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 56, flexShrink: 0 },
  chip:        { background: '#f5f0e8', border: '1px solid #e8e0d0', borderRadius: 100, padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b6055', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },
  chipActive:  { background: '#C41230', border: '1px solid #C41230', color: '#fff', fontWeight: 700 },
  card:        { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 12, overflow: 'hidden', padding: 0 },
  row:         { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.2rem', cursor: 'pointer', flexWrap: 'wrap' },
  detail:      { borderTop: '1px solid #e8e0d0', padding: '1.2rem', background: '#fdfaf6' },
  navBtn:      { background: '#f5f0e8', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: '1.1rem', cursor: 'pointer', color: '#1a1208' },
  dayHead:     { textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#6b6055', padding: '0.3rem 0', textTransform: 'uppercase' },
  ocCell:      { minHeight: 58, borderRadius: 8, padding: '0.35rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 2, background: '#f5f0e8', border: '1.5px solid transparent' },
  ocNum:       { fontSize: '0.8rem', fontWeight: 600, color: '#1a1208', lineHeight: 1 },
  sectionLabel:{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#6b6055', marginBottom: '0.4rem' },
  appRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 8, marginBottom: '0.4rem', gap: '0.5rem', flexWrap: 'wrap' },
  appName:     { fontWeight: 600, fontSize: '0.88rem', color: '#1a1208' },
  capBtn:      { background: '#f5f0e8', border: '1px solid #e8e0d0', borderRadius: 4, width: 22, height: 22, fontSize: '0.9rem', cursor: 'pointer', lineHeight: 1, padding: 0, marginLeft: 4, marginRight: 4 },
  btnPrimary:  { background: '#C41230', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.4rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },
  btnExport:   { background: 'transparent', border: '1px solid #e8e0d0', borderRadius: 8, padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1208', cursor: 'pointer' },
  btnLogout:   { background: 'transparent', border: '1px solid #e8e0d0', borderRadius: 8, padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, color: '#6b6055', cursor: 'pointer' },
  btnApprove:  { background: '#1a8a4a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.45rem 1rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' },
  btnDecline:  { background: 'transparent', color: '#C41230', border: '1px solid #C41230', borderRadius: 8, padding: '0.45rem 1rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' },
  btnCancel:   { background: 'transparent', color: '#6b6055', border: '1px solid #ccc', borderRadius: 8, padding: '0.45rem 1rem', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' },
  btnRemove:   { background: 'transparent', color: '#C41230', border: '1px solid #f0c0c0', borderRadius: 6, padding: '0.3rem 0.8rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
}
