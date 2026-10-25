import { useRef, useState } from 'react'
import type { Vehicle } from '../api/types'
import { useListingParams } from '../hooks/useListingParams'
import { filterVehicles, sortVehicles, type SortOrder } from '../lib/listing'
import { Button } from './Button'
import { CategoryTiles } from './CategoryTiles'
import { FilterSidebar } from './FilterSidebar'
import { VehicleCard } from './VehicleCard'

interface ListingProps {
  vehicles: Vehicle[]
  onPurchase: (vehicleId: number) => void
  onDetails: (vehicleId: number) => void
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name' },
]

const CLEARED_FILTERS = { category: '', minPrice: '', maxPrice: '', availability: '' } as const

export function Listing({ vehicles, onPurchase, onDetails }: ListingProps) {
  const { params, update } = useListingParams()
  const [filtersHidden, setFiltersHidden] = useState(false)
  const drawer = useRef<HTMLDialogElement>(null)
  const shown = sortVehicles(filterVehicles(vehicles, params), params.sort)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <CategoryTiles
        selected={params.category}
        onSelect={(category) => {
          update({ category })
        }}
      />
      <div className="mt-10 flex flex-col gap-8 lg:flex-row">
        {!filtersHidden && (
          <aside aria-label="Filters" className="hidden w-72 shrink-0 lg:block">
            <button
              type="button"
              onClick={() => {
                setFiltersHidden(true)
              }}
              className="mb-4 min-h-11 cursor-pointer font-semibold underline underline-offset-4"
            >
              Hide filters
            </button>
            <FilterSidebar params={params} onChange={update} />
          </aside>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <p className="font-display text-2xl font-bold uppercase">
                {shown.length} {shown.length === 1 ? 'vehicle' : 'vehicles'}
              </p>
              {filtersHidden && (
                <button
                  type="button"
                  onClick={() => {
                    setFiltersHidden(false)
                  }}
                  className="hidden min-h-11 cursor-pointer font-semibold underline underline-offset-4 lg:inline"
                >
                  Show filters
                </button>
              )}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => drawer.current?.showModal()}
              >
                Filters
              </Button>
            </div>
            <label className="flex items-center gap-3">
              Sort by
              <select
                value={params.sort}
                onChange={(event) => {
                  update({ sort: event.target.value as SortOrder })
                }}
                className="min-h-11 border border-line bg-surface px-3"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {shown.length === 0 ? (
            <div className="mt-8 border border-line bg-surface p-8">
              <p className="font-display text-2xl font-bold uppercase">No vehicles match</p>
              <p className="mt-2 text-ink-muted">Try a wider price range or another category.</p>
              <Button
                className="mt-4"
                onClick={() => {
                  update(CLEARED_FILTERS)
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ul aria-label="Vehicles" className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((vehicle) => (
                <li key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} onPurchase={onPurchase} onDetails={onDetails} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <dialog
        ref={drawer}
        aria-label="Filters"
        className="m-0 h-dvh w-80 max-w-[90vw] bg-canvas p-4 text-ink backdrop:bg-black/60"
      >
        <Button variant="outline" onClick={() => drawer.current?.close()}>
          Close
        </Button>
        <div className="mt-4">
          <FilterSidebar params={params} onChange={update} />
        </div>
      </dialog>
    </div>
  )
}
