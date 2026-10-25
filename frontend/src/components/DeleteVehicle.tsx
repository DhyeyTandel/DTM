import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Vehicle } from '../api/types'
import { useDeleteVehicle } from '../hooks/useVehicleAdmin'
import { Button } from './Button'

export function DeleteVehicle({ vehicle }: { vehicle: Vehicle }) {
  const [confirming, setConfirming] = useState(false)
  const deleteMutation = useDeleteVehicle(vehicle.id)
  const navigate = useNavigate()
  const questionId = useId()
  const deleteButton = useRef<HTMLButtonElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const hasAsked = useRef(false)

  useEffect(() => {
    if (!hasAsked.current) return
    ;(confirming ? cancelButton : deleteButton).current?.focus()
  }, [confirming])

  function ask(asking: boolean): void {
    hasAsked.current = true
    setConfirming(asking)
  }

  if (!confirming) {
    return (
      <Button
        ref={deleteButton}
        variant="outline"
        onClick={() => {
          ask(true)
        }}
      >
        Delete
      </Button>
    )
  }

  return (
    <div role="group" aria-labelledby={questionId} className="border border-line p-4">
      <p id={questionId} className="font-semibold">
        Delete {vehicle.make} {vehicle.model}? This cannot be undone.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          disabled={deleteMutation.isPending}
          onClick={() => {
            deleteMutation.mutate(undefined, {
              onSuccess: () => {
                void navigate('/')
              },
            })
          }}
        >
          Yes, delete
        </Button>
        <Button
          ref={cancelButton}
          variant="outline"
          onClick={() => {
            ask(false)
          }}
        >
          Cancel
        </Button>
      </div>
      {deleteMutation.error && (
        <p role="alert" className="mt-3 text-error">
          {deleteMutation.error.message}
        </p>
      )}
    </div>
  )
}
