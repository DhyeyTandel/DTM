import { useQuery, type QueryClient } from '@tanstack/react-query'
import type { Vehicle } from '../api/types'
import { listVehicles } from '../api/vehicles'
import { useToken } from './useToken'

export function vehiclesKey(token: string | null) {
  return ['vehicles', token]
}

export function replaceVehicleInList(
  queryClient: QueryClient,
  token: string | null,
  vehicle: Vehicle,
): void {
  queryClient.setQueryData<Vehicle[]>(vehiclesKey(token), (list) =>
    list?.map((existing) => (existing.id === vehicle.id ? vehicle : existing)),
  )
}

export function useVehicles() {
  const token = useToken()
  return useQuery({
    queryKey: vehiclesKey(token),
    queryFn: listVehicles,
    enabled: token !== null,
  })
}

export function useVehicle(vehicleId: number) {
  const { data: vehicles, ...query } = useVehicles()
  return { ...query, vehicle: vehicles?.find((candidate) => candidate.id === vehicleId) }
}
