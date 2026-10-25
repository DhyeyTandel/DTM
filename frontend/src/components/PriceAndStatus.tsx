import type { Vehicle } from '../api/types'
import { formatPrice } from '../lib/money'
import { stockLabel, stockStatus, type StockStatus } from '../lib/stock'

const DOT_CLASSES: Record<StockStatus, string> = {
  'in-stock': 'bg-ok',
  low: 'bg-low',
  'sold-out': 'bg-gone',
}

interface PriceAndStatusProps {
  vehicle: Vehicle
  large?: boolean
}

export function PriceAndStatus({ vehicle, large = false }: PriceAndStatusProps) {
  return (
    <div>
      <p className="text-[0.8125rem] tracking-[0.12em] text-ink-muted">Ex-showroom price</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <p className={`${large ? 'text-4xl' : 'text-2xl'} leading-none font-normal`}>
          {formatPrice(vehicle.price)}
        </p>
        <p className="flex items-center gap-2 pb-0.5 text-[0.9375rem] font-semibold whitespace-nowrap">
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${DOT_CLASSES[stockStatus(vehicle.quantity)]}`}
          />
          {stockLabel(vehicle.quantity)}
        </p>
      </div>
    </div>
  )
}
