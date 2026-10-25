import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError, HTTP_CONFLICT } from '../api/client'
import { purchaseVehicle } from '../api/vehicles'
import type { CardNotice } from '../lib/cardNotice'
import { replaceVehicleInList, vehiclesKey } from './useVehicles'
import { useToken } from './useToken'

const PURCHASE_COMPLETE: CardNotice = { kind: 'success', message: 'Purchase complete.' }
const LOST_THE_LAST_ONE: CardNotice = {
  kind: 'error',
  message: 'Sorry, someone else just got the last one.',
}
const DID_NOT_GO_THROUGH: CardNotice = {
  kind: 'error',
  message: 'The purchase did not go through. Please try again.',
}

export function usePurchase() {
  const queryClient = useQueryClient()
  const token = useToken()
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set())
  const [notices, setNotices] = useState<ReadonlyMap<number, CardNotice>>(new Map())

  function showNotice(vehicleId: number, notice: CardNotice | null): void {
    setNotices((current) => {
      const next = new Map(current)
      if (notice) next.set(vehicleId, notice)
      else next.delete(vehicleId)
      return next
    })
  }

  const mutation = useMutation({
    mutationFn: purchaseVehicle,
    onMutate: (vehicleId) => {
      setPendingIds((current) => new Set(current).add(vehicleId))
      showNotice(vehicleId, null)
    },
    onSuccess: (vehicle) => {
      replaceVehicleInList(queryClient, token, vehicle)
      showNotice(vehicle.id, PURCHASE_COMPLETE)
    },
    onError: (error, vehicleId) => {
      if (error instanceof ApiError && error.status === HTTP_CONFLICT) {
        showNotice(vehicleId, LOST_THE_LAST_ONE)
        void queryClient.invalidateQueries({ queryKey: vehiclesKey(token) })
      } else {
        showNotice(vehicleId, DID_NOT_GO_THROUGH)
      }
    },
    onSettled: (_vehicle, _error, vehicleId) => {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(vehicleId)
        return next
      })
    },
  })

  return { purchase: mutation.mutate, pendingIds, notices }
}
