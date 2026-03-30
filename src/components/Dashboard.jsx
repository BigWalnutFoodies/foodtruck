import React, { useState } from 'react'

const STATUS = {
  pending:  { label: 'Pending',  bg: '#fff8e6', color: '#b87800', dot: '#ffb800' },
  approved: { label: 'Approved', bg: '#edfaf3', color: '#22a05a', dot: '#22a05a' },
  declined: { label: 'Declined', bg: '#fef0f0', color: '#c02020', dot: '#e03030' },
}

const CUISINE_FILTERS = ['All', 'American', 'Mexican', 'Korean', 'Indian', 'Italian', 'Thai', 'Mediterranean', 'BBQ', 'Desserts', 'Other']

const MOCK_SUBMISSIONS = [
  {
    id: 1, status: 'pending',
    businessName: 'Taco Loco', email: 'maria@tacoloco.com', phone: '415-555-0101',
    contact: 'Maria Garcia', yearsInBusiness: '4', menuLink: 'https://tacoloco.com/menu',
    instagram: '@tacoloco', bio: 'Authentic Mexican street tacos with housemade salsas.',
    cuisine: 'Mexican', requestedDate: 'April 12, 2026', submitted: 'March 28, 2026',
  },
  {
    id: 2, status: 'approved',
    businessName: 'Seoul Bowl', email: 'hello@seoulbowl.com', phone: '415-555-0202',
    contact: 'Jin Park', yearsInBusiness: '2', menuLink: 'https://seoulbowl.com',
    instagram: '@seoulbowlsf', bio: 'Korean-fusion rice bowls and bao buns.',
    cuisine: 'Korean', requestedDate: 'April 19, 2026', submitted: 'March 25, 2026',
  },
  {
    id: 3, status: 'pending',
    businessName: 'The Grilled Cheese Co.', email: 'gcco@email.com', phone: '650-555-0303',
    contact: 'Sam T.', yearsInBusiness: '6', menuLink: 'https://grilledco.com',
    instagram: '@grilledcheeseco', bio: 'Gourmet grilled cheese with rotating seasonal ingredients.',
    cuisine: 'American', requestedDate: 'April 26, 2026', submitted: 'March 30, 2026',
  },
  {
    id: 4, status: 'declined',
    businessName: 'Bombay Bites', email: 'bombay@bites.in', phone: '408-555-0404',
    contact: 'Priya S.', yearsInBusiness: '1', menuLink: 'https://bombaybites.com',
    instagram: '@bombaybites', bio: 'Modern Indian street food — samosas, chaat, chai.',
    cuisine: 'Indian', requestedDate: 'April 12, 2026', submitted: 'March 20, 2026',
  },
]

export default function Dashboard({ view, setView }) {
  const [submissions, setSubmissions] = useState(
    JSON.parse(localStorage.getItem('foodtruck_submissions') || 'null') || MOCK_SUBMISSIONS
  )
  const [statusFilter, setStatusFilter] = useState('All')
  const [cuisineFilter, setCuisineFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const updateStatus = (id, status) => {
    const updated = submissions.map(s => s.id === id ? { ...s, status } : s)
    setSubmissions(updated)
    localStorage.setItem('foodtruck_submissions', JSON.stringify(updated))
    showToast(status === 'approved' ? '✓ Truck approved' : 'Truck declined')
  }

  const exportPhones = () => {
    const csv = 'Business,Phone\n' + submissions.map(s => `${s.businessName},${s.phone}`).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'truck-phones.csv'
    a.click()
  }

  const filtered = submissions.filter(s => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false
    if (cuisineFilter !== 'All' && s.cuisine !== cuisineFilter) return false
    return true
  })

  const counts = {
    total:    submissions.length,
    pending:  submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    declined: submissions.filter(s => s.status === 'declined').length,
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>

      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 999, background: toast.type === 'error' ? '#e03030' : '#22a05a', color: '#fff', padding: '0.65rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', color: '#1a1208' }}>Operator Dashboard</h2>
          <p style={{ color: '#8a7f6e', fontSize: '0.85rem' }}>Review and manage food truck applications</p>
        </div>
        <button style={s.btnExport} onClick={exportPhones}>↓ Export Phone Numbers</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',    val: counts.total,    color: '#1a1208' },
          { label: 'Pending',  val: counts.pending,  color: '#b87800' },
          { label: 'Approved', val: counts.approved, color: '#22a05a' },
          { label: 'Declined', val: counts.declined, color: '#e03030' },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.val}</div>
            <div style={{ fontSize: '0.78rem', color: '#8a7f6e', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filters}>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Status:</span>
          {['All', 'pending', 'approved', 'declined'].map(f => (
            <button key={f} style={statusFilter === f ? { ...s.chip, ...s.chipActive } : s.chip} onClick={() => setStatusFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Cuisine:</span>
          {CUISINE_FILTERS.slice(0, 6).map(f => (
            <button key={f} style={cuisineFilter === f ? { ...s.chip, ...s.chipActive } : s.chip} onClick={() => setCuisineFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(sub => {
          const st = STATUS[sub.status]
          const isOpen = expanded === sub.id
          return (
            <div key={sub.id} style={s.card}>
              {/* Row */}
              <div style={s.row} onClick={() => setExpanded(isOpen ? null : sub.id)}>
                <div style={{ fontSize: '1.5rem' }}>🚚</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sub.businessName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8a7f6e' }}>{sub.cuisine} · {sub.requestedDate}</div>
                </div>
                <span style={{ background: st.bg, color: st.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot }} />
                  {st.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8a7f6e' }}>Submitted {sub.submitted}</span>
                <span style={{ color: '#8a7f6e', fontSize: '0.7rem' }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={s.detail}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem', marginBottom: '1rem' }}>
                    {[
                      ['Email', sub.email],
                      ['Phone', sub.phone],
                      ['Day-of contact', sub.contact],
                      ['Years in business', sub.yearsInBusiness],
                      ['Instagram', sub.instagram],
                      ['Menu', sub.menuLink],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8a7f6e', textTransform: 'uppercase', minWidth: 110 }}>{label}</span>
                        <span style={{ fontSize: '0.85rem', color: '#1a1208' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#f5f0e8', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#3a3020', marginBottom: '1rem', lineHeight: 1.6 }}>
                    <strong>Bio: </strong>{sub.bio}
                  </div>
                  {sub.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button style={s.btnApprove} onClick={() => updateStatus(sub.id, 'approved')}>✓ Approve</button>
                      <button style={s.btnDecline} onClick={() => updateStatus(sub.id, 'declined')}>✗ Decline</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a7f6e', border: '1px dashed #e8e0d0', borderRadius: 12 }}>
            No submissions match the current filters.
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  statCard: { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 10, padding: '1rem 1.2rem' },
  filters: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', background: '#fff', border: '1px solid #e8e0d0', borderRadius: 10, padding: '0.9rem 1.1rem' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' },
  filterLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#8a7f6e', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 56 },
  chip: { background: '#f5f0e8', border: '1px solid #e8e0d0', borderRadius: 100, padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 500, color: '#8a7f6e', cursor: 'pointer' },
  chipActive: { background: '#ff5c1a', border: '1px solid #ff5c1a', color: '#fff', fontWeight: 700 },
  card: { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 12, overflow: 'hidden' },
  row: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.2rem', cursor: 'pointer', flexWrap: 'wrap' },
  detail: { borderTop: '1px solid #e8e0d0', padding: '1.2rem', background: '#fdfaf6' },
  btnExport: { background: 'transparent', border: '1px solid #e8e0d0', borderRadius: 8, padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1208', cursor: 'pointer' },
  btnApprove: { background: '#22a05a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.55rem 1.3rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' },
  btnDecline: { background: 'transparent', color: '#e03030', border: '1px solid #e03030', borderRadius: 8, padding: '0.55rem 1.3rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' },
}
