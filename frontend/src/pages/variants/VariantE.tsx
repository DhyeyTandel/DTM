import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import type { Vehicle } from '../../api/types'
import { CATEGORIES } from '../../lib/categories'
import { formatPrice } from '../../lib/money'
import { OUT_OF_STOCK_LABEL, isSoldOut, stockStatus } from '../../lib/stock'
import { categoryLabel } from './categoryLabel'
import { PHOTOGRAPHED_SAMPLES, inventorySummary } from '../styleSamples'

const numeralClasses = {
  'in-stock': 'text-ok',
  low: 'text-low-fill',
  'sold-out': 'text-gone',
}

const numeralCaptions = {
  'in-stock': 'in stock',
  low: 'left',
  'sold-out': 'out of stock',
}

const sentenceFieldClasses =
  'border-b-2 border-on-band bg-transparent px-1 text-on-band placeholder:text-on-band/60 focus-visible:outline-on-band'

function SentenceFilter() {
  const [category, setCategory] = useState('')

  return (
    <form
      role="search"
      aria-label="Filter vehicles"
      className="text-3xl leading-[2.2] font-medium"
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      Showing{' '}
      <select
        aria-label="Category"
        value={category}
        onChange={(event) => {
          setCategory(event.target.value)
        }}
        className={sentenceFieldClasses}
      >
        <option value="">every kind of</option>
        {CATEGORIES.map((option) => (
          <option key={option} value={option} className="text-ink">
            {categoryLabel(option)}
          </option>
        ))}
      </select>{' '}
      car from{' '}
      <input aria-label="Make" placeholder="any make" className={`${sentenceFieldClasses} w-40`} />,
      up to ₹{' '}
      <input
        aria-label="Maximum price in rupees"
        inputMode="numeric"
        placeholder="any price"
        className={`${sentenceFieldClasses} w-36`}
      />
      .
    </form>
  )
}

function Row({ vehicle }: { vehicle: Vehicle }) {
  const name = `${vehicle.make} ${vehicle.model}`
  const status = stockStatus(vehicle.quantity)
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-4 bg-raised p-4 sm:grid-cols-[14rem_1fr_auto]">
      <img
        src={vehicle.image_url ?? ''}
        alt={name}
        className="col-span-2 aspect-4/3 w-full object-cover sm:col-span-1 sm:h-full"
      />
      <div className="flex flex-col">
        <h3 className="text-2xl leading-tight font-bold">{name}</h3>
        <p className="text-ink-muted">{categoryLabel(vehicle.category)}</p>
        <Button disabled={isSoldOut(vehicle.quantity)} className="mt-4 self-start sm:mt-auto">
          {isSoldOut(vehicle.quantity) ? OUT_OF_STOCK_LABEL : 'Purchase'}
        </Button>
      </div>
      <div className="text-right">
        <p className="text-3xl leading-none font-extrabold tracking-tight">
          {formatPrice(vehicle.price)}
        </p>
        <p
          className={`mt-4 text-6xl leading-none font-extrabold tabular-nums ${numeralClasses[status]}`}
        >
          {vehicle.quantity}
        </p>
        <p className="text-lg font-semibold">{numeralCaptions[status]}</p>
      </div>
    </li>
  )
}

export function VariantE() {
  return (
    <div
      data-variant="e"
      className="font-body min-h-dvh bg-canvas text-ink lg:grid lg:grid-cols-12"
    >
      <aside className="bg-band px-4 py-6 text-on-band sm:px-8 lg:sticky lg:top-0 lg:col-span-5 lg:h-dvh lg:py-8">
        <div className="flex justify-between">
          <Link to="/" className="text-xl font-bold focus-visible:outline-on-band">
            Dhyey Tandel Motors
          </Link>
          <span className="whitespace-nowrap">Sign in</span>
        </div>
        <h1 className="mt-16 text-[clamp(3.5rem,8vw,7rem)] leading-[0.9] font-extrabold tracking-tighter">
          Stock register
        </h1>
        <p className="mt-4 text-xl">{inventorySummary(PHOTOGRAPHED_SAMPLES)}</p>
        <div className="mt-12">
          <SentenceFilter />
        </div>
      </aside>
      <main className="px-4 py-8 sm:px-8 lg:col-span-7 lg:py-8">
        <ul className="grid gap-3">
          {PHOTOGRAPHED_SAMPLES.map((vehicle) => (
            <Row key={vehicle.id} vehicle={vehicle} />
          ))}
        </ul>
      </main>
    </div>
  )
}
