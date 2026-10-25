import { useId } from 'react'
import type { Vehicle } from '../api/types'
import { categoryLabel } from '../lib/categories'
import { formatPrice } from '../lib/money'
import { formatStockNumber } from '../lib/stockNumber'
import {
  OUT_OF_STOCK_LABEL,
  isSoldOut,
  stockLabel,
  stockStatus,
  type StockStatus,
} from '../lib/stock'
import { Button } from './Button'
import { VehiclePhoto } from './VehiclePhoto'

interface VehicleCardProps {
  vehicle: Vehicle
  onPurchase: (vehicleId: number) => void
  onDetails: (vehicleId: number) => void
}

const DOT_CLASSES: Record<StockStatus, string> = {
  'in-stock': 'bg-ok',
  low: 'bg-low',
  'sold-out': 'bg-gone',
}

export function VehicleCard({ vehicle, onPurchase, onDetails }: VehicleCardProps) {
  const titleId = useId()
  const name = `${vehicle.make} ${vehicle.model}`
  const soldOut = isSoldOut(vehicle.quantity)

  return (
    <article className="flex h-full flex-col border border-line bg-surface">
      <VehiclePhoto imageUrl={vehicle.image_url} description={name} quantity={vehicle.quantity} />
      <div className="flex flex-1 flex-col p-4">
        <h3 id={titleId}>
          <span className="block font-display text-[1.75rem] leading-none font-bold uppercase">
            {vehicle.make}
          </span>{' '}
          <span className="mt-1 block text-xl leading-tight font-semibold text-brand-text">
            {vehicle.model}
          </span>
        </h3>
        <p className="mt-2 flex items-center text-sm text-ink-muted">
          <span>{formatStockNumber(vehicle.id)}</span>
          <span aria-hidden="true" className="mx-3 h-4 border-l border-line" />
          <span>{categoryLabel(vehicle.category)}</span>
        </p>
        <p className="mt-4 text-xs font-semibold tracking-widest text-ink-muted uppercase">
          Ex-showroom price
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <p className="text-[1.625rem] leading-none font-bold">{formatPrice(vehicle.price)}</p>
          <p className="flex items-center gap-2 pb-0.5 whitespace-nowrap">
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${DOT_CLASSES[stockStatus(vehicle.quantity)]}`}
            />
            {stockLabel(vehicle.quantity)}
          </p>
        </div>
        <div className="mt-auto pt-4">
          <div className="grid grid-cols-2 gap-2 border-t border-line pt-3">
            <Button
              aria-describedby={titleId}
              disabled={soldOut}
              onClick={() => {
                onPurchase(vehicle.id)
              }}
            >
              {soldOut ? OUT_OF_STOCK_LABEL : 'Purchase'}
            </Button>
            <Button
              variant="outline"
              aria-describedby={titleId}
              onClick={() => {
                onDetails(vehicle.id)
              }}
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
