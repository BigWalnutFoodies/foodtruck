import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import CalendarView from './components/CalendarView'
import BookingForm from './components/BookingForm'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<><Hero /><CalendarView /></>} />
        <Route path="/apply" element={<BookingForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}
