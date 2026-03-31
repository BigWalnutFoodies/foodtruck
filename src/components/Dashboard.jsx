import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const isoStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`

// ─── Auth wrapper ─────────────────────────────────────────────────────────────

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

// ─── Login ────────────────────────────────────────────────────────────────────

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

// ─── Dashboard content ────────────────────────────────────────────────────────

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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = async () => {
    const [{ data: apps }, { data: dates }] = await Promise.all([
      supabase.from('applications').select('*').order('submitted_at', { ascending: false }),
      supabase.from('event_dates').select('*').order('date', { ascending: true }),
    ])
    setApplications(apps || [])
    setEventDates(dates || [])
    setLoadingData(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleApprove = async (app) => {
    await supabase.from('applications').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', app.id)
    await fetchAll()
    showToast('✓ Application approved')
    try {
      await supabase.functions.invoke('notify-approved', {
        body: { businessName: app.business_name, email: app.email, contact: app.contact_name, requestedDate: app.requested_date },
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

  const exportPhones = () => {
    const csv = 'Business,Contact,Phone\n' +
      applications.map(a => `"${a.business_name}","${a.contact_name}","${a.phone}"`).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'truck-phones.csv'
    a.click()
  }

  const filtered = applications.filter(a => {
    if (statusFilter !== 'All' && a.status !== statusFilter.toLowerCase()) return false
    if (cuisineFilter !== 'All' && a.cuisine !== cuisineFilter) return false
    return true
  })

  const counts = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    declined: applications.filter(a => a.status === 'declined').length,
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem', background: '#fffdf7', minHeight: '80vh' }}>

      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 999, background: toast.type === 'error' ? '#C41230' : '#1a8a4a', color: '#fff', padding: '0.65rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#1a1208' }}>Organiser Dashboard</h2>
          <p style={{ color: '#6b6055', fontSize: '0.82rem' }}>{session.user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button style={s.btnExport} onClick={exportPhones}>↓ Export Phones</button>
          <button style={s.btnLogout} onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',    val: counts.total,    color: '#1a1208' },
          { label: 'Pending',  val: counts.pending,  color: '#996600' },
          { label: 'Approved', val: counts.approved, color: '#1a6e3e' },
          { label: 'Declined', val: counts.declined, color: '#a00f25' },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.val}</div>
            <div style={{ fontSize: '0.78rem', color: '#6b6055', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[['applications','Applications'], ['schedule','Schedule']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {loadingData ? (
        <div style={s.center}>Loading…</div>
      ) : tab === 'applications' ? (
        <>
          {/* Filters */}
          <div style={s.filters}>
            <div style={s.filterGroup}>
              <span style={s.filterLabel}>Status:</span>
              {['All','pending','approved','declined','cancelled'].map(f => (
                <button key={f} style={statusFilter === f ? { ...s.chip, ...s.chipActive } : s.chip}
                  onClick={() => setStatusFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div style={s.filterGroup}>
              <span style={s.filterLabel}>Cuisine:</span>
              {CUISINE_FILTERS.slice(0,6).map(f => (
                <button key={f} style={cuisineFilter === f ? { ...s.chip, ...s.chipActive } : s.chip}
                  onClick={() => setCuisineFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          {/* Application rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(app => {
              const st     = STATUS[app.status] || STATUS.pending
              const isOpen = expanded === app.id
              return (
                <div key={app.id} style={s.card}>
                  <div style={s.row} onClick={() => setExpanded(isOpen ? null : app.id)}>
                    <div style={{ fontSize: '1.5rem' }}>🚚</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1208' }}>{app.business_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b6055' }}>{app.cuisine} · {app.requested_date}</div>
                    </div>
                    <span style={{ background: st.bg, color: st.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                      {st.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b6055', whiteSpace: 'nowrap' }}>
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </span>
                    <span style={{ color: '#6b6055', fontSize: '0.75rem' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>

                  {isOpen && (
                    <div style={s.detail}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem', marginBottom: '1rem' }}>
                        {[
                          ['Email', app.email],
                          ['Phone', app.phone],
                          ['Day-of contact', app.contact_name],
                          ['Years in business', app.years_in_biz],
                          ['Instagram', app.instagram],
                          ['Menu', app.menu_link],
                        ].map(([label, val]) => val ? (
                          <div key={label} style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b6055', textTransform: 'uppercase', minWidth: 110 }}>{label}</span>
                            <span style={{ fontSize: '0.85rem', color: '#1a1208', wordBreak: 'break-all' }}>{val}</span>
                          </div>
                        ) : null)}
                      </div>
                      {app.bio && (
                        <div style={{ background: '#f5f0e8', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#3a2e20', marginBottom: '1rem', lineHeight: 1.6 }}>
                          <strong>Bio: </strong>{app.bio}
                        </div>
                      )}
                      {app.logo_url && (
                        <div style={{ marginBottom: '1rem' }}>
                          <img src={app.logo_url} alt="Truck logo" style={{ maxHeight: 80, maxWidth: 200, borderRadius: 8, border: '1px solid #e8e0d0' }} />
                        </div>
                      )}
                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button style={s.btnApprove} onClick={() => handleApprove(app)}>✓ Approve</button>
                          <button style={s.btnDecline} onClick={() => handleDecline(app)}>✗ Decline</button>
                        </div>
                      )}
                      {app.status === 'approved' && (
                        <button style={s.btnCancel} onClick={() => handleCancel(app)}>Cancel Booking</button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6055', border: '1px dashed #e8e0d0', borderRadius: 12 }}>
                No applications match the current filters.
              </div>
            )}
          </div>
        </>
      ) : (
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
      )}
    </div>
  )
}

// ─── Organiser Calendar ───────────────────────────────────────────────────────

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
      {/* Calendar card */}
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
                <div key={i}
                  onClick={() => !isPast && setSelected(isSelected ? null : iso)}
                  style={{ ...s.ocCell, opacity: isPast ? 0.4 : 1, cursor: isPast ? 'default' : 'pointer' }}>
                  <span style={s.ocNum}>{date.getDate()}</span>
                </div>
              )
            }

            return (
              <div key={i}
                onClick={() => setSelected(isSelected ? null : iso)}
                style={{
                  ...s.ocCell,
                  background:  data.isFull ? '#fef0f0' : '#edfaf3',
                  border:      `1.5px solid ${isSelected ? '#C41230' : (data.isFull ? '#f0c0c0' : '#b8e8cc')}`,
                  cursor:      'pointer',
                  opacity:     isPast ? 0.6 : 1,
                  boxShadow:   isSelected ? '0 0 0 2px #C41230' : 'none',
                }}
              >
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

        <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#6b6055', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a8a4a', display: 'inline-block' }} /> Available slots</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C41230', display: 'inline-block' }} /> Full</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5A800', display: 'inline-block' }} /> Pending</span>
          <span style={{ marginLeft: 'auto', color: '#bbb' }}>Click any date to add or manage</span>
        </div>
      </div>

      {/* Add date panel — shown when clicking an empty cell */}
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
            <button style={s.btnApprove} onClick={() => { onAddDate(selected, newCap); setNewCap(1) }}>
              + Add Date
            </button>
            <button style={s.btnCancel} onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Selected date panel */}
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
                <button style={s.btnRemove} onClick={() => { onRemoveDate(selData.entry.id); setSelected(null) }}>
                  Remove Date
                </button>
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
                    {selData.slotsLeft > 0 && (
                      <button style={s.btnApprove} onClick={() => onApprove(app)}>✓ Approve</button>
                    )}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  filterGroup: { display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' },
  filterLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#6b6055', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 56 },
  chip:        { background: '#f5f0e8', border: '1px solid #e8e0d0', borderRadius: 100, padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b6055', cursor: 'pointer' },
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
