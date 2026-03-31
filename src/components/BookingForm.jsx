import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const EMPTY = {
  businessName: '', email: '', phone: '', contact: '',
  yearsInBusiness: '', menuLink: '', instagram: '', facebook: '',
  bio: '', references: '', cuisine: '', requestedDate: '',
}

export default function BookingForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedDate = searchParams.get('date') || ''

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ ...EMPTY, requestedDate: preselectedDate })
  const [logoFile, setLogoFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate1 = () => {
    const e = {}
    if (!form.businessName.trim()) e.businessName = 'Required'
    if (!form.email.includes('@'))  e.email = 'Valid email required'
    if (!form.phone.trim())         e.phone = 'Required'
    if (!form.contact.trim())       e.contact = 'Required'
    if (!form.yearsInBusiness.toString().trim()) e.yearsInBusiness = 'Required'
    if (!form.cuisine)              e.cuisine = 'Please select a cuisine type'
    setErrors(e); return Object.keys(e).length === 0
  }

  const validate2 = () => {
    const e = {}
    if (!form.requestedDate)   e.requestedDate = 'Please select a date'
    if (!form.bio.trim())      e.bio = 'Please add a short bio'
    if (!form.menuLink.trim()) e.menuLink = 'Required'
    if (!form.instagram.trim()) e.instagram = 'Required'
    if (!logoFile)             e.logo = 'Please upload your truck logo'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate1()) setStep(2) }

  const handleSubmit = async () => {
    if (!validate2()) return
    setSubmitting(true)

    let logo_url = null

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${Date.now()}-${form.businessName.replace(/\s+/g, '-').toLowerCase()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, logoFile, { upsert: false })

      if (!uploadError) {
        const { data } = supabase.storage.from('logos').getPublicUrl(path)
        logo_url = data.publicUrl
      }
    }

    const { error } = await supabase.from('applications').insert({
      business_name:   form.businessName,
      email:           form.email,
      phone:           form.phone,
      contact_name:    form.contact,
      years_in_biz:    form.yearsInBusiness,
      menu_link:       form.menuLink,
      instagram:       form.instagram,
      facebook:        form.facebook,
      bio:             form.bio,
      references_text: form.references,
      cuisine:         form.cuisine,
      requested_date:  form.requestedDate,
      logo_url,
      status:          'pending',
    })

    setSubmitting(false)
    if (!error) {
      // Fire notification — failure must never block the success screen
      try {
        await supabase.functions.invoke('notify-new-application', {
          body: {
            businessName: form.businessName,
            email:        form.email,
            contact:      form.contact,
            requestedDate: form.requestedDate,
            cuisine:      form.cuisine,
          },
        })
      } catch (_) { /* silent */ }
      setSubmitted(true)
    } else {
      setErrors({ submit: 'Something went wrong — please try again.' })
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

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={{ ...s.container, textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
          <h2 style={{ ...s.h2, fontSize: '2rem', marginBottom: '1rem' }}>Application Submitted!</h2>
          <p style={{ color: '#6b6055', fontSize: '1rem', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 2rem' }}>
            Thanks, <strong>{form.businessName}</strong>! We've received your application and will be in touch at <strong>{form.email}</strong> within 24 hours.
          </p>
          <button style={s.btnPrimary} onClick={() => navigate('/')}>← Back to Calendar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.back} onClick={() => navigate('/')}>← Back to calendar</button>

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
              <Field label="Years in Business"   k="yearsInBusiness" type="number" placeholder="e.g. 3" required />
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

              <Field label="Menu Link" k="menuLink" placeholder="https://yourtruck.com/menu" hint="Link to your online menu" required />

              <div style={s.grid2}>
                <Field label="Instagram" k="instagram" placeholder="@yourtruck" required />
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
                <label style={s.label}>Truck Logo <span style={{ color: '#C41230' }}>*</span></label>
                <span style={s.hint}>JPG, PNG or SVG — shown on your application</span>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0] || null)}
                  style={{ ...s.input, padding: '0.45rem 0.9rem', ...(errors.logo ? s.inputErr : {}) }} />
                {errors.logo && <span style={s.errMsg}>{errors.logo}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>References <span style={s.optional}>(optional)</span></label>
                <textarea rows={2} value={form.references} placeholder="Names or links to past events / reviews"
                  onChange={e => set('references', e.target.value)}
                  style={{ ...s.input, ...s.textarea }} />
              </div>

              {errors.submit && <div style={s.errBox}>{errors.submit}</div>}

              <div style={s.btnRow}>
                <button style={s.btnGhost} onClick={() => setStep(1)} disabled={submitting}>← Back</button>
                <button style={{ ...s.btnPrimary, opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Request ✓'}
                </button>
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
  formCard:  { background: '#fff', border: '1px solid #e8e0d0', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
  progress:  { display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', position: 'relative' },
  progressStep:        { display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 },
  progressDot:         { width: 28, height: 28, borderRadius: '50%', background: '#e8e0d0', color: '#6b6055', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 },
  progressDotActive:   { background: '#C41230', color: '#fff' },
  progressLabel:       { fontSize: '0.82rem', color: '#6b6055', fontWeight: 500 },
  progressLabelActive: { color: '#C41230', fontWeight: 700 },
  progressLine:        { position: 'absolute', left: 28, right: 0, height: 2, background: '#e8e0d0', zIndex: 0, top: 14 },
  h2:       { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', marginBottom: 6, color: '#1a1208' },
  sub:      { color: '#6b6055', fontSize: '0.9rem', marginBottom: '1.5rem' },
  grid2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field:    { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' },
  label:    { fontSize: '0.82rem', fontWeight: 600, color: '#1a1208' },
  hint:     { fontSize: '0.75rem', color: '#6b6055' },
  optional: { color: '#6b6055', fontWeight: 400, fontSize: '0.78rem' },
  input:    { border: '1.5px solid #e8e0d0', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.9rem', outline: 'none', color: '#1a1208', background: '#fff', width: '100%', boxSizing: 'border-box' },
  inputErr: { border: '1.5px solid #C41230' },
  textarea: { resize: 'vertical', minHeight: 80 },
  errMsg:   { color: '#C41230', fontSize: '0.75rem' },
  errBox:   { background: '#fef0f0', border: '1px solid #f0c0c0', borderRadius: 8, padding: '0.75rem 1rem', color: '#C41230', fontSize: '0.85rem', marginBottom: '1rem' },
  btnRow:   { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' },
  btnPrimary: { background: '#C41230', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 1.8rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' },
  btnGhost:   { background: 'transparent', color: '#6b6055', border: '1px solid #e8e0d0', borderRadius: 10, padding: '0.75rem 1.4rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' },
}
