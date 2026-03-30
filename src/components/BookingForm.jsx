import React, { useState } from 'react'

// Pre-filled demo data so reviewers can see the form in action immediately
const DEMO_DATA = {
  businessName: 'Taco Loco',
  email: 'maria@tacoloco.com',
  phone: '415-555-0101',
  contact: 'Maria Garcia',
  yearsInBusiness: '4',
  menuLink: 'https://tacoloco.com/menu',
  instagram: '@tacoloco',
  facebook: 'facebook.com/tacoloco',
  bio: 'Authentic Mexican street tacos with housemade salsas and fresh tortillas. Award-winning al pastor and vegetarian options available.',
  references: 'SoMa Street Food Park 2023, Off the Grid SF 2024',
  cuisine: 'Mexican',
  requestedDate: (() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })(),
}

export default function BookingForm({ onSubmit, onCancel, bookedDates }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(DEMO_DATA)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate1 = () => {
    const e = {}
    if (!form.businessName.trim()) e.businessName = 'Required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.contact.trim()) e.contact = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validate2 = () => {
    const e = {}
    if (!form.requestedDate) e.requestedDate = 'Please select a date'
    if (!form.cuisine) e.cuisine = 'Please select a cuisine type'
    if (!form.bio.trim()) e.bio = 'Please add a short bio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate1()) setStep(2) }
  const handleSubmit = () => {
    if (validate2()) onSubmit({ ...form, requestedDate: new Date(form.requestedDate + 'T12:00:00').toDateString() })
  }

  const Field = ({ label, k, type = 'text', placeholder, required, hint }) => (
    <div style={styles.field}>
      <label style={styles.label}>{label}{required && <span style={{ color: '#ff5c1a' }}> *</span>}</label>
      {hint && <span style={styles.hint}>{hint}</span>}
      <input
        type={type} value={form[k]} placeholder={placeholder}
        onChange={e => set(k, e.target.value)}
        style={{ ...styles.input, ...(errors[k] ? styles.inputErr : {}) }}
      />
      {errors[k] && <span style={styles.errMsg}>{errors[k]}</span>}
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.back} onClick={onCancel}>← Back to calendar</button>

        {/* Demo notice */}
        <div style={styles.demoNotice}>
          ✨ <strong>Demo:</strong> This form is pre-filled with sample data so you can explore it instantly. Hit <strong>Next Step</strong> then <strong>Submit Request</strong> to see the full flow.
        </div>

        <div style={styles.formCard}>
          {/* Progress */}
          <div style={styles.progress}>
            {[1, 2].map(n => (
              <div key={n} style={styles.progressStep}>
                <div style={{ ...styles.progressDot, ...(step >= n ? styles.progressDotActive : {}) }}>{n}</div>
                <span style={{ ...styles.progressLabel, ...(step >= n ? styles.progressLabelActive : {}) }}>
                  {n === 1 ? 'Your Details' : 'Date & Info'}
                </span>
              </div>
            ))}
            <div style={styles.progressLine} />
          </div>

          {step === 1 && (
            <>
              <h2 style={styles.h2}>Tell us about your truck</h2>
              <p style={styles.sub}>Basic contact info so we can get in touch.</p>
              <div style={styles.grid2}>
                <Field label="Business Name" k="businessName" placeholder="Taco Loco" required />
                <div style={styles.field}>
                  <label style={styles.label}>Cuisine Type <span style={{ color: '#ff5c1a' }}>*</span></label>
                  <select
                    value={form.cuisine}
                    onChange={e => set('cuisine', e.target.value)}
                    style={{ ...styles.input, ...(errors.cuisine ? styles.inputErr : {}) }}
                  >
                    <option value="">Select cuisine...</option>
                    {['American','Mexican','Korean','Indian','Italian','Thai','Mediterranean','BBQ','Desserts','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.cuisine && <span style={styles.errMsg}>{errors.cuisine}</span>}
                </div>
              </div>
              <div style={styles.grid2}>
                <Field label="Email Address" k="email" type="email" placeholder="you@yourtruck.com" required />
                <Field label="Phone Number" k="phone" type="tel" placeholder="415-555-0100" required />
              </div>
              <Field label="Day-of Contact Name" k="contact" placeholder="Who should we call on event day?" required />
              <Field label="Years in Business" k="yearsInBusiness" type="number" placeholder="e.g. 3" />
              <div style={styles.btnRow}>
                <button style={styles.btnGhost} onClick={onCancel}>Cancel</button>
                <button style={styles.btnPrimary} onClick={handleNext}>Next Step →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={styles.h2}>Date & truck details</h2>
              <p style={styles.sub}>Pick your preferred date and share a bit more about your menu.</p>

              <div style={styles.field}>
                <label style={styles.label}>Preferred Date <span style={{ color: '#ff5c1a' }}>*</span></label>
                <span style={styles.hint}>Booked dates are unavailable. We'll confirm within 24 hours.</span>
                <input
                  type="date"
                  value={form.requestedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('requestedDate', e.target.value)}
                  style={{ ...styles.input, ...(errors.requestedDate ? styles.inputErr : {}) }}
                />
                {errors.requestedDate && <span style={styles.errMsg}>{errors.requestedDate}</span>}
              </div>

              <Field label="Menu Link" k="menuLink" placeholder="https://yourtruck.com/menu" hint="Link to your online menu" />
              <div style={styles.grid2}>
                <Field label="Instagram" k="instagram" placeholder="@yourtruck" />
                <Field label="Facebook" k="facebook" placeholder="facebook.com/yourtruck" />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Short Bio <span style={{ color: '#ff5c1a' }}>*</span></label>
                <span style={styles.hint}>Tell us what makes your truck special (2–3 sentences)</span>
                <textarea
                  rows={4} value={form.bio}
                  placeholder="We serve authentic street tacos..."
                  onChange={e => set('bio', e.target.value)}
                  style={{ ...styles.input, ...styles.textarea, ...(errors.bio ? styles.inputErr : {}) }}
                />
                {errors.bio && <span style={styles.errMsg}>{errors.bio}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>References <span style={styles.optional}>(optional)</span></label>
                <textarea
                  rows={2} value={form.references}
                  placeholder="Names or links to past events / reviews"
                  onChange={e => set('references', e.target.value)}
                  style={{ ...styles.input, ...styles.textarea }}
                />
              </div>

              <div style={styles.noticeBox}>
                📧 You'll receive an email confirmation once submitted.<br />
                📱 We'll also send you an SMS update when your request is reviewed.
              </div>

              <div style={styles.btnRow}>
                <button style={styles.btnGhost} onClick={() => setStep(1)}>← Back</button>
                <button style={styles.btnPrimary} onClick={handleSubmit}>Submit Request ✓</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '2.5rem 2rem 5rem', minHeight: '80vh', background: '#fffdf7' },
  container: { maxWidth: 680, margin: '0 auto' },
  back: {
    background: 'transparent', border: '1px solid #e8e0d0',
    borderRadius: 8, padding: '0.45rem 1rem',
    color: '#8a7f6e', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem',
  },
  demoNotice: {
    background: '#fff8e6', border: '1px solid #ffe0a0',
    borderRadius: 10, padding: '0.75rem 1.1rem',
    fontSize: '0.85rem', color: '#7a5a00', marginBottom: '1.2rem', lineHeight: 1.6,
  },
  formCard: {
    background: '#fff', border: '1px solid #e8e0d0',
    borderRadius: 16, padding: '2rem',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
  },
  progress: {
    display: 'flex', gap: '2rem', alignItems: 'center',
    marginBottom: '2rem', position: 'relative',
  },
  progressStep: { display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 },
  progressDot: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#e8e0d0', color: '#8a7f6e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 700,
  },
  progressDotActive: { background: '#ff5c1a', color: '#fff' },
  progressLabel: { fontSize: '0.82rem', color: '#8a7f6e', fontWeight: 500 },
  progressLabelActive: { color: '#ff5c1a', fontWeight: 700 },
  progressLine: {
    position: 'absolute', left: 28, right: 0, height: 2,
    background: '#e8e0d0', zIndex: 0, top: 14,
  },
  h2: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', marginBottom: 6 },
  sub: { color: '#8a7f6e', fontSize: '0.9rem', marginBottom: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#1a1208' },
  hint: { fontSize: '0.75rem', color: '#8a7f6e' },
  optional: { color: '#8a7f6e', fontWeight: 400 },
  input: {
    border: '1.5px solid #e8e0d0', borderRadius: 8,
    padding: '0.6rem 0.9rem', fontSize: '0.9rem',
    outline: 'none', color: '#1a1208', background: '#fff', width: '100%',
  },
  inputErr: { border: '1.5px solid #e03030' },
  textarea: { resize: 'vertical', minHeight: 80 },
  errMsg: { color: '#e03030', fontSize: '0.75rem' },
  noticeBox: {
    background: '#fff8e6', border: '1px solid #ffe0a0',
    borderRadius: 10, padding: '0.9rem 1.1rem',
    fontSize: '0.85rem', color: '#6a5a1a', lineHeight: 1.8,
    marginBottom: '1.5rem',
  },
  btnRow: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' },
  btnPrimary: {
    background: '#ff5c1a', color: '#fff',
    border: 'none', borderRadius: 10,
    padding: '0.75rem 1.8rem', fontWeight: 700,
    fontSize: '0.95rem', cursor: 'pointer',
  },
  btnGhost: {
    background: 'transparent', color: '#8a7f6e',
    border: '1px solid #e8e0d0', borderRadius: 10,
    padding: '0.75rem 1.4rem', fontWeight: 600,
    fontSize: '0.95rem', cursor: 'pointer',
  },
}
