import { useQuery } from '@tanstack/react-query'
import { listVehicles } from '../api/vehicles'
import { useToken } from './useToken'

export function vehiclesKey(token: string | null) {
  return ['vehicles', token]
}

export function useVehicles() {
  const token = useToken()
  return useQuery({
    queryKey: vehiclesKey(token),
    queryFn: listVehicles,
    enabled: token !== null,
  })
}
