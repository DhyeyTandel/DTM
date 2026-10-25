import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { FilterBar, NO_FILTERS } from '../components/FilterBar'
import { SelectField } from '../components/SelectField'
import { TextField } from '../components/TextField'
import { VehicleCard } from '../components/VehicleCard'
import { CATEGORIES } from '../lib/categories'
import { LOW_STOCK_MAX } from '../lib/stock'
import { SAMPLE_VEHICLES } from './styleSamples'

const COLOUR_ROLES = [
  { name: 'canvas', swatch: 'bg-canvas', use: 'Page background' },
  { name: 'raised', swatch: 'bg-raised', use: 'Photo placeholder, disabled button' },
  { name: 'line', swatch: 'bg-line', use: 'Borders' },
  { name: 'ink', swatch: 'bg-ink', use: 'Text' },
  { name: 'ink-muted', swatch: 'bg-ink-muted', use: 'Secondary text' },
  { name: 'accent', swatch: 'bg-accent', use: 'Actions and focus, nothing else' },
  { name: 'low', swatch: 'bg-low', use: 'Low stock text' },
  { name: 'error', swatch: 'bg-error', use: 'Error text and field border' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="mb-6 text-title font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

export function StylePage() {
  const [filters, setFilters] = useState(NO_FILTERS)

  return (
    <>
      <h1 className="text-display leading-none font-bold tracking-tight">Style</h1>
      <p className="mt-4 max-w-prose text-ink-muted">
        Type, colour and the parts the listing is made of. Everything here reads its colours from
        roles, so the dark mode toggle in the header changes all of it at once.
      </p>

      <Section title="Type">
        <dl className="grid gap-6">
          <div>
            <dt className="text-ink-muted">Display, Archivo 700</dt>
            <dd className="text-display leading-none font-bold tracking-tight">
              Dhyey Tandel Motors
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Price, 700, tabular figures</dt>
            <dd className="text-price font-bold tracking-tight tabular-nums">₹14,49,000</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Title, 600</dt>
            <dd className="text-title font-semibold tracking-tight">Honda City</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Body, 400</dt>
            <dd className="max-w-prose">
              Every car on the lot, with the price and how many are left. A car that has sold out
              stays on the page so you can see what we usually carry.
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="Colour">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
          {COLOUR_ROLES.map((role) => (
            <li key={role.name}>
              <div className={`h-14 rounded-control border border-line ${role.swatch}`} />
              <p className="mt-2 font-medium">{role.name}</p>
              <p className="text-ink-muted">{role.use}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Vehicle listing">
        <p className="mb-6 max-w-prose text-ink-muted">
          In stock, low ({LOW_STOCK_MAX} or fewer), sold out, and a car with no photo yet.
        </p>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_VEHICLES.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onPurchase={() => undefined} />
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-4">
          <Button>Purchase</Button>
          <Button variant="secondary">Clear filters</Button>
          <Button disabled>Out of stock</Button>
          <Button variant="secondary" disabled>
            Unavailable
          </Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-3xl gap-6 sm:grid-cols-3">
          <TextField label="Email" type="email" placeholder="you@example.com" />
          <TextField
            label="Password"
            type="password"
            defaultValue="short"
            error="Use at least 8 characters."
          />
          <SelectField label="Category" defaultValue="suv">
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectField>
        </div>
      </Section>

      <Section title="Filter row">
        <FilterBar filters={filters} onChange={setFilters} />
      </Section>
    </>
  )
}
