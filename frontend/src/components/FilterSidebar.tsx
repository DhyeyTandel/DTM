import { useId } from 'react'
import { CATEGORIES, categoryLabel, type Category } from '../lib/categories'
import type { ListingParams } from '../lib/listing'
import { STATUS_NAMES, STOCK_STATUSES, type StockStatus } from '../lib/stock'
import { FilterSection } from './FilterSection'
import { TextField } from './TextField'

interface FilterSidebarProps {
  params: ListingParams
  onChange: (changes: Partial<ListingParams>) => void
}

interface RadioOption<T extends string> {
  value: T | ''
  label: string
}

interface RadioListProps<T extends string> {
  label: string
  options: RadioOption<T>[]
  value: T | ''
  onSelect: (value: T | '') => void
}

const AVAILABILITY_OPTIONS: RadioOption<StockStatus>[] = [
  { value: '', label: 'Any' },
  ...STOCK_STATUSES.map((status) => ({ value: status, label: STATUS_NAMES[status] })),
]

const CATEGORY_OPTIONS: RadioOption<Category>[] = [
  { value: '', label: 'All categories' },
  ...CATEGORIES.map((category) => ({ value: category, label: categoryLabel(category) })),
]

function RadioList<T extends string>({ label, options, value, onSelect }: RadioListProps<T>) {
  const groupName = useId()

  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1">
      {options.map((option) => (
        <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="radio"
            name={groupName}
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
          label="Category"
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
          label="Availability"
          options={AVAILABILITY_OPTIONS}
          value={params.availability}
          onSelect={(availability) => {
            onChange({ availability })
          }}
        />
      </FilterSection>
    </div>
  )
}
