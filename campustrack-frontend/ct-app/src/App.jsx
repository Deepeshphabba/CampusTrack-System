import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { authApi } from './services/api.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ct_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(res => {
        const u = res.data
        setUser({ id: u.id, name: u.fullName, email: u.email,
          role: u.role + (u.department ? ' · ' + u.department : ''),
          initials: u.initials, department: u.department, rawRole: u.role })
      })
      .catch(() => { localStorage.removeItem('ct_token') })
      .finally(() => setLoading(false))
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('ct_token', token)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('ct_token')
    setUser(null)
  }

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#0d0f14' }}>
      <div style={{ width:32, height:32, border:'3px solid rgba(255,255,255,0.15)',
        borderTopColor:'#4f6ef7', borderRadius:'50%',
        animation:'spin 0.7s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register onLogin={handleLogin} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
