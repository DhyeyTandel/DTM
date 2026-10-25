import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser } from '../api/auth'
import { useToken } from './useToken'

export function currentUserKey(token: string | null) {
  return ['me', token]
}

export function useCurrentUser() {
  const token = useToken()
  return useQuery({
    queryKey: currentUserKey(token),
    queryFn: fetchCurrentUser,
    enabled: token !== null,
  })
}
