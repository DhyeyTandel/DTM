import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { FilterBar, NO_FILTERS } from '../../components/FilterBar'
import { VehiclePhoto } from '../../components/VehiclePhoto'
import type { Vehicle } from '../../api/types'
import { formatPrice } from '../../lib/money'
import { OUT_OF_STOCK_LABEL, isSoldOut, stockLabel, stockStatus } from '../../lib/stock'
import { PHOTOGRAPHED_SAMPLES, inventorySummary } from '../styleSamples'

const GAUGE_SEGMENTS = 10

function Gauge({ quantity }: { quantity: number }) {
  const status = stockStatus(quantity)
  const filled = Math.min(quantity, GAUGE_SEGMENTS)
  const fillClass = status === 'low' ? 'bg-low-fill' : 'bg-ok'
  const label = status === 'in-stock' ? `${String(quantity)} in stock` : stockLabel(quantity)

  return (
    <div>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: GAUGE_SEGMENTS }, (_, index) => (
          <span key={index} className={`h-7 flex-1 ${index < filled ? fillClass : 'bg-raised'}`} />
        ))}
      </div>
      <p
        className={
          status === 'sold-out'
            ? 'mt-3 inline-block bg-gone px-3 py-1 text-2xl font-bold text-on-gone'
            : 'mt-3 text-2xl font-bold'
        }
      >
        {label}
      </p>
    </div>
  )
}

function Row({ vehicle }: { vehicle: Vehicle }) {
  const name = `${vehicle.make} ${vehicle.model}`
  return (
    <article className="grid gap-6 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-7">
        <VehiclePhoto imageUrl={vehicle.image_url} description={name} />
      </div>
      <div className="flex flex-col md:col-span-5">
        <h3 className="font-display text-4xl leading-tight">{name}</h3>
        <p className="text-ink-muted capitalize">{vehicle.category}</p>
        <p className="font-display mt-6 text-5xl leading-none lining-nums tabular-nums sm:text-6xl">
          {formatPrice(vehicle.price)}
        </p>
        <div className="mt-8">
          <Gauge quantity={vehicle.quantity} />
        </div>
        <Button disabled={isSoldOut(vehicle.quantity)} className="mt-8 w-full">
          {isSoldOut(vehicle.quantity) ? OUT_OF_STOCK_LABEL : 'Purchase'}
        </Button>
      </div>
    </article>
  )
}

export function VariantB() {
  const [filters, setFilters] = useState(NO_FILTERS)

  return (
    <div data-variant="b" className="font-body min-h-dvh bg-canvas text-ink">
      <header className="bg-band text-on-band">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="font-display text-2xl focus-visible:outline-on-band sm:text-3xl">
            Dhyey Tandel Motors
          </Link>
          <span className="whitespace-nowrap">Sign in</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 pt-14 pb-10">
          <h1 className="font-display text-[clamp(3.5rem,11vw,8rem)] leading-[0.9]">Inventory</h1>
          <p className="text-xl text-ink-muted">{inventorySummary(PHOTOGRAPHED_SAMPLES)}</p>
        </div>
        <FilterBar filters={filters} onChange={setFilters} />
        <div className="grid gap-20 py-16">
          {PHOTOGRAPHED_SAMPLES.map((vehicle) => (
            <Row key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </main>
    </div>
  )
}
