import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
})

// Automatically attach JWT token to every request if user is logged in
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fp_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fp_token')
      localStorage.removeItem('fp_user')
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/api/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data).then(r => r.data),

  me: () =>
    api.get('/api/auth/me').then(r => r.data),
}

// ── Matches ───────────────────────────────────────────────────────────────────
export const matchesApi = {
  list: (params?: { leagueId?: number; status?: string; page?: number }) =>
    api.get('/api/matches', { params }).then(r => r.data),

  upcoming: () =>
    api.get('/api/matches/upcoming').then(r => r.data),

  get: (id: number) =>
    api.get(`/api/matches/${id}`).then(r => r.data),
}

// ── Teams ─────────────────────────────────────────────────────────────────────
export const teamsApi = {
  list: (leagueId?: number) =>
    api.get('/api/teams', { params: { leagueId } }).then(r => r.data),

  get: (id: number) =>
    api.get(`/api/teams/${id}`).then(r => r.data),
}

// ── Predictions ───────────────────────────────────────────────────────────────
export const predictionsApi = {
  submit: (data: { matchId: number; predictedHome: number; predictedAway: number }) =>
    api.post('/api/predictions', data).then(r => r.data),

  mine: () =>
    api.get('/api/predictions/mine').then(r => r.data),

  leaderboard: () =>
    api.get('/api/predictions/leaderboard').then(r => r.data),
}

export default api

