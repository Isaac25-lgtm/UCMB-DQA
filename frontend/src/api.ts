import type {
  Facility,
  Indicator,
  DqaSessionCreate,
  DqaSessionResponse,
  DqaSessionSummary,
  TeamsResponse,
} from './types'

export type { DqaSessionSummary }

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function fetchFacilities(): Promise<Facility[]> {
  const response = await fetch(`${API_BASE}/facilities`)
  if (!response.ok) throw new Error('Failed to fetch facilities')
  return response.json()
}

export async function fetchIndicators(): Promise<Indicator[]> {
  try {
    console.log(`[API] Fetching indicators from ${API_BASE}/indicators`)
    const response = await fetch(`${API_BASE}/indicators`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`[API] Response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API] Error response:`, errorText)
      throw new Error(`Failed to fetch indicators: ${response.status} ${response.statusText}. ${errorText}`)
    }
    
    const data = await response.json()
    console.log(`[API] Received ${data.length} indicators`)
    return data
  } catch (err) {
    console.error(`[API] Fetch error:`, err)
    if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
      throw new Error(`Cannot connect to backend at ${API_BASE}. Please ensure the backend server is running on port 8000.`)
    }
    throw err
  }
}

export async function fetchTeams(): Promise<TeamsResponse> {
  const response = await fetch(`${API_BASE}/teams`)
  if (!response.ok) throw new Error('Failed to fetch teams')
  return response.json()
}

export async function login(username: string, password: string): Promise<{ access_token: string }> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }
  return response.json()
}

export async function fetchSessions(): Promise<DqaSessionSummary[]> {
  const response = await fetch(`${API_BASE}/sessions`, {
    headers: getAuthHeaders(),
  })
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!response.ok) throw new Error('Failed to fetch sessions')
  return response.json()
}

export async function fetchSession(id: number): Promise<DqaSessionResponse> {
  const response = await fetch(`${API_BASE}/sessions/${id}`)
  if (!response.ok) throw new Error('Failed to fetch session')
  return response.json()
}

export async function createSession(
  data: DqaSessionCreate
): Promise<DqaSessionResponse> {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create session')
  }
  return response.json()
}

export async function downloadExport(): Promise<void> {
  const response = await fetch(`${API_BASE}/export`, {
    headers: getAuthHeaders(),
  })
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!response.ok) throw new Error('Failed to download export')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dqa_export.xlsx'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export async function uploadCsv(file: File, team?: string): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  if (team) {
    formData.append('team', team)
  }
  const response = await fetch(`${API_BASE}/sessions/upload-csv`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to upload CSV')
  }
}

export interface DashboardStats {
  total_facilities: number
  assessed_facilities: number
  total_sessions: number
  team_progress: Array<{
    team: string
    facilities_assessed: number
  }>
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: getAuthHeaders(),
  })
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!response.ok) throw new Error('Failed to fetch dashboard stats')
  return response.json()
}

export async function deleteSession(sessionId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to delete session')
  }
}

