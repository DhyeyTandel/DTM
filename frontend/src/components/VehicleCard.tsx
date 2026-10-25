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
        <h3 id={titleId} className="text-[1.375rem] leading-snug font-semibold">
          {name}
        </h3>
        <p className="mt-1 text-[1.0625rem]">
          <span>{categoryLabel(vehicle.category)}</span> ·{' '}
          <span>{formatStockNumber(vehicle.id)}</span>
        </p>
        <p className="mt-4 text-[0.8125rem] tracking-[0.12em] text-ink-muted">Ex-showroom price</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <p className="text-2xl leading-none font-normal">{formatPrice(vehicle.price)}</p>
          <p className="flex items-center gap-2 pb-0.5 text-[0.9375rem] font-semibold whitespace-nowrap">
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
              variant="dark"
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
