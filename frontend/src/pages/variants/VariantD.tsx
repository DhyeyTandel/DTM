import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import type { Vehicle } from '../../api/types'
import { CATEGORIES } from '../../lib/categories'
import { formatPrice } from '../../lib/money'
import { OUT_OF_STOCK_LABEL, isSoldOut } from '../../lib/stock'
import { PHOTOGRAPHED_SAMPLES, inventorySummary } from '../styleSamples'
import { categoryLabel } from './categoryLabel'
import { KeyRack } from './KeyRack'

function CategoryChips({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (c: string) => void
}) {
  const options = ['all', ...CATEGORIES]
  return (
    <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={selected === option}
          onClick={() => {
            onSelect(option)
          }}
          className={`min-h-11 cursor-pointer px-4 text-lg font-semibold ${
            selected === option ? 'bg-ink text-canvas' : 'bg-raised text-ink hover:bg-line'
          }`}
        >
          {categoryLabel(option)}
        </button>
      ))}
    </div>
  )
}

function Card({ vehicle }: { vehicle: Vehicle }) {
  const name = `${vehicle.make} ${vehicle.model}`
  return (
    <article className="flex flex-col">
      <img src={vehicle.image_url ?? ''} alt={name} className="aspect-4/3 w-full object-cover" />
      <div className="bg-ink px-4 pt-4 pb-5 text-canvas">
        <h3 className="text-2xl leading-tight font-bold">{name}</h3>
        <p className="font-display text-[2.6rem] leading-none font-extrabold tracking-tight text-band tabular-nums">
          {formatPrice(vehicle.price)}
        </p>
      </div>
      <div className="mt-5 flex-1">
        <KeyRack quantity={vehicle.quantity} />
      </div>
      <Button disabled={isSoldOut(vehicle.quantity)} className="mt-5 w-full">
        {isSoldOut(vehicle.quantity) ? OUT_OF_STOCK_LABEL : 'Purchase'}
      </Button>
    </article>
  )
}

export function VariantD() {
  const [category, setCategory] = useState('all')

  return (
    <div data-variant="d" className="font-body min-h-dvh bg-canvas text-ink">
      <header className="overflow-hidden bg-band text-on-band">
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <div className="flex justify-between">
            <Link to="/" className="text-lg font-bold focus-visible:outline-ink">
              Dhyey Tandel Motors
            </Link>
            <span className="font-semibold whitespace-nowrap">Sign in</span>
          </div>
          <h1 className="font-display -mb-[0.12em] mt-6 text-[clamp(8rem,44vw,36rem)] leading-[0.74] font-extrabold tracking-tighter">
            DTM
            <span className="sr-only"> Dhyey Tandel Motors inventory</span>
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 py-8">
          <CategoryChips selected={category} onSelect={setCategory} />
          <p className="text-xl font-semibold">{inventorySummary(PHOTOGRAPHED_SAMPLES)}</p>
        </div>
        <div className="grid gap-x-8 gap-y-16 pt-4 pb-20 md:grid-cols-3">
          {PHOTOGRAPHED_SAMPLES.map((vehicle) => (
            <Card key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </main>
    </div>
  )
}
