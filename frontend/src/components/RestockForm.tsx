import { useState, type SyntheticEvent } from 'react'
import type { Vehicle } from '../api/types'
import { useRestockVehicle } from '../hooks/useVehicleAdmin'
import { restockError } from '../lib/vehicleForm'
import { Button } from './Button'
import { TextField } from './TextField'

export function RestockForm({ vehicle }: { vehicle: Vehicle }) {
  const restock = useRestockVehicle(vehicle.id)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | undefined>()

  function handleSubmit(event: SyntheticEvent): void {
    event.preventDefault()
    const found = restockError(amount)
    setError(found)
    if (found === undefined) {
      restock.mutate(Number(amount), {
        onSuccess: () => {
          setAmount('')
        },
      })
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-wrap items-start gap-3">
      <TextField
        label="Restock amount"
        inputMode="numeric"
        value={amount}
        error={error}
        onChange={(event) => {
          setAmount(event.target.value)
        }}
      />
      <Button type="submit" disabled={restock.isPending} className="mt-7">
        Restock
      </Button>
      {restock.error && (
        <p role="alert" className="basis-full text-error">
          {restock.error.message}
        </p>
      )}
    </form>
  )
}
