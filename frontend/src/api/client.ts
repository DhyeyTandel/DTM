import { clearToken, getToken } from '../auth/token'

const API_BASE = '/api'
const UNAUTHORIZED = 401

export async function request<T>(path: string): Promise<T> {
  const token = getToken()
  const response = await fetch(new URL(`${API_BASE}${path}`, window.location.origin), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (response.status === UNAUTHORIZED) {
    clearToken()
  }
  return (await response.json()) as T
}
