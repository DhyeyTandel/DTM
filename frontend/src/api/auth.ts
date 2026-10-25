import { request } from './client'
import type { CurrentUser } from './types'

interface TokenResponse {
  access_token: string
}

export async function login(email: string, password: string): Promise<string> {
  const response = await request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  return response.access_token
}

export function register(email: string, password: string): Promise<CurrentUser> {
  return request<CurrentUser>('/auth/register', { method: 'POST', body: { email, password } })
}

export function fetchCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>('/auth/me')
}
