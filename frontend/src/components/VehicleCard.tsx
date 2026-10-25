import { useId } from 'react'
import type { Vehicle } from '../api/types'
import { formatPrice } from '../lib/money'
import { OUT_OF_STOCK_LABEL, isSoldOut } from '../lib/stock'
import { Button } from './Button'
import { StockLabel } from './StockLabel'
import { VehiclePhoto } from './VehiclePhoto'

interface VehicleCardProps {
  vehicle: Vehicle
  onPurchase: (vehicleId: number) => void
}

export function VehicleCard({ vehicle, onPurchase }: VehicleCardProps) {
  const titleId = useId()
  const name = `${vehicle.make} ${vehicle.model}`
  const soldOut = isSoldOut(vehicle.quantity)

  return (
    <article className="flex flex-col">
      <VehiclePhoto imageUrl={vehicle.image_url} description={name} />
      <h3 id={titleId} className="mt-4 text-title font-semibold tracking-tight">
        {name}
      </h3>
      <p className="text-ink-muted capitalize">{vehicle.category}</p>
      <p className="mt-2 text-price font-bold tracking-tight tabular-nums">
        {formatPrice(vehicle.price)}
      </p>
      <StockLabel quantity={vehicle.quantity} />
      <Button
        aria-describedby={titleId}
        disabled={soldOut}
        onClick={() => {
          onPurchase(vehicle.id)
        }}
        className="mt-4"
      >
        {soldOut ? OUT_OF_STOCK_LABEL : 'Purchase'}
      </Button>
    </article>
  )
}
