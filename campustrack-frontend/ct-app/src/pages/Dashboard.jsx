import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { issuesApi, usersApi } from '../services/api.js'

// ── Static icon/colour maps ──────────────────────────────────────────────────
const STAT_META = [
  { label:'Total Issues', key:'totalIssues',      dir:'up',      color:'#4f6ef7', bg:'#eef1ff',
    icon:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg> },
  { label:'Open',         key:'openIssues',        dir:'up',      color:'#3b82f6', bg:'#eff6ff',
    icon:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 5h12M2 8h8M2 11h5"/></svg> },
  { label:'In Progress',  key:'inProgressIssues',  dir:'neutral', color:'#f59e0b', bg:'#fffbeb',
    icon:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3v5l3 2"/><circle cx="8" cy="8" r="6"/></svg> },
  { label:'Resolved',     key:'resolvedIssues',    dir:'up',      color:'#10b981', bg:'#ecfdf5',
    icon:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 8l4 4 6-6"/><circle cx="8" cy="8" r="6"/></svg> },
]

const CAT_META = [
  { name:'Infrastructure', key:'infrastructureIssues', bg:'#fef3c7', color:'#92400e',
    icon:<svg viewBox="0 0 14 14" fill="none" stroke="#92400e" strokeWidth="1.7" strokeLinecap="round"><path d="M1.5 12h11M3 12V8l4-4.5 4 4.5v4"/><path d="M5 12V9.5h4V12"/></svg> },
  { name:'IT & Network',   key:'itNetworkIssues',      bg:'#f5f3ff', color:'#6d28d9',
    icon:<svg viewBox="0 0 14 14" fill="none" stroke="#6d28d9" strokeWidth="1.7" strokeLinecap="round"><rect x="1" y="3.5" width="12" height="7" rx="1.2"/><path d="M4 6.5h6M4 9h4"/></svg> },
  { name:'Academic',       key:'academicIssues',       bg:'#f0fdfa', color:'#134e4a',
    icon:<svg viewBox="0 0 14 14" fill="none" stroke="#134e4a" strokeWidth="1.7" strokeLinecap="round"><path d="M7 1L1 4.5l6 3.5 6-3.5z"/><path d="M1 4.5V9c0 1.7 2.7 3 6 3s6-1.3 6-3V4.5"/></svg> },
  { name:'Safety & Health',key:'safetyIssues',         bg:'#fef2f2', color:'#991b1b',
    icon:<svg viewBox="0 0 14 14" fill="none" stroke="#991b1b" strokeWidth="1.7" strokeLinecap="round"><path d="M7 1.5L2 3.5v4.5c0 2.5 2.2 4.2 5 5 2.8-.8 5-2.5 5-5V3.5z"/></svg> },
]

// map backend status/category/priority → display strings & CSS classes
const STATUS_MAP = {
  OPEN:        { label:'Open',        cls:'sb-open' },
  IN_PROGRESS: { label:'In Progress', cls:'sb-progress' },
  RESOLVED:    { label:'Resolved',    cls:'sb-resolved' },
  CLOSED:      { label:'Closed',      cls:'sb-closed' },
}
const CAT_CLS = {
  INFRASTRUCTURE:'ct-infra', IT_NETWORK:'ct-it',
  ACADEMIC:'ct-academic',    SAFETY:'ct-safety', FACILITIES:'ct-facilities'
}
const CAT_LABEL = {
  INFRASTRUCTURE:'Infrastructure', IT_NETWORK:'IT & Network',
  ACADEMIC:'Academic', SAFETY:'Safety', FACILITIES:'Facilities'
}
const PRIO_CLS = { CRITICAL:'p-critical', HIGH:'p-high', MEDIUM:'p-medium', LOW:'p-low' }
const PRIO_COLORS = { CRITICAL:'#ef4444', HIGH:'#f59e0b', MEDIUM:'#3b82f6', LOW:'#9ba3b4' }

const FILTER_KEYS = [
  { key:'all',         label:'All' },
  { key:'OPEN',        label:'Open' },
  { key:'IN_PROGRESS', label:'In Progress' },
  { key:'RESOLVED',    label:'Resolved' },
  { key:'CLOSED',      label:'Closed' },
  { key:'CRITICAL',    label:'Critical' },
]

// ── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { label:'Dashboard', pill:null, pillCls:'',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.2"/></svg> },
  { label:'All Issues', pill: null, pillCls:'active-pill',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 5h12M2 8h8M2 11h5"/></svg> },
  { label:'My Reports', pill:null, pillCls:'',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 1v7M5 4l3-3 3 3M2 11c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5"/></svg> },
  { label:'Pending Review', pill:'17', pillCls:'hot',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg> },
]

const NAV_CATS = [
  { label:'Infrastructure',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 13h12M4 13V8l4-5 4 5v5"/><path d="M6 13v-3h4v3"/></svg> },
  { label:'IT & Network',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="1" y="4" width="14" height="8" rx="1.5"/><path d="M5 8h6M5 10.5h3"/></svg> },
  { label:'Academic',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 14l2.5-8M13 14l-2.5-8M5.5 6h5M8 1v3"/></svg> },
  { label:'Safety & Health',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.6 3.5L8 10l-3.1 1.5.6-3.5L3 5.5l3.5-.5z"/></svg> },
]

const NAV_INSIGHTS = [
  { label:'Analytics',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 12V5l4-3 4 3 4-2v9"/><path d="M2 12h12"/></svg> },
  { label:'Team',
    icon:<svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="8" cy="6" r="3.5"/><path d="M2 14c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5"/></svg> },
]

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [activeNav,    setActiveNav]    = useState('Dashboard')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery,  setSearchQuery]  = useState('')

  // Drawers
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ title:'', category:'INFRASTRUCTURE', priority:'MEDIUM', location:'', description:'' })
  const [createLoading, setCreateLoading] = useState(false)
  const [detailIssue, setDetailIssue] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Live data state
  const [stats,       setStats]       = useState(null)
  const [issues,      setIssues]      = useState([])
  const [loadingStats,setLoadingStats] = useState(true)
  const [loadingIssues,setLoadingIssues]=useState(true)
  const [apiError,    setApiError]    = useState('')

  const [users, setUsers] = useState([])
  const [staff, setStaff] = useState([])
  const [showNotif, setShowNotif] = useState(false)

  // Fetch stats and lists
  useEffect(() => {
    issuesApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => setApiError('Could not load stats from backend.'))
      .finally(() => setLoadingStats(false))
      
    usersApi.getAll().then(r => setUsers(r.data)).catch(console.error)
    usersApi.getStaff().then(r => setStaff(r.data)).catch(console.error)
  }, [])

  // Fetch issues (re-runs when filter/nav/search changes)
  const fetchIssues = useCallback(() => {
    setLoadingIssues(true)
    let req;

    if (activeNav === 'My Reports') {
      req = issuesApi.getMy()
    } else if (activeNav === 'Pending Review') {
      req = issuesApi.getAssigned()
    } else {
      const params = {}
      if (searchQuery) params.keyword = searchQuery
      if (activeFilter !== 'all' && activeFilter !== 'CRITICAL') {
        params.status = activeFilter
      }
      
      const categoryMap = {
        'Infrastructure': 'INFRASTRUCTURE',
        'IT & Network': 'IT_NETWORK',
        'Academic': 'ACADEMIC',
        'Safety & Health': 'SAFETY',
        'Facilities': 'FACILITIES'
      }
      if (categoryMap[activeNav]) {
         params.category = categoryMap[activeNav]
      }
      req = issuesApi.getAll(params)
    }

    req.then(r => {
        let data = r.data
        if (activeFilter === 'CRITICAL') data = data.filter(i => i.priority === 'CRITICAL')
        if (searchQuery) {
          const sq = searchQuery.toLowerCase()
          data = data.filter(i => i.title.toLowerCase().includes(sq) || (i.location && i.location.toLowerCase().includes(sq)) || (i.issueNumber && i.issueNumber.toLowerCase().includes(sq)))
        }
        setIssues(data)
      })
      .catch(() => setApiError('Could not load issues from backend.'))
      .finally(() => setLoadingIssues(false))
  }, [activeFilter, activeNav, searchQuery])

  useEffect(() => { 
    const t = setTimeout(() => { fetchIssues() }, 200)
    return () => clearTimeout(t)
  }, [fetchIssues])

  // Drawer handlers
  const openDetail = (issue) => {
    setDetailLoading(true)
    setDetailIssue(issue) // Optimistic load
    issuesApi.getById(issue.id)
      .then(r => setDetailIssue(r.data))
      .finally(() => setDetailLoading(false))
  }
  const closeDetail = () => setDetailIssue(null)
  
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if(!createForm.title || !createForm.description) return
    setCreateLoading(true)
    try {
      await issuesApi.create(createForm)
      setShowCreate(false)
      setCreateForm({ title:'', category:'INFRASTRUCTURE', priority:'MEDIUM', location:'', description:'' })
      fetchIssues()
      issuesApi.getStats().then(r => setStats(r.data))
    } catch(err) {
      window.alert("Failed to create issue")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    if(!detailIssue) return
    try {
      setDetailLoading(true)
      await issuesApi.updateStatus(detailIssue.id, status)
      // refresh
      const r = await issuesApi.getById(detailIssue.id)
      setDetailIssue(r.data)
      fetchIssues()
      issuesApi.getStats().then(s => setStats(s.data))
    } catch(err) {
      window.alert("Failed to update status")
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async () => {
    if(!detailIssue) return
    try {
      setDetailLoading(true)
      await issuesApi.delete(detailIssue.id)
      setDetailIssue(null)
      fetchIssues()
      issuesApi.getStats().then(s => setStats(s.data))
    } catch(err) {
      window.alert("Failed to delete issue")
    } finally {
      if(detailIssue) setDetailLoading(false)
    }
  }

  const handleAssign = async (userId) => {
    if(!detailIssue) return
    try {
      setDetailLoading(true)
      await issuesApi.update(detailIssue.id, { assignedToId: Number(userId) })
      const r = await issuesApi.getById(detailIssue.id)
      setDetailIssue(r.data)
      fetchIssues()
    } catch(err) {
      window.alert("Failed to assign issue")
    } finally {
      if(detailIssue) setDetailLoading(false)
    }
  }

  // Build stat cards from live stats
  const STATS_LIVE = STAT_META.map(m => ({
    ...m,
    value: stats ? (stats[m.key] ?? 0) : '—',
  }))

  // Build category cards from live stats
  const CATS_LIVE = CAT_META.map(m => ({
    ...m,
    count: stats ? `${stats[m.key] ?? 0} issues` : '— issues',
  }))

  // Weekly trend from stats
  const WEEK = stats?.weeklyTrend ?? []
  const maxWeekVal = WEEK.length ? Math.max(...WEEK.map(d => (d.open||0) + (d.resolved||0)), 1) : 1

  // Top locations from stats
  const TOP_LOCS = stats?.topLocations ?? []
  const maxLocVal = TOP_LOCS.length ? Math.max(...TOP_LOCS.map(l => Number(l.count)), 1) : 1

  // Recent activity from stats
  const ACTIVITY = stats?.recentActivity ?? []

  // Filter counts
  const filterCounts = {
    all:         issues.length,
    OPEN:        issues.filter(i=>i.status==='OPEN').length,
    IN_PROGRESS: issues.filter(i=>i.status==='IN_PROGRESS').length,
    RESOLVED:    issues.filter(i=>i.status==='RESOLVED').length,
    CLOSED:      issues.filter(i=>i.status==='CLOSED').length,
    CRITICAL:    issues.filter(i=>i.priority==='CRITICAL').length,
  }

  const shownIssues = activeFilter === 'all' ? issues
    : activeFilter === 'CRITICAL' ? issues.filter(i=>i.priority==='CRITICAL')
    : issues.filter(i=>i.status===activeFilter)

  const isDashboard = activeNav === 'Dashboard'
  const isAnalytics = activeNav === 'Analytics'
  const isTeam = activeNav === 'Team'

  const teamPanel = (
    <div className="panel" style={{flex:1, display:'flex', flexDirection:'column'}}>
      <div className="panel-header" style={{flexShrink:0}}>
        <div className="panel-title">System Users Directory</div>
      </div>
      <div className="issue-table-header" style={{gridTemplateColumns:'48px 1fr 1fr 1fr 100px 72px'}}>
        <div /><div className="th-label">Name</div><div className="th-label">Email</div>
        <div className="th-label">Department</div><div className="th-label">Role</div><div />
      </div>
      <div className="issue-table" style={{flex:1, overflowY:'auto'}}>
        {users.length===0 ? <div style={{padding:28,textAlign:'center'}}>Loading...</div> : users.map((u,i) => (
          <div key={i} className="issue-row" style={{gridTemplateColumns:'48px 1fr 1fr 1fr 100px 72px'}}>
             <div className="user-avatar" style={{width:28,height:28,fontSize:10}}>{u.initials}</div>
             <div className="issue-name" style={{fontSize:14}}>{u.fullName}</div>
             <div className="issue-loc">{u.email}</div>
             <div className="issue-loc">{u.department}</div>
             <div className={`cat-tag ct-infra`} style={{padding:'4px 10px',textAlign:'center',display:'block',width:'fit-content'}}>{u.role}</div>
             <div/>
          </div>
        ))}
      </div>
    </div>
  )

  const issuePanel = (
    <div className="panel" style={{ flex: isDashboard ? 'none' : '1', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ flexShrink: 0 }}>
        <div className="panel-title">{isDashboard ? 'Recent Issues' : activeNav}</div>
        {isDashboard && <div className="panel-action" onClick={() => setActiveNav('All Issues')}>View all <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:11,height:11}}><path d="M2 6h8M6 2l4 4-4 4"/></svg></div>}
      </div>

      {/* FILTER TABS */}
      <div className="filter-tabs" style={{ flexShrink: 0 }}>
        {FILTER_KEYS.map(f => (
          <div key={f.key} className={`filter-tab${activeFilter===f.key?' active':''}`}
            onClick={() => setActiveFilter(f.key)}>
            {f.label} <span className="tab-count">{filterCounts[f.key] ?? 0}</span>
          </div>
        ))}
      </div>

      {/* TABLE HEADER */}
      <div className="issue-table-header" style={{ flexShrink: 0 }}>
        <div /><div className="th-label">Issue</div><div className="th-label">Category</div>
        <div className="th-label">Status</div><div className="th-label">Assigned</div><div className="th-label">Date</div>
      </div>

      {/* ROWS */}
      <div className="issue-table" style={{ flex: 1, overflowY: isDashboard ? 'visible' : 'auto' }}>
        {loadingIssues ? (
          <div style={{padding:'28px',textAlign:'center',color:'#9ba3b4',fontSize:13}}>
            <span style={{display:'inline-block',width:18,height:18,border:'2px solid #e5e7eb',borderTopColor:'#4f6ef7',borderRadius:'50%',animation:'spin 0.7s linear infinite',marginRight:8,verticalAlign:'middle'}}/>
            Loading issues…
          </div>
        ) : shownIssues.length === 0 ? (
          <div style={{padding:'28px',textAlign:'center',color:'#9ba3b4',fontSize:13}}>No issues found.</div>
        ) : shownIssues.map(issue => {
          const st  = STATUS_MAP[issue.status]  || { label: issue.status,   cls: '' }
          const pCls= PRIO_CLS[issue.priority]  || ''
          const cCls= CAT_CLS[issue.category]   || ''
          const cLbl= CAT_LABEL[issue.category] || issue.category
          const assignee = issue.assignedTo
          const aColor   = PRIO_COLORS[issue.priority] || '#9ba3b4'
          const dateStr  = issue.createdAt
            ? new Date(issue.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
            : '—'
          return (
            <div key={issue.id}
              className={`issue-row${detailIssue?.id===issue.id?' selected':''}`}
              onClick={() => openDetail(issue)}>
              <div className={`p-dot ${pCls}`} />
              <div className="issue-info">
                <div className="issue-name">{issue.title}</div>
                <div className="issue-meta-row">
                  <span className="issue-id">{issue.issueNumber}</span>
                  <span className="dot-sep">·</span>
                  <span className="issue-loc">{issue.location}</span>
                </div>
              </div>
              <span className={`cat-tag ${cCls}`}>{cLbl}</span>
              <span className={`status-badge ${st.cls}`}>{st.label}</span>
              <div className="assignee-avatar" style={{background: assignee ? aColor : '#9ba3b4'}}>
                {assignee ? assignee.initials : '—'}
              </div>
              <span className="issue-date">{dateStr}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <style>{CSS}</style>
      {apiError && (
        <div style={{position:'fixed',top:12,right:16,zIndex:999,background:'#fef2f2',
          border:'1px solid #fca5a5',borderRadius:10,padding:'10px 16px',
          fontSize:13,color:'#991b1b',boxShadow:'0 4px 16px rgba(0,0,0,.1)'}}>
          ⚠ {apiError} — Is the backend running on port 8080?
        </div>
      )}
      <div className="layout">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="logo-area">
            <div className="logo-gem">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 2L3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/>
              </svg>
            </div>
            <div className="logo-wordmark">
              <div className="logo-name">CampusTrack</div>
              <div className="logo-tagline">Issue Management</div>
            </div>
          </div>

          <div className="nav-group" style={{marginTop:8}}>
            <div className="nav-group-label">Main</div>
            {NAV_MAIN.map(n => (
              <div key={n.label} className={`nav-item${activeNav===n.label?' active':''}`} onClick={() => setActiveNav(n.label)}>
                {n.icon}{n.label}
                {n.label === 'All Issues' && stats
                  ? <span className={`nav-pill ${n.pillCls}`}>{stats.totalIssues}</span>
                  : n.pill && <span className={`nav-pill ${n.pillCls}`}>{n.pill}</span>
                }
              </div>
            ))}
          </div>

          <div className="sidebar-divider" />

          <div className="nav-group">
            <div className="nav-group-label">Categories</div>
            {NAV_CATS.map(n => (
              <div key={n.label} className={`nav-item${activeNav===n.label?' active':''}`} onClick={() => setActiveNav(n.label)}>
                {n.icon}{n.label}
              </div>
            ))}
          </div>

          <div className="sidebar-divider" />

          <div className="nav-group">
            <div className="nav-group-label">Insights</div>
            {NAV_INSIGHTS.map(n => (
              <div key={n.label} className={`nav-item${activeNav===n.label?' active':''}`} onClick={() => setActiveNav(n.label)}>
                {n.icon}{n.label}
              </div>
            ))}
          </div>

          <div className="sidebar-bottom">
            <div className="user-card" onClick={onLogout} title="Click to logout">
              <div className="user-avatar">{user?.initials || 'SR'}</div>
              <div>
                <div className="user-name">{user?.name || 'S. Ravi Kumar'}</div>
                <div className="user-role">{user?.role || 'Admin · Facilities Dept.'}</div>
              </div>
              <div className="user-status" />
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-left">
              <div className="page-heading">Overview</div>
              <div className="page-sub"><span className="live-dot" />Live · Last updated just now · March 25, 2026</div>
            </div>
            <div className="topbar-right">
              <div className="search-wrap">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M11.5 11.5L15 15"/></svg>
                <input type="text" placeholder="Search issues, locations…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{background:'transparent',border:'none',color:'inherit',outline:'none',flex:1,fontFamily:'inherit',fontSize:'inherit'}} />
                <span className="search-kbd">⌘K</span>
              </div>
              <div style={{position:'relative'}}>
                <div className="notif-btn" onClick={() => setShowNotif(!showNotif)}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 2a4 4 0 014 4c0 3 1 4 2 5H2c1-1 2-2 2-5a4 4 0 014-4z"/><path d="M6.5 13a1.5 1.5 0 003 0"/></svg>
                  {ACTIVITY.length > 0 && <div className="notif-dot" />}
                </div>
                {showNotif && (
                  <div style={{position:'absolute',top:'100%',right:0,marginTop:10,width:340,background:'#fff',borderRadius:12,boxShadow:'0 10px 40px rgba(0,0,0,.15)',zIndex:999,border:'1px solid var(--border)'}}>
                    <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',fontWeight:600,fontSize:13,display:'flex',justifyContent:'space-between'}}>Notifications <span style={{color:'var(--accent)',cursor:'pointer',fontWeight:500}} onClick={()=>setShowNotif(false)}>Mark read</span></div>
                    <div style={{maxHeight:300,overflowY:'auto'}}>
                      {ACTIVITY.length===0 ? <div style={{padding:20,textAlign:'center',color:'var(--text-muted)'}}>No recent activity</div> : ACTIVITY.map((a, i) => {
                        const actColor = ['#ef4444','#8b5cf6','#14b8a6','#f59e0b'][i % 4]
                        return (
                          <div key={i} style={{padding:'14px 18px',display:'flex',gap:12,borderBottom:'1px solid var(--border)'}} className="activity-item">
                            <div className="activity-avi" style={{background: actColor}}>{a.assigneeInitials||'??'}</div>
                            <div className="activity-body">
                              <div className="activity-text" style={{fontSize:12}}><strong>{a.assigneeName||'System'}</strong> updated ticket <em>{a.issueNumber}</em> to {a.status}</div>
                              <div className="activity-time" style={{fontSize:10}}>{new Date(a.updatedAt).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <button className="topbar-btn topbar-btn-primary" onClick={() => setShowCreate(true)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
                Report Issue
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="content-body">
            {isTeam ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>{teamPanel}</div>
            ) : (!isDashboard && !isAnalytics) ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>{issuePanel}</div>
            ) : (
              <>
                {/* STATS */}
            <div className="stats-grid">
              {STATS_LIVE.map((s, i) => (
                <div className="stat-card" key={s.label} style={{animationDelay:`${0.05+i*0.05}s`}}>
                  <div className="stat-accent" style={{background:s.bg,opacity:.5}} />
                  <div className="stat-icon" style={{background:s.bg,color:s.color}}>{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-num">{loadingStats ? '…' : s.value}</div>
                  <div className={`stat-change ${s.dir==='up'?'change-up':s.dir==='down'?'change-down':'change-neutral'}`}>
                    {s.dir==='up' && <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12"><path d="M6 9V3M3 6l3-3 3 3"/></svg>}
                    {s.dir==='down' && <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12"><path d="M6 3v6M3 6l3 3 3-3"/></svg>}
                    {s.dir==='neutral' ? 'unchanged' : 'from database'}
                  </div>
                </div>
              ))}
            </div>

            {/* TWO COL */}
            <div className={isAnalytics ? "analytics-grid" : "two-col"}>
              {!isAnalytics && issuePanel}

              {/* RIGHT COL */}
              <div className={isAnalytics ? "analytics-charts" : "right-col"}>
                {/* WEEKLY CHART */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Weekly trend</div>
                    <div className="panel-action">This week</div>
                  </div>
                  <div className="chart-wrap">
                    <div className="mini-chart">
                      {WEEK.length === 0 ? (
                        <div style={{color:'#9ba3b4',fontSize:12,margin:'auto'}}>Loading…</div>
                      ) : WEEK.map((d, i) => {
                        const hOpen = Math.round(((d.open||0) / maxWeekVal) * 60)
                        const hRes  = Math.round(((d.resolved||0) / maxWeekVal) * 60)
                        const dayLabel = (d.day||'').slice(0,1)
                        return (
                          <div className="bar-col" key={i}>
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,flex:1,justifyContent:'flex-end'}}>
                              <div className="bar" style={{height:hOpen,background:'#4f6ef7',opacity:.85}} title={`${d.open} open`} />
                              <div className="bar" style={{height:hRes,background:'#10b981',opacity:.7}} title={`${d.resolved} resolved`} />
                            </div>
                            <div className="bar-label">{dayLabel}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* PRIORITY BREAKDOWN */}
                <div className="panel">
                  <div className="panel-header"><div className="panel-title">Priority breakdown</div></div>
                  <div className="prio-list">
                    {[
                      {label:'Critical',color:'var(--red)',  key:'criticalIssues'},
                      {label:'High',    color:'var(--amber)',key:'highIssues'},
                      {label:'Medium',  color:'var(--blue)', key:'mediumIssues'},
                      {label:'Low',     color:'var(--text-muted)',key:'lowIssues'},
                    ].map(p => {
                      const val  = stats ? (stats[p.key] || 0) : 0
                      const max  = stats ? Math.max(stats.criticalIssues||0, stats.highIssues||0, stats.mediumIssues||0, stats.lowIssues||0, 1) : 1
                      const pct  = Math.round((val/max)*100)
                      return (
                        <div className="prio-row" key={p.label}>
                          <div className="prio-label" style={{color:p.color}}>{p.label}</div>
                          <div className="prio-bar-wrap"><div className="prio-bar" style={{width:`${pct}%`,background:p.color}} /></div>
                          <div className="prio-count">{val}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ACTIVITY FEED */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Activity feed</div>
                    <div className="panel-action">See all</div>
                  </div>
                  <div className="activity-list">
                    {ACTIVITY.length === 0 ? (
                      <div style={{padding:'16px 20px',color:'#9ba3b4',fontSize:12}}>No recent activity.</div>
                    ) : ACTIVITY.map((a, i) => {
                      const aColor = PRIO_COLORS['HIGH']
                      const initials = a.assigneeInitials || '??'
                      const actColor = ['#ef4444','#8b5cf6','#14b8a6','#f59e0b'][i % 4]
                      const st = STATUS_MAP[a.status] || { label: a.status }
                      const updatedAt = a.updatedAt
                        ? new Date(a.updatedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})
                        : ''
                      return (
                        <div className="activity-item" key={i}>
                          <div className="activity-avi" style={{background: actColor}}>{initials}</div>
                          <div className="activity-body">
                            <div className="activity-text">
                              <strong>{a.assigneeName || 'System'}</strong>
                              {' '}updated <em>{a.issueNumber}</em> → <em>{st.label}</em>
                            </div>
                            <div className="activity-time">{updatedAt}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="bottom-row">
              {/* CATEGORY OVERVIEW — live */}
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Category overview</div></div>
                <div className="cat-grid">
                  {CATS_LIVE.map(c => (
                    <div className="cat-card" key={c.name}>
                      <div className="cat-card-icon" style={{background:c.bg}}>{c.icon}</div>
                      <div className="cat-card-name" style={{color:c.color}}>{c.name}</div>
                      <div className="cat-card-count">{c.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP LOCATIONS — live */}
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Top locations</div></div>
                <div className="prio-list" style={{paddingTop:16}}>
                  {TOP_LOCS.length === 0 ? (
                    <div style={{color:'#9ba3b4',fontSize:12}}>No location data yet.</div>
                  ) : TOP_LOCS.map((l, i) => {
                    const val = Number(l.count)
                    const pct = Math.round((val / maxLocVal) * 100)
                    return (
                      <div className="prio-row" key={i}>
                        <div className="prio-label">{l.location}</div>
                        <div className="prio-bar-wrap">
                          <div className="prio-bar" style={{width:`${pct}%`,background:'#4f6ef7'}} />
                        </div>
                        <div className="prio-count">{val}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

              </>
            )}
          </div>{/* /content-body */}

          {/* ── DRAWERS ── */}
          {showCreate && (
            <div className="drawer-overlay" onClick={() => setShowCreate(false)}>
              <div className="drawer-panel" onClick={e => e.stopPropagation()}>
                <div className="drawer-head">
                  <div className="drawer-title">Report New Issue</div>
                  <div className="drawer-close" onClick={() => setShowCreate(false)}>✕</div>
                </div>
                <div className="drawer-body">
                  <form onSubmit={handleCreateSubmit}>
                    <div className="drawer-field">
                      <label>Title</label>
                      <input required placeholder="Brief title..." value={createForm.title} onChange={e=>setCreateForm(p=>({...p,title:e.target.value}))}/>
                    </div>
                    <div className="drawer-row">
                      <div className="drawer-field">
                        <label>Category</label>
                        <select value={createForm.category} onChange={e=>setCreateForm(p=>({...p,category:e.target.value}))}>
                          <option value="INFRASTRUCTURE">Infrastructure</option>
                          <option value="IT_NETWORK">IT & Network</option>
                          <option value="ACADEMIC">Academic</option>
                          <option value="SAFETY">Safety & Health</option>
                          <option value="FACILITIES">Facilities</option>
                        </select>
                      </div>
                      <div className="drawer-field">
                        <label>Priority</label>
                        <select value={createForm.priority} onChange={e=>setCreateForm(p=>({...p,priority:e.target.value}))}>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="drawer-field">
                      <label>Location / Dept</label>
                      <input required placeholder="E.g., Library 2nd Floor" value={createForm.location} onChange={e=>setCreateForm(p=>({...p,location:e.target.value}))}/>
                    </div>
                    <div className="drawer-field">
                      <label>Detailed Description</label>
                      <textarea required rows={5} placeholder="What exactly is the issue?" value={createForm.description} onChange={e=>setCreateForm(p=>({...p,description:e.target.value}))}/>
                    </div>
                    <button type="submit" className="topbar-btn-primary" style={{width:'100%',justifyContent:'center',marginTop:12}} disabled={createLoading}>
                      {createLoading ? 'Submitting...' : 'Submit Issue'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {detailIssue && (
            <div className="drawer-overlay" onClick={closeDetail}>
              <div className="drawer-panel" onClick={e => e.stopPropagation()}>
                <div className="drawer-head">
                  <div className="drawer-title">{detailIssue.issueNumber || 'Loading...'}</div>
                  <div className="drawer-close" onClick={closeDetail}>✕</div>
                </div>
                <div className="drawer-body" style={{opacity: detailLoading ? 0.6 : 1, transition:'opacity 0.2s'}}>
                  <h2 style={{fontSize:18,fontWeight:700,marginBottom:12,color:'var(--text-primary)'}}>{detailIssue.title}</h2>
                  <div style={{display:'flex',gap:10,marginBottom:20}}>
                    <span className={`status-badge ${STATUS_MAP[detailIssue.status]?.cls}`}>{STATUS_MAP[detailIssue.status]?.label}</span>
                    <span className={`cat-tag ${CAT_CLS[detailIssue.category]}`}>{CAT_LABEL[detailIssue.category]}</span>
                    <span style={{fontSize:11, background:'var(--main-bg)', padding:'4px 10px', borderRadius:20, color:'var(--text-secondary)', fontWeight:500}}>{detailIssue.priority} Priority</span>
                  </div>
                  
                  <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,marginBottom:24,padding:16,background:'var(--main-bg)',borderRadius:10}}>
                    <div style={{fontWeight:600,color:'var(--text-primary)',marginBottom:8}}>Location</div>
                    {detailIssue.location}
                  </div>

                  <div style={{fontSize:14,color:'var(--text-primary)',lineHeight:1.7,marginBottom:32}}>
                    <div style={{fontWeight:600,color:'var(--text-primary)',marginBottom:8,fontSize:13}}>Description</div>
                    {detailIssue.description}
                  </div>

                  <div style={{borderTop:'1px solid var(--border)',paddingTop:24}}>
                    <div style={{fontWeight:600,color:'var(--text-primary)',marginBottom:12,fontSize:13}}>Manage Workflow</div>
                    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                      {detailIssue.status !== 'IN_PROGRESS' && <button className="topbar-btn" onClick={()=>handleUpdateStatus('IN_PROGRESS')}><span style={{color:'var(--amber)'}}>●</span> Mark In Progress</button>}
                      {detailIssue.status !== 'RESOLVED' && <button className="topbar-btn" onClick={()=>handleUpdateStatus('RESOLVED')}><span style={{color:'var(--green)'}}>●</span> Resolve Issue</button>}
                      {detailIssue.status !== 'CLOSED' && <button className="topbar-btn" onClick={()=>handleUpdateStatus('CLOSED')}>Close Issue</button>}
                    </div>

                    <div style={{marginTop:24}}>
                      <div style={{fontWeight:600,color:'var(--text-primary)',marginBottom:8,fontSize:13}}>Assign To Staff</div>
                      <select className="topbar-btn" style={{width:'100%',background:'#fff',padding:10,fontFamily:'inherit'}} value={detailIssue.assignedTo?.id || 0} onChange={e=>handleAssign(e.target.value)}>
                        <option value={0}>Unassigned</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.department})</option>)}
                      </select>
                    </div>
                    
                    <div style={{marginTop:32, paddingTop:16, borderTop:'1px dotted var(--border)'}}>
                      <button className="topbar-btn" style={{color:'var(--red)',borderColor:'var(--red-bg)',background:'var(--red-bg)'}} onClick={handleDelete}>
                        <svg viewBox="0 0 16 16" width="14" fill="none" stroke="currentColor"><path d="M3 4h10M6 4V2h4v2" /><rect x="4" y="4" width="8" height="10" rx="1" /></svg>
                        Delete Issue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>{/* /main */}
      </div>{/* /layout */}
    </>
  )
}

// ── CSS (exact match to the HTML file) ───────────────────────────────────────
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;font-family:'Inter',sans-serif;background:#f7f8fa;color:#111318;}
:root{
  --sidebar-bg:#0d0f14;--sidebar-border:rgba(255,255,255,.06);--main-bg:#f7f8fa;--card-bg:#fff;
  --accent:#4f6ef7;--accent-light:#eef1ff;--accent-dark:#3451d1;
  --text-primary:#111318;--text-secondary:#5a6070;--text-muted:#9ba3b4;
  --border:rgba(0,0,0,.07);--border-strong:rgba(0,0,0,.12);
  --red:#ef4444;--red-bg:#fef2f2;--red-text:#991b1b;
  --amber:#f59e0b;--amber-bg:#fffbeb;--amber-text:#78350f;
  --blue:#3b82f6;--blue-bg:#eff6ff;--blue-text:#1e3a8a;
  --green:#10b981;--green-bg:#ecfdf5;--green-text:#065f46;
  --purple:#8b5cf6;--purple-bg:#f5f3ff;--purple-text:#4c1d95;
  --teal:#14b8a6;--teal-bg:#f0fdfa;--teal-text:#134e4a;
  --radius:12px;--radius-lg:16px;--radius-xl:20px;
}
.layout{display:grid;grid-template-columns:260px 1fr;height:100vh;overflow:hidden;}

/* SIDEBAR */
.sidebar{background:var(--sidebar-bg);display:flex;flex-direction:column;padding:0;overflow:hidden;position:relative;}
.sidebar::before{content:'';position:absolute;top:-80px;right:-80px;width:200px;height:200px;
  background:radial-gradient(circle,rgba(79,110,247,.18) 0%,transparent 70%);pointer-events:none;}
.sidebar::after{content:'';position:absolute;bottom:60px;left:-60px;width:180px;height:180px;
  background:radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%);pointer-events:none;}
.logo-area{padding:28px 24px 24px;border-bottom:1px solid var(--sidebar-border);display:flex;align-items:center;gap:12px;}
.logo-gem{width:36px;height:36px;background:linear-gradient(135deg,#4f6ef7,#7c3aed);border-radius:10px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.logo-gem svg{width:18px;height:18px;}
.logo-wordmark{display:flex;flex-direction:column;}
.logo-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;letter-spacing:-.3px;}
.logo-tagline{font-size:10px;color:rgba(255,255,255,.35);letter-spacing:1.2px;font-weight:500;margin-top:1px;text-transform:uppercase;}
.nav-group{padding:20px 16px 0;overflow-y:auto;}
.nav-group-label{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;
  color:rgba(255,255,255,.25);padding:0 8px;margin-bottom:6px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;cursor:pointer;
  margin-bottom:2px;color:rgba(255,255,255,.45);font-size:13.5px;font-weight:400;
  transition:all .18s ease;position:relative;user-select:none;}
.nav-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);}
.nav-item.active{background:rgba(79,110,247,.2);color:#fff;font-weight:500;}
.nav-item.active::before{content:'';position:absolute;left:0;top:6px;bottom:6px;
  width:3px;background:var(--accent);border-radius:0 3px 3px 0;}
.nav-icon{width:16px;height:16px;flex-shrink:0;}
.nav-pill{margin-left:auto;font-size:10px;font-weight:600;font-family:'JetBrains Mono',monospace;
  padding:2px 7px;border-radius:20px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.5);}
.nav-pill.hot{background:rgba(239,68,68,.2);color:#fca5a5;}
.nav-pill.active-pill{background:rgba(79,110,247,.3);color:#a5b4fc;}
.sidebar-divider{height:1px;background:var(--sidebar-border);margin:16px;}
.sidebar-bottom{margin-top:auto;padding:16px 16px 24px;border-top:1px solid var(--sidebar-border);position:relative;z-index:1;}
.user-card{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;
  background:rgba(255,255,255,.05);cursor:pointer;transition:background .15s;}
.user-card:hover{background:rgba(255,255,255,.08);}
.user-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#4f6ef7);
  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;}
.user-name{font-size:13px;font-weight:500;color:rgba(255,255,255,.85);}
.user-role{font-size:11px;color:rgba(255,255,255,.3);}
.user-status{margin-left:auto;width:8px;height:8px;border-radius:50%;background:var(--green);}

/* MAIN */
.main{display:flex;flex-direction:column;overflow:hidden;background:var(--main-bg);}
.topbar{display:flex;align-items:center;gap:14px;padding:18px 28px;background:#fff;border-bottom:1px solid var(--border);}
.topbar-left{flex:1;}
.page-heading{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--text-primary);letter-spacing:-.4px;}
.page-sub{font-size:12px;color:var(--text-muted);margin-top:1px;display:flex;align-items:center;gap:4px;}
.topbar-right{display:flex;align-items:center;gap:10px;}
.search-wrap{display:flex;align-items:center;gap:9px;background:var(--main-bg);border:1px solid var(--border-strong);
  border-radius:10px;padding:8px 14px;font-size:13px;color:var(--text-muted);cursor:text;min-width:220px;transition:border-color .15s;}
.search-wrap:hover{border-color:var(--accent);}
.search-wrap svg{width:14px;height:14px;opacity:.5;flex-shrink:0;}
.search-wrap span{flex:1;}
.search-kbd{font-family:'JetBrains Mono',monospace;font-size:10px;background:#fff;
  border:1px solid var(--border-strong);border-radius:5px;padding:1px 5px;color:var(--text-muted);}
.topbar-btn{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:10px;
  font-size:13px;font-weight:500;cursor:pointer;border:1px solid var(--border-strong);
  background:#fff;color:var(--text-secondary);font-family:'Inter',sans-serif;transition:all .15s;}
.topbar-btn:hover{background:var(--main-bg);border-color:var(--accent);color:var(--accent);}
.topbar-btn svg{width:14px;height:14px;}
.topbar-btn-primary{background:var(--accent);color:#fff;border-color:var(--accent);}
.topbar-btn-primary:hover{background:var(--accent-dark);border-color:var(--accent-dark);color:#fff;}
.notif-btn{width:36px;height:36px;border-radius:9px;border:1px solid var(--border-strong);
  background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:all .15s;}
.notif-btn:hover{border-color:var(--accent);}
.notif-btn svg{width:15px;height:15px;}
.notif-dot{width:7px;height:7px;background:var(--red);border-radius:50%;border:1.5px solid #fff;
  position:absolute;top:6px;right:6px;}

/* CONTENT */
.content-body{flex:1;overflow-y:auto;padding:24px 28px;display:flex;flex-direction:column;gap:20px;}

/* STATS */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
.stat-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px 20px;
  position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s;
  animation:fadeUp .4s ease both;}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.07);}
.stat-accent{position:absolute;top:0;right:0;width:70px;height:70px;border-radius:0 var(--radius-lg) 0 70px;}
.stat-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.stat-icon svg{width:16px;height:16px;}
.stat-label{font-size:12px;font-weight:500;color:var(--text-muted);margin-bottom:5px;}
.stat-num{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:var(--text-primary);letter-spacing:-.8px;line-height:1;}
.stat-change{display:flex;align-items:center;gap:4px;margin-top:8px;font-size:11.5px;}
.stat-change svg{width:12px;height:12px;}
.change-up{color:var(--green);}
.change-down{color:var(--red);}
.change-neutral{color:var(--text-muted);}

/* TWO-COL */
.two-col{display:grid;grid-template-columns:1fr 340px;gap:16px;}

/* PANEL */
.panel{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;
  animation:fadeUp .4s ease .25s both;}
.analytics-grid{display:flex;flex-direction:column;gap:16px;}
.analytics-charts{display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;}
@media(max-width:1100px) { .analytics-charts{grid-template-columns:1fr 1fr;} }
.panel-header{display:flex;align-items:center;padding:18px 20px;border-bottom:1px solid var(--border);gap:12px;}
.panel-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text-primary);flex:1;letter-spacing:-.2px;}
.panel-action{font-size:12px;font-weight:500;color:var(--accent);cursor:pointer;display:flex;align-items:center;gap:4px;
  padding:5px 10px;border-radius:7px;border:1px solid transparent;transition:all .15s;}
.panel-action:hover{background:var(--accent-light);border-color:rgba(79,110,247,.2);}

/* FILTER TABS */
.filter-tabs{display:flex;gap:4px;padding:12px 20px;border-bottom:1px solid var(--border);overflow-x:auto;}
.filter-tab{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;
  font-size:12px;font-weight:500;cursor:pointer;color:var(--text-muted);white-space:nowrap;
  border:1px solid transparent;transition:all .15s;user-select:none;}
.filter-tab:hover{background:var(--main-bg);color:var(--text-secondary);}
.filter-tab.active{background:var(--accent-light);color:var(--accent);border-color:rgba(79,110,247,.25);}
.tab-count{font-family:'JetBrains Mono',monospace;font-size:10px;}

/* ISSUE TABLE */
.issue-table-header{display:grid;grid-template-columns:18px 1fr 110px 90px 80px 72px;
  align-items:center;gap:14px;padding:9px 20px;background:var(--main-bg);border-bottom:1px solid var(--border);}
.th-label{font-size:11px;font-weight:600;color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;}
.issue-table{display:flex;flex-direction:column;}
.issue-row{display:grid;grid-template-columns:18px 1fr 110px 90px 80px 72px;
  align-items:center;gap:14px;padding:13px 20px;border-bottom:1px solid var(--border);
  cursor:pointer;transition:background .12s;}
.issue-row:hover{background:#fafbff;}
.issue-row:last-child{border-bottom:none;}
.issue-row.selected{background:var(--accent-light);}
.p-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.p-critical{background:var(--red);box-shadow:0 0 0 3px rgba(239,68,68,.15);}
.p-high{background:var(--amber);box-shadow:0 0 0 3px rgba(245,158,11,.15);}
.p-medium{background:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,.15);}
.p-low{background:var(--text-muted);}
.issue-name{font-size:13px;font-weight:500;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.issue-meta-row{display:flex;align-items:center;gap:6px;margin-top:2px;}
.issue-id{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-muted);}
.issue-loc{font-size:11px;color:var(--text-muted);}
.dot-sep{color:var(--text-muted);font-size:10px;}
.cat-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;
  padding:3px 9px;border-radius:20px;white-space:nowrap;}
.ct-infra{background:#fef3c7;color:#92400e;}
.ct-it{background:var(--purple-bg);color:var(--purple-text);}
.ct-safety{background:var(--red-bg);color:var(--red-text);}
.ct-academic{background:var(--teal-bg);color:var(--teal-text);}
.ct-facilities{background:#fdf4ff;color:#6b21a8;}
.status-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;
  padding:4px 10px;border-radius:20px;white-space:nowrap;}
.status-badge::before{content:'';width:5px;height:5px;border-radius:50%;}
.sb-open{background:var(--blue-bg);color:var(--blue-text);}
.sb-open::before{background:var(--blue);}
.sb-progress{background:var(--amber-bg);color:var(--amber-text);}
.sb-progress::before{background:var(--amber);}
.sb-resolved{background:var(--green-bg);color:var(--green-text);}
.sb-resolved::before{background:var(--green);}
.sb-closed{background:#f3f4f6;color:#374151;}
.sb-closed::before{background:#6b7280;}
.issue-date{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-muted);white-space:nowrap;}
.assignee-avatar{width:24px;height:24px;border-radius:50%;font-size:9px;font-weight:700;color:#fff;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;}

/* RIGHT COL */
.right-col{display:flex;flex-direction:column;gap:16px;animation:fadeUp .4s ease .3s both;}
.chart-wrap{padding:16px 20px;}
.mini-chart{display:flex;align-items:flex-end;gap:5px;height:60px;}
.bar-col{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;}
.bar{width:100%;border-radius:4px 4px 0 0;transition:height .3s ease;cursor:pointer;}
.bar:hover{opacity:.8!important;}
.bar-label{font-size:10px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;}
.prio-list{padding:0 20px 16px;}
.prio-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.prio-row:last-child{margin-bottom:0;}
.prio-label{font-size:12px;color:var(--text-secondary);font-weight:500;min-width:60px;}
.prio-bar-wrap{flex:1;height:6px;background:var(--main-bg);border-radius:10px;overflow:hidden;}
.prio-bar{height:100%;border-radius:10px;}
.prio-count{font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text-muted);min-width:24px;text-align:right;}
.activity-list{padding:0 20px 16px;}
.activity-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.activity-item:last-child{border-bottom:none;}
.activity-avi{width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;
  justify-content:center;font-size:10px;font-weight:700;color:#fff;}
.activity-text{font-size:12.5px;color:var(--text-secondary);line-height:1.5;}
.activity-text strong{color:var(--text-primary);font-weight:600;}
.activity-time{font-size:11px;color:var(--text-muted);margin-top:2px;font-family:'JetBrains Mono',monospace;}

/* BOTTOM ROW */
.bottom-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px 20px;}
.cat-card{border:1px solid var(--border);border-radius:10px;padding:12px 14px;cursor:pointer;transition:all .15s;}
.cat-card:hover{border-color:var(--accent);background:var(--accent-light);}
.cat-card-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;}
.cat-card-icon svg{width:14px;height:14px;}
.cat-card-name{font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:2px;}
.cat-card-count{font-size:11px;color:var(--text-muted);}

/* ANIMATIONS */
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

.live-dot{width:7px;height:7px;background:var(--green);border-radius:50%;
  animation:pulse 2s ease infinite;display:inline-block;margin-right:2px;}

/* DRAWER */
.drawer-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);
  backdrop-filter:blur(3px);z-index:9999;display:flex;justify-content:flex-end;
  animation:fadeIn .25s ease;}
.drawer-panel{width:460px;max-width:100%;background:#fff;height:100%;box-shadow:-4px 0 24px rgba(0,0,0,.15);
  display:flex;flex-direction:column;animation:slideIn .35s cubic-bezier(0.16, 1, 0.3, 1);}
.drawer-head{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;}
.drawer-title{font-family:'Syne',sans-serif;font-weight:700;font-size:17px;flex:1;letter-spacing:-.3px;}
.drawer-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  background:var(--main-bg);border-radius:50%;cursor:pointer;font-size:12px;color:var(--text-muted);transition:all .15s;}
.drawer-close:hover{background:var(--red-bg);color:var(--red);}
.drawer-body{padding:24px;flex:1;overflow-y:auto;}
.drawer-field{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
.drawer-field label{font-size:12px;font-weight:600;color:var(--text-secondary);}
.drawer-field input, .drawer-field select, .drawer-field textarea{
  padding:12px 14px;border-radius:10px;border:1px solid var(--border-strong);
  font-family:'Inter',sans-serif;font-size:14px;color:var(--text-primary);outline:none;
  transition:border-color .15s;background:#fff;}
.drawer-field input:focus, .drawer-field select:focus, .drawer-field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-light);}
.drawer-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}

@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}

/* SCROLLBAR */
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:10px;}
`
