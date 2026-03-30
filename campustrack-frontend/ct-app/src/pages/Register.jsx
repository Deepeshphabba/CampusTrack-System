import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api.js'

export default function Register({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName:'', email:'', password:'', confirm:'', role:'STUDENT', department:'' })
  const [errors, setErrors] = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (!form.confirm) e.confirm = 'Please confirm password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setServerErr('')
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e); setShake(true); setTimeout(() => setShake(false), 500); return
    }
    setLoading(true)
    try {
      const { confirm, ...payload } = form
      const res = await authApi.register(payload)
      const d = res.data
      onLogin({
        id: d.id, name: d.fullName, email: d.email,
        role: d.role + (d.department ? ' · ' + d.department : ''),
        initials: d.initials, department: d.department, rawRole: d.role
      }, d.token)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data || {}
      let msg = data.message || data.error || data.detail || data.email || data.errors || 'Registration failed. Try again.'
      if (typeof msg === 'object') {
        if (Array.isArray(msg)) msg = msg.join(', ')
        else msg = Object.values(msg).flat().join(', ')
      }
      setServerErr(msg)
      setShake(true); setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (ev) => {
    setForm(p => ({ ...p, [k]: ev.target.value }))
    setErrors(p => ({ ...p, [k]: '' }))
    setServerErr('')
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-root">
        <div className={`auth-card${shake ? ' shake' : ''}`}>
          <div className="logo-row">
            <div className="logo-gem">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 2L3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/>
              </svg>
            </div>
            <div>
              <div className="logo-name">CampusTrack</div>
              <div className="logo-tag">Issue Management</div>
            </div>
          </div>

          <div className="auth-title">Create account</div>
          <div className="auth-sub">Join CampusTrack to report and track issues</div>

          {serverErr && <div className="server-err">{serverErr}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label>Full Name</label>
              <input type="text" value={form.fullName} onChange={set('fullName')}
                placeholder="S. Ravi Kumar" className={errors.fullName ? 'err' : ''} />
              {errors.fullName && <div className="ferr">{errors.fullName}</div>}
            </div>

            <div className="field">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="you@campus.edu" className={errors.email ? 'err' : ''} />
              {errors.email && <div className="ferr">{errors.email}</div>}
            </div>

            <div className="two-col">
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={set('role')} className="sel">
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="field">
                <label>Department</label>
                <input type="text" value={form.department} onChange={set('department')} placeholder="e.g. CSE" />
              </div>
            </div>

            <div className="two-col">
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.password} onChange={set('password')}
                  placeholder="Min. 6 chars" className={errors.password ? 'err' : ''} />
                {errors.password && <div className="ferr">{errors.password}</div>}
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input type="password" value={form.confirm} onChange={set('confirm')}
                  placeholder="Repeat password" className={errors.confirm ? 'err' : ''} />
                {errors.confirm && <div className="ferr">{errors.confirm}</div>}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" />Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-foot">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  )
}

const STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;font-family:'Inter',sans-serif;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .auth-root{min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(ellipse at 20% 20%,rgba(79,110,247,.18) 0%,transparent 55%),
               radial-gradient(ellipse at 80% 80%,rgba(139,92,246,.14) 0%,transparent 55%),#0d0f14;padding:24px;}
  .auth-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:20px;
    padding:40px 44px;width:100%;max-width:460px;animation:fadeUp .45s ease both;backdrop-filter:blur(12px);}
  .auth-card.shake{animation:shake .45s ease;}
  .logo-row{display:flex;align-items:center;gap:11px;margin-bottom:28px;}
  .logo-gem{width:38px;height:38px;background:linear-gradient(135deg,#4f6ef7,#7c3aed);border-radius:11px;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .logo-gem svg{width:19px;height:19px;}
  .logo-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;letter-spacing:-.3px;}
  .logo-tag{font-size:10px;color:rgba(255,255,255,.3);letter-spacing:1.2px;text-transform:uppercase;margin-top:1px;}
  .auth-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;color:#fff;letter-spacing:-.5px;margin-bottom:6px;}
  .auth-sub{font-size:13.5px;color:rgba(255,255,255,.42);margin-bottom:20px;}
  .server-err{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.35);border-radius:9px;
    padding:10px 14px;font-size:13px;color:#fca5a5;margin-bottom:16px;}
  .field{margin-bottom:15px;}
  .field label{display:block;font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;
    color:rgba(255,255,255,.45);margin-bottom:7px;}
  .field input,.sel{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
    border-radius:10px;padding:11px 14px;font-size:14px;color:#fff;outline:none;
    font-family:'Inter',sans-serif;transition:border-color .18s,background .18s;}
  .field input::placeholder{color:rgba(255,255,255,.22);}
  .field input:focus,.sel:focus{border-color:#4f6ef7;background:rgba(79,110,247,.1);}
  .field input.err{border-color:#ef4444;}
  .sel option{background:#1a1c28;color:#fff;}
  .ferr{font-size:11.5px;color:#fca5a5;margin-top:5px;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .btn-primary{width:100%;background:linear-gradient(135deg,#4f6ef7,#7c3aed);color:#fff;border:none;
    border-radius:10px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;margin-top:6px;
    display:flex;align-items:center;justify-content:center;gap:8px;
    transition:opacity .18s,transform .12s;font-family:'Inter',sans-serif;}
  .btn-primary:hover{opacity:.88;transform:translateY(-1px);}
  .btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;
    border-radius:50%;animation:spin .65s linear infinite;flex-shrink:0;}
  .auth-foot{text-align:center;margin-top:20px;font-size:13px;color:rgba(255,255,255,.35);}
  .auth-foot a{color:#818cf8;text-decoration:none;font-weight:500;}
  .auth-foot a:hover{color:#a5b4fc;}
`
