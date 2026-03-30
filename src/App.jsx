import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import CalendarView from './components/CalendarView'
import BookingForm from './components/BookingForm'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'

const TODAY = new Date()
const y = TODAY.getFullYear()
const m = TODAY.getMonth()

const INITIAL_SUBMISSIONS = [
  {
    id: 1, status: 'pending',
    businessName: "Taco Loco", email: "taco@loco.com", phone: "415-555-0101",
    contact: "Maria G.", yearsInBusiness: "4", menuLink: "https://tacoloco.com/menu",
    instagram: "@tacoloco", bio: "Authentic Mexican street tacos with housemade salsas.",
    cuisine: "Mexican", requestedDate: new Date(y, m, TODAY.getDate() + 5).toDateString(),
    submitted: new Date(y, m, TODAY.getDate() - 1).toDateString(),
  },
  {
    id: 2, status: 'approved',
    businessName: "Seoul Bowl", email: "hello@seoulbowl.com", phone: "415-555-0202",
    contact: "Jin Park", yearsInBusiness: "2", menuLink: "https://seoulbowl.com",
    instagram: "@seoulbowlsf", bio: "Korean-fusion rice bowls and bao buns.",
    cuisine: "Korean", requestedDate: new Date(y, m, TODAY.getDate() + 8).toDateString(),
    submitted: new Date(y, m, TODAY.getDate() - 3).toDateString(),
  },
  {
    id: 3, status: 'pending',
    businessName: "The Grilled Cheese Co.", email: "gcco@email.com", phone: "650-555-0303",
    contact: "Sam T.", yearsInBusiness: "6", menuLink: "https://grilledco.com",
    instagram: "@grilledcheeseco", bio: "Gourmet grilled cheese with rotating seasonal ingredients.",
    cuisine: "American", requestedDate: new Date(y, m, TODAY.getDate() + 12).toDateString(),
    submitted: new Date(y, m, TODAY.getDate() - 0).toDateString(),
  },
  {
    id: 4, status: 'declined',
    businessName: "Bombay Bites", email: "bombay@bites.in", phone: "408-555-0404",
    contact: "Priya S.", yearsInBusiness: "1", menuLink: "https://bombaybites.com",
    instagram: "@bombaybites", bio: "Modern Indian street food — samosas, chaat, chai.",
    cuisine: "Indian", requestedDate: new Date(y, m, TODAY.getDate() + 3).toDateString(),
    submitted: new Date(y, m, TODAY.getDate() - 5).toDateString(),
  },
]

const BOOKED_DATES = [
  new Date(y, m, TODAY.getDate() + 8).toDateString(),
]

export default function App() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS)
  const [bookedDates] = useState(BOOKED_DATES)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSubmit = (data) => {
    const newSub = {
      ...data,
      id: submissions.length + 1,
      status: 'pending',
      submitted: new Date().toDateString(),
    }
    setSubmissions(prev => [newSub, ...prev])
    showToast('✅ Request submitted! You\'ll hear back within 24 hours.')
  }

  return (
    <>
      <Header />

      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999, background: toast.type === 'error' ? '#e03030' : '#22a05a',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10,
          fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
        }}>{toast.msg}</div>
      )}

      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <CalendarView />
          </>
        } />
        <Route path="/apply" element={
          <BookingForm onSubmit={handleSubmit} />
        } />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  )
}
