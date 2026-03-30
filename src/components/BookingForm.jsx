import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DEMO_DATA = {
  businessName: 'Taco Loco', email: 'maria@tacoloco.com', phone: '415-555-0101',
  contact: 'Maria Garcia', yearsInBusiness: '4', menuLink: 'https://tacoloco.com/menu',
  instagram: '@tacoloco', facebook: 'facebook.com/tacoloco',
  bio: 'Authentic Mexican street tacos with housemade salsas and fresh tortillas. Award-winning al pastor and vegetarian options available.',
  references: 'SoMa Street Food Park 2023, Off the Grid SF 2024', cuisine: 'Mexican',
  requestedDate: (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0] })(),
}

export default function BookingForm({ onSubmit, bookedDates }) {
  const navigate = useNavigate()
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
    setErrors(e); return Object.keys(e).length === 0
  }
  const validate2 = () => {
    const e = {}
    if (!form.requestedDate) e.requestedDate = 'Please select a date'
    if (!form.cuisine) e.cuisine = 'Please select a cuisine type'
    if (!form.bio.trim()) e.bio = 'Please add a short bio'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleNext   = () => { if (validate1()) setStep(2) }
  const handleSubmit = () => {
    if (validate2()) {
      onSubmit({ ...form, requestedDate: new Date(form.requestedDate + 'T12:00:00').toDateString() })
      navigate('/')
    }
  }

  const Field = ({ label, k, type = 'text', placeholder, required, hint }) => (
    <div style={s.field}>
      <label style={s.label}>{label}{required && <span style={{ color: '#C41230' }}> *</span>}</label>
      {hint && <span style={s.hint}>{hint}</span>}
      <input type={type} value={form[k]} placeholder={placeholder} onChange={e => set(k, e.target.value)}
        style={{ ...s.input, ...(errors[k] ? s.inputErr : {}) }} />
      {errors[k] && <span style={s.errMsg}>{errors[k]}</span>}
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.back} onClick={() => navigate('/')}>← Back to calendar</button>
        <div style={s.demoNotice}>
          ✨ <strong>Demo:</strong> Pre-filled with sample data. Hit <strong>Next Step</strong> then <strong>Submit Request</strong> to see the full flow.
        </div>
        <div style={s.formCard}>
          <div style={s.progress}>
            {[1, 2].map(n => (
              <div key={n} style={s.progressStep}>
                <div style={{ ...s.progressDot, ...(step >= n ? s.progressDotActive : {}) }}>{n}</div>
                <span style={{ ...s.progressLabel, ...(step >= n ? s.progressLabelActive : {}) }}>
                  {n === 1 ? 'Your Details' : 'Date & Info'}
                </span>
              </div>
            ))}
            <div style={s.progressLine} />
          </div>

          {step === 1 && (
            <>
              <h2 style={s.h2}>Tell us about your truck</h2>
              <p style={s.sub}>Basic contact info so we can get in touch.</p>
              <div style={s.grid2}>
                <Field label="Business Name" k="businessName" placeholder="Taco Loco" required />
                <div style={s.field}>
                  <label style={s.label}>Cuisine Type <span style={{ color: '#C41230' }}>*</span></label>
                  <select value={form.cuisine} onChange={e => set('cuisine', e.target.value)}
                    style={{ ...s.input, ...(errors.cuisine ? s.inputErr : {}) }}>
                    <option value="">Select cuisine...</option>
                    {['American','Mexican','Korean','Indian','Italian','Thai','Mediterranean','BBQ','Desserts','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.cuisine && <span style={s.errMsg}>{errors.cuisine}</span>}
                </div>
              </div>
              <div style={s.grid2}>
                <Field label="Email Address" k="email" type="email" placeholder="you@yourtruck.com" required />
                <Field label="Phone Number"  k="phone" type="tel"   placeholder="415-555-0100" required />
              </div>
              <Field label="Day-of Contact Name" k="contact" placeholder="Who should we call on event day?" required />
              <Field label="Years in Business"   k="yearsInBusiness" type="number" placeholder="e.g. 3" />
              <div style={s.btnRow}>
                <button style={s.btnGhost}   onClick={() => navigate('/')}>Cancel</button>
                <button style={s.btnPrimary} onClick={handleNext}>Next Step →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={s.h2}>Date & truck details</h2>
              <p style={s.sub}>Pick your preferred date and share a bit more about your menu.</p>
              <div style={s.field}>
                <label style={s.label}>Preferred Date <span style={{ color: '#C41230' }}>*</span></label>
                <span style={s.hint}>We'll confirm within 24 hours.</span>
                <input type="date" value={form.requestedDate} min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('requestedDate', e.target.value)}
                  style={{ ...s.input, ...(errors.requestedDate ? s.inputErr : {}) }} />
                {errors.requestedDate && <span style={s.errMsg}>{errors.requestedDate}</span>}
              </div>
              <Field label="Menu Link" k="menuLink" placeholder="https://yourtruck.com/menu" hint="Link to your online menu" />
              <div style={s.grid2}>
                <Field label="Instagram" k="instagram" placeholder="@yourtruck" />
                <Field label="Facebook"  k="facebook"  placeholder="facebook.com/yourtruck" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Short Bio <span style={{ color: '#C41230' }}>*</span></label>
                <span style={s.hint}>Tell us what makes your truck special (2–3 sentences)</span>
                <textarea rows={4} value={form.bio} placeholder="We serve authentic street tacos..."
                  onChange={e => set('bio', e.target.value)}
                  style={{ ...s.input, ...s.textarea, ...(errors.bio ? s.inputErr : {}) }} />
                {errors.bio && <span style={s.errMsg}>{errors.bio}</span>}
              </div>
              <div style={s.field}>
                <label style={s.label}>References <span style={s.optional}>(optional)</span></label>
                <textarea rows={2} value={form.references} placeholder="Names or links to past events / reviews"
                  onChange={e => set('references', e.target.value)}
                  style={{ ...s.input, ...s.textarea }} />
              </div>
              <div style={s.noticeBox}>
                📧 You'll receive an email confirmation once submitted.
              </div>
              <div style={s.btnRow}>
                <button style={s.btnGhost}   onClick={() => setStep(1)}>← Back</button>
                <button style={s.btnPrimary} onClick={handleSubmit}>Submit Request ✓</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page:      { padding: '2.5rem 2rem 5rem', minHeight: '80vh', background: '#fffdf7' },
  container: { maxWidth: 680, margin: '0 auto' },
  back:      { background: 'transparent', border: '1px solid #e8e0d0', borderRadius: 8, padding: '0.45rem 1rem', color: '#6b6055', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem' },
  demoNotice:{ background: '#fff8e6', border: '1px solid #ffe0a0', borderRadius: 10, padding: '0.75rem 1.1rem', fontSize: '0.85rem', color: '#7a5a00', marginBottom: '1.2rem', lineHeight: 1.6 },
  formCard:  { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
  progress:  { display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', position: 'relative' },
  progressStep: { display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 },
  progressDot:  { width: 28, height: 28, borderRadius: '50%', background: '#e8e0d0', color: '#6b6055', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 },
  progressDotActive:   { background: '#C41230', color: '#fff' },
  progressLabel:       { fontSize: '0.82rem', color: '#6b6055', fontWeight: 500 },
  progressLabelActive: { color: '#C41230', fontWeight: 700 },
  progressLine: { position: 'absolute', left: 28, right: 0, height: 2, background: '#e8e0d0', zIndex: 0, top: 14 },
  h2:       { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', marginBottom: 6, color: '#1a1208' },
  sub:      { color: '#6b6055', fontSize: '0.9rem', marginBottom: '1.5rem' },
  grid2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field:    { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' },
  label:    { fontSize: '0.82rem', fontWeight: 600, color: '#1a1208' },
  hint:     { fontSize: '0.75rem', color: '#6b6055' },
  optional: { color: '#6b6055', fontWeight: 400 },
  input:    { border: '1.5px solid #e8e0d0', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.9rem', outline: 'none', color: '#1a1208', background: '#fff', width: '100%' },
  inputErr: { border: '1.5px solid #C41230' },
  textarea: { resize: 'vertical', minHeight: 80 },
  errMsg:   { color: '#C41230', fontSize: '0.75rem' },
  noticeBox:{ background: '#fff8e6', border: '1px solid #ffe0a0', borderRadius: 10, padding: '0.9rem 1.1rem', fontSize: '0.85rem', color: '#7a5a00', lineHeight: 1.8, marginBottom: '1.5rem' },
  btnRow:   { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' },
  btnPrimary: { background: '#C41230', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 1.8rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' },
  btnGhost:   { background: 'transparent', color: '#6b6055', border: '1px solid #e8e0d0', borderRadius: 10, padding: '0.75rem 1.4rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' },
}
