import { stockStatus } from '../lib/stock'

interface VehiclePhotoProps {
  imageUrl: string | null
  description: string
  quantity: number
}

const STRIPS = {
  low: { text: 'Low stock', classes: 'bg-low text-ink' },
  'sold-out': { text: 'Sold out', classes: 'bg-gone text-on-brand' },
}

export function VehiclePhoto({ imageUrl, description, quantity }: VehiclePhotoProps) {
  const status = stockStatus(quantity)
  const strip = status === 'in-stock' ? null : STRIPS[status]

  return (
    <div className="relative aspect-3/2 bg-ground">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={description}
          loading="lazy"
          className={`size-full object-contain p-4 ${status === 'sold-out' ? 'opacity-60' : ''}`}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-ink-muted">
          No photo yet
        </div>
      )}
      {strip && (
        <div
          className={`absolute inset-x-0 bottom-0 px-3 py-1 text-sm font-semibold tracking-widest uppercase ${strip.classes}`}
        >
          {strip.text}
        </div>
      )}
    </div>
  )
}
