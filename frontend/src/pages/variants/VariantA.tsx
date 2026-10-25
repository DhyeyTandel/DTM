import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { FilterBar, NO_FILTERS } from '../../components/FilterBar'
import { VehiclePhoto } from '../../components/VehiclePhoto'
import type { Vehicle } from '../../api/types'
import { formatPrice } from '../../lib/money'
import { OUT_OF_STOCK_LABEL, isSoldOut, stockLabel, stockStatus } from '../../lib/stock'
import { PHOTOGRAPHED_SAMPLES, inventorySummary } from '../styleSamples'

const plateClasses = {
  'in-stock': 'bg-ok text-on-ok',
  low: 'bg-low-fill text-on-low-fill',
  'sold-out': 'bg-gone text-on-gone',
}

function Plate({ quantity }: { quantity: number }) {
  return (
    <p
      className={`font-display mt-4 py-3 text-center text-2xl font-extrabold tracking-tight uppercase font-stretch-expanded ${plateClasses[stockStatus(quantity)]}`}
    >
      {stockLabel(quantity)}
    </p>
  )
}

function Card({ vehicle }: { vehicle: Vehicle }) {
  const name = `${vehicle.make} ${vehicle.model}`
  return (
    <article>
      <VehiclePhoto imageUrl={vehicle.image_url} description={name} />
      <h3 className="font-display mt-5 text-2xl leading-tight font-extrabold tracking-tight font-stretch-expanded">
        {name}
      </h3>
      <p className="text-ink-muted capitalize">{vehicle.category}</p>
      <p className="font-display mt-3 text-4xl leading-none font-extrabold tracking-tight tabular-nums font-stretch-expanded">
        {formatPrice(vehicle.price)}
      </p>
      <Plate quantity={vehicle.quantity} />
      <Button disabled={isSoldOut(vehicle.quantity)} className="mt-3 w-full">
        {isSoldOut(vehicle.quantity) ? OUT_OF_STOCK_LABEL : 'Purchase'}
      </Button>
    </article>
  )
}

export function VariantA() {
  const [filters, setFilters] = useState(NO_FILTERS)

  return (
    <div data-variant="a" className="font-body min-h-dvh bg-canvas text-ink">
      <header className="bg-band text-on-band">
        <div className="mx-auto max-w-6xl px-4 pt-5 pb-8 sm:px-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="font-display text-xl font-extrabold tracking-tight font-stretch-expanded focus-visible:outline-on-band"
            >
              Dhyey Tandel Motors
            </Link>
            <span className="whitespace-nowrap">Sign in</span>
          </div>
          <h1 className="font-display mt-16 text-[clamp(3.5rem,14vw,10.5rem)] leading-[0.82] font-extrabold tracking-tighter font-stretch-expanded">
            Inventory
          </h1>
          <p className="mt-4 text-xl">{inventorySummary(PHOTOGRAPHED_SAMPLES)}</p>
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
