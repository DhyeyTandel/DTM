import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import type { Vehicle } from '../../api/types'
import { CATEGORIES } from '../../lib/categories'
import { formatPrice } from '../../lib/money'
import { OUT_OF_STOCK_LABEL, isSoldOut, stockLabel, stockStatus } from '../../lib/stock'
import { categoryLabel } from './categoryLabel'
import { PHOTOGRAPHED_SAMPLES, inventorySummary } from '../styleSamples'

const stockValueClasses = {
  'in-stock': 'text-ok',
  low: 'text-low-fill',
  'sold-out': 'bg-gone px-2 text-canvas',
}

function Sticker({ vehicle }: { vehicle: Vehicle }) {
  const name = `${vehicle.make} ${vehicle.model}`
  const status = stockStatus(vehicle.quantity)
  const stock =
    status === 'in-stock' ? `${String(vehicle.quantity)} in stock` : stockLabel(vehicle.quantity)

  return (
    <div className="bg-white text-ink md:absolute md:right-8 md:bottom-8 md:w-96">
      <div className="bg-band px-5 py-3 text-on-band">
        <h3 className="text-3xl leading-tight font-bold">{name}</h3>
        <p>{categoryLabel(vehicle.category)}</p>
      </div>
      <dl className="grid gap-4 px-5 py-5">
        <div>
          <dt className="text-ink-muted">Price</dt>
          <dd className="text-5xl leading-none font-bold tracking-tight tabular-nums">
            {formatPrice(vehicle.price)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Stock</dt>
          <dd className={`inline-block text-3xl font-bold ${stockValueClasses[status]}`}>
            {stock}
          </dd>
        </div>
      </dl>
      <div className="px-5 pb-5">
        <Button disabled={isSoldOut(vehicle.quantity)} className="w-full">
          {isSoldOut(vehicle.quantity) ? OUT_OF_STOCK_LABEL : 'Purchase'}
        </Button>
      </div>
    </div>
  )
}

function Showing({ vehicle }: { vehicle: Vehicle }) {
  return (
    <section className="relative">
      <img
        src={vehicle.image_url ?? ''}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="aspect-4/3 w-full object-cover md:aspect-16/9"
      />
      <Sticker vehicle={vehicle} />
    </section>
  )
}

export function VariantF() {
  const [category, setCategory] = useState('all')
  const options = ['all', ...CATEGORIES]

  return (
    <div data-variant="f" className="font-body min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-10 bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/" className="text-2xl font-bold">
            Dhyey Tandel Motors
          </Link>
          <div role="group" aria-label="Category" className="flex flex-wrap gap-x-5">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={category === option}
                onClick={() => {
                  setCategory(option)
                }}
                className={`min-h-11 cursor-pointer text-lg underline-offset-8 ${
                  category === option
                    ? 'font-bold underline decoration-4 decoration-band'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {categoryLabel(option)}
              </button>
            ))}
          </div>
          <span className="ml-auto whitespace-nowrap">Sign in</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-10 pb-8">
          <h1 className="text-[clamp(3rem,9vw,7rem)] leading-[0.9] font-bold tracking-tight">
            On the lot today
          </h1>
          <p className="mt-3 text-xl text-ink-muted">{inventorySummary(PHOTOGRAPHED_SAMPLES)}</p>
        </div>
        <div className="grid gap-16 pb-24">
          {PHOTOGRAPHED_SAMPLES.map((vehicle) => (
            <Showing key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </main>
    </div>
  )
}
