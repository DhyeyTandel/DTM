import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Vehicle } from '../api/types'
import {
  createVehicle,
  deleteVehicle,
  restockVehicle,
  updateVehicle,
  type VehicleChanges,
} from '../api/vehicles'
import { useToken } from './useToken'
import { vehiclesKey } from './useVehicles'

function useRefreshList() {
  const queryClient = useQueryClient()
  const token = useToken()
  return () => queryClient.invalidateQueries({ queryKey: vehiclesKey(token) })
}

export function useCreateVehicle() {
  const refreshList = useRefreshList()
  return useMutation({ mutationFn: createVehicle, onSuccess: refreshList })
}

export function useUpdateVehicle(vehicleId: number) {
  const refreshList = useRefreshList()
  return useMutation({
    mutationFn: (changes: VehicleChanges) => updateVehicle(vehicleId, changes),
    onSuccess: refreshList,
  })
}

export function useDeleteVehicle(vehicleId: number) {
  const refreshList = useRefreshList()
  return useMutation({ mutationFn: () => deleteVehicle(vehicleId), onSuccess: refreshList })
}

export function useRestockVehicle(vehicleId: number) {
  const queryClient = useQueryClient()
  const token = useToken()
  return useMutation({
    mutationFn: (amount: number) => restockVehicle(vehicleId, amount),
    onSuccess: (vehicle) => {
      queryClient.setQueryData<Vehicle[]>(vehiclesKey(token), (list) =>
        list?.map((existing) => (existing.id === vehicle.id ? vehicle : existing)),
      )
    },
  })
}
