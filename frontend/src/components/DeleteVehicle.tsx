import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Vehicle } from '../api/types'
import { useDeleteVehicle } from '../hooks/useVehicleAdmin'
import { Button } from './Button'

export function DeleteVehicle({ vehicle }: { vehicle: Vehicle }) {
  const [confirming, setConfirming] = useState(false)
  const remove = useDeleteVehicle(vehicle.id)
  const navigate = useNavigate()

  if (!confirming) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          setConfirming(true)
        }}
      >
        Delete
      </Button>
    )
  }

  return (
    <div className="border border-line p-4">
      <p className="font-semibold">
        Delete {vehicle.make} {vehicle.model}? This cannot be undone.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          disabled={remove.isPending}
          onClick={() => {
            remove.mutate(undefined, {
              onSuccess: () => {
                void navigate('/')
              },
            })
          }}
        >
          Yes, delete
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setConfirming(false)
          }}
        >
          Cancel
        </Button>
      </div>
      {remove.error && (
        <p role="alert" className="mt-3 text-error">
          {remove.error.message}
        </p>
      )}
    </div>
  )
}
