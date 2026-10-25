import { CATEGORIES, categoryLabel } from '../lib/categories'
import type { ListingParams } from '../lib/listing'
import { FilterSection } from './FilterSection'
import { TextField } from './TextField'

interface FilterSidebarProps {
  params: ListingParams
  onChange: (changes: Partial<ListingParams>) => void
}

interface RadioOption {
  value: string
  label: string
}

const AVAILABILITY_OPTIONS: RadioOption[] = [
  { value: '', label: 'Any' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'sold-out', label: 'Sold out' },
]

const CATEGORY_OPTIONS: RadioOption[] = [
  { value: '', label: 'All categories' },
  ...CATEGORIES.map((category) => ({ value: category, label: categoryLabel(category) })),
]

function RadioList({
  name,
  options,
  value,
  onSelect,
}: {
  name: string
  options: RadioOption[]
  value: string
  onSelect: (value: string) => void
}) {
  return (
    <div role="radiogroup" className="grid gap-1">
      {options.map((option) => (
        <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="radio"
            name={name}
            checked={option.value === value}
            onChange={() => {
              onSelect(option.value)
            }}
            className="size-5 accent-brand"
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}

export function FilterSidebar({ params, onChange }: FilterSidebarProps) {
  return (
    <div className="border-t border-line">
      <FilterSection title="Category">
        <RadioList
          name="category"
          options={CATEGORY_OPTIONS}
          value={params.category}
          onSelect={(category) => {
            onChange({ category })
          }}
        />
      </FilterSection>
      <FilterSection title="Price range">
        <div className="grid gap-3">
          <TextField
            label="Min price (₹)"
            inputMode="numeric"
            value={params.minPrice}
            onChange={(event) => {
              onChange({ minPrice: event.target.value })
            }}
          />
          <TextField
            label="Max price (₹)"
            inputMode="numeric"
            value={params.maxPrice}
            onChange={(event) => {
              onChange({ maxPrice: event.target.value })
            }}
          />
        </div>
      </FilterSection>
      <FilterSection title="Availability">
        <RadioList
          name="availability"
          options={AVAILABILITY_OPTIONS}
          value={params.availability}
          onSelect={(availability) => {
            onChange({ availability: availability as ListingParams['availability'] })
          }}
        />
      </FilterSection>
    </div>
  )
}
