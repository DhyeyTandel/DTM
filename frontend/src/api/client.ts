import { getToken } from '../auth/token'

const API_BASE = '/api'

export async function request<T>(path: string): Promise<T> {
  const token = getToken()
  const response = await fetch(new URL(`${API_BASE}${path}`, window.location.origin), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return (await response.json()) as T
}
