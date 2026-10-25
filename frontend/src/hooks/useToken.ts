import { useSyncExternalStore } from 'react'
import { getToken, subscribeToToken } from '../auth/token'

export function useToken(): string | null {
  return useSyncExternalStore(subscribeToToken, getToken)
}
