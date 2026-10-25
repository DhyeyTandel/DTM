export const TOKEN_STORAGE_KEY = 'dtm-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
