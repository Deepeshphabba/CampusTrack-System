import axios from 'axios'

// ─── Base instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Request interceptor: attach JWT ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ct_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor: handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ct_token')
      localStorage.removeItem('ct_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data) => api.post('/auth/login',    data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
}

// ─── Issues ────────────────────────────────────────────────────────────────
export const issuesApi = {
  // list / filter
  getAll:     (params)    => api.get('/issues', { params }),        // ?status=&category=&keyword=
  getById:    (id)        => api.get(`/issues/${id}`),
  getMy:      ()          => api.get('/issues/my'),
  getAssigned:()          => api.get('/issues/assigned'),
  getStats:   ()          => api.get('/issues/stats'),

  // mutate
  create:       (data)    => api.post('/issues', data),
  update:       (id,data) => api.put(`/issues/${id}`, data),
  updateStatus: (id,status)=> api.patch(`/issues/${id}/status`, { status }),
  delete:       (id)      => api.delete(`/issues/${id}`),
}

// ─── Users ─────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll:  () => api.get('/users'),
  getStaff:() => api.get('/users/staff'),
  getById: (id) => api.get(`/users/${id}`),
}

export default api
