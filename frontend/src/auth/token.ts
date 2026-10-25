export const TOKEN_STORAGE_KEY = 'dtm-token'

const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => {
    listener()
  })
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  notify()
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  notify()
}

export function subscribeToToken(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
