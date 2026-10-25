import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser } from '../api/auth'
import { useToken } from './useToken'

export function useCurrentUser() {
  const token = useToken()
  return useQuery({
    queryKey: ['me', token],
    queryFn: fetchCurrentUser,
    enabled: token !== null,
  })
}
