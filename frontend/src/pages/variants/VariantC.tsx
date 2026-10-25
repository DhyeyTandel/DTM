import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { FilterBar, NO_FILTERS } from '../../components/FilterBar'
import { VehiclePhoto } from '../../components/VehiclePhoto'
import type { Vehicle } from '../../api/types'
import { formatPrice } from '../../lib/money'
import { OUT_OF_STOCK_LABEL, isSoldOut, stockStatus } from '../../lib/stock'
import { PHOTOGRAPHED_SAMPLES, inventorySummary } from '../styleSamples'

const blockClasses = {
  'in-stock': 'bg-ok text-on-ok',
  low: 'bg-low-fill text-on-low-fill',
  'sold-out': 'bg-gone text-on-gone',
}

const blockCaptions = {
  'in-stock': 'in stock',
  low: 'left',
  'sold-out': 'out of stock',
}

function StockBlock({ quantity }: { quantity: number }) {
  const status = stockStatus(quantity)
  return (
    <div
      className={`flex min-w-28 flex-col items-center justify-center px-4 py-3 ${blockClasses[status]}`}
    >
      <span className="font-display text-6xl leading-none font-extrabold tabular-nums">
        {quantity}
      </span>
      <span className="text-lg leading-tight font-semibold">{blockCaptions[status]}</span>
    </div>
  )
}

function Card({ vehicle }: { vehicle: Vehicle }) {
  const name = `${vehicle.make} ${vehicle.model}`
  return (
    <article>
      <VehiclePhoto imageUrl={vehicle.image_url} description={name} />
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-3xl leading-tight font-bold">{name}</h3>
        <p className="text-ink-muted capitalize">{vehicle.category}</p>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto]">
        <p className="font-display flex items-center bg-ink px-3 text-4xl leading-none font-bold tabular-nums text-canvas">
          {formatPrice(vehicle.price)}
        </p>
        <StockBlock quantity={vehicle.quantity} />
      </div>
      <Button disabled={isSoldOut(vehicle.quantity)} className="mt-3 w-full">
        {isSoldOut(vehicle.quantity) ? OUT_OF_STOCK_LABEL : 'Purchase'}
      </Button>
    </article>
  )
}

export function VariantC() {
  const [filters, setFilters] = useState(NO_FILTERS)

  return (
    <div data-variant="c" className="font-body min-h-dvh bg-canvas text-ink">
      <header className="bg-band text-on-band">
        <div className="mx-auto max-w-6xl px-4 pt-5 pb-8 sm:px-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-display text-3xl font-extrabold focus-visible:outline-ink">
              Dhyey Tandel Motors
            </Link>
            <span className="font-semibold whitespace-nowrap">Sign in</span>
          </div>
          <h1 className="font-display mt-14 text-[clamp(4rem,20vw,16rem)] leading-[0.78] font-extrabold uppercase">
            Inventory
          </h1>
          <p className="mt-4 text-2xl font-semibold">{inventorySummary(PHOTOGRAPHED_SAMPLES)}</p>
        </div>
      </header>
      <div className="bg-raised">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">
          {PHOTOGRAPHED_SAMPLES.map((vehicle) => (
            <Card key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </main>
    </div>
  )
}
