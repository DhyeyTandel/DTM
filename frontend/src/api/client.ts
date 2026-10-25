import { clearToken, getToken } from '../auth/token'

const API_BASE = '/api'
const UNAUTHORIZED = 401

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null
  return typeof body?.detail === 'string' ? body.detail : response.statusText
}

export async function request<T>(path: string): Promise<T> {
  const token = getToken()
  const response = await fetch(new URL(`${API_BASE}${path}`, window.location.origin), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (response.status === UNAUTHORIZED) {
    clearToken()
  }
  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response))
  }
  return (await response.json()) as T
}
