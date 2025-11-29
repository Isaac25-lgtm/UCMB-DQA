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

export async function fetchFacilities(): Promise<Facility[]> {
  const response = await fetch(`${API_BASE}/facilities`)
  if (!response.ok) throw new Error('Failed to fetch facilities')
  return response.json()
}

export async function fetchIndicators(): Promise<Indicator[]> {
  const response = await fetch(`${API_BASE}/indicators`)
  if (!response.ok) throw new Error('Failed to fetch indicators')
  return response.json()
}

export async function fetchTeams(): Promise<TeamsResponse> {
  const response = await fetch(`${API_BASE}/teams`)
  if (!response.ok) throw new Error('Failed to fetch teams')
  return response.json()
}

export async function fetchSessions(): Promise<DqaSessionSummary[]> {
  const response = await fetch(`${API_BASE}/sessions`)
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
  const response = await fetch(`${API_BASE}/export`)
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

export async function downloadSessionExport(sessionId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/export/session/${sessionId}`)
  if (!response.ok) throw new Error('Failed to download session export')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dqa_session_${sessionId}.xlsx`
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
    body: formData,
  })
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
  const response = await fetch(`${API_BASE}/dashboard/stats`)
  if (!response.ok) throw new Error('Failed to fetch dashboard stats')
  return response.json()
}

export async function deleteSession(sessionId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to delete session')
  }
}

export async function downloadEnhancedReport(): Promise<void> {
  const response = await fetch(`${API_BASE}/reports/enhanced`)
  if (!response.ok) throw new Error('Failed to download enhanced report')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dqa_enhanced_report.xlsx'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

