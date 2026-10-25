import { clearToken, getToken } from '../auth/token'

const API_BASE = '/api'
const UNAUTHORIZED = 401
const NO_CONTENT = 204

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

interface ValidationIssue {
  msg?: unknown
}

function readableDetail(detail: unknown): string | null {
  if (typeof detail === 'string') return detail
  if (!Array.isArray(detail)) return null
  const messages = (detail as ValidationIssue[])
    .map((issue) => issue.msg)
    .filter((message): message is string => typeof message === 'string')
  return messages.length > 0 ? messages.join('. ') : null
}

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null
  return readableDetail(body?.detail) ?? response.statusText
}

function headersFor(token: string | null, hasBody: boolean): Record<string, string> {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
  }
}

export async function request<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(new URL(`${API_BASE}${path}`, window.location.origin), {
    method,
    headers: headersFor(getToken(), body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === UNAUTHORIZED) {
    clearToken()
  }
  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response))
  }
  if (response.status === NO_CONTENT) {
    return undefined as T
  }
  return (await response.json()) as T
}
