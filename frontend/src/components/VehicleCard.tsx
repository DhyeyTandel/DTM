import { useId } from 'react'
import type { Vehicle } from '../api/types'
import type { CardNotice } from '../lib/cardNotice'
import { categoryLabel } from '../lib/categories'
import { formatStockNumber } from '../lib/stockNumber'
import { OUT_OF_STOCK_LABEL, isSoldOut } from '../lib/stock'
import { Button } from './Button'
import { NoticeText } from './NoticeText'
import { PriceAndStatus } from './PriceAndStatus'
import { VehiclePhoto } from './VehiclePhoto'

interface VehicleCardProps {
  vehicle: Vehicle
  purchasing?: boolean
  notice?: CardNotice
  onPurchase: (vehicleId: number) => void
  onDetails: (vehicleId: number) => void
}

export function VehicleCard({
  vehicle,
  purchasing = false,
  notice,
  onPurchase,
  onDetails,
}: VehicleCardProps) {
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
        <div className="mt-4">
          <PriceAndStatus vehicle={vehicle} />
        </div>
        {notice && <NoticeText notice={notice} />}
        <div className="mt-auto pt-4">
          <div className="grid grid-cols-2 gap-2 border-t border-line pt-3">
            <Button
              aria-describedby={titleId}
              disabled={soldOut || purchasing}
              aria-busy={purchasing}
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
