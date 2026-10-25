import { useQueryClient } from '@tanstack/react-query'
import { clearToken } from '../auth/token'

export function useSignOut() {
  const queryClient = useQueryClient()
  return () => {
    clearToken()
    queryClient.clear()
  }
}
