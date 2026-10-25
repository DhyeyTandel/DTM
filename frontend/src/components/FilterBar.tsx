import { CATEGORIES } from '../lib/categories'
import { Button } from './Button'
import { SelectField } from './SelectField'
import { TextField } from './TextField'

export interface VehicleFilters {
  make: string
  model: string
  category: string
  minPrice: string
  maxPrice: string
}

export const NO_FILTERS: VehicleFilters = {
  make: '',
  model: '',
  category: '',
  minPrice: '',
  maxPrice: '',
}

interface FilterBarProps {
  filters: VehicleFilters
  onChange: (filters: VehicleFilters) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  function changed(field: keyof VehicleFilters) {
    return (event: { target: { value: string } }) => {
      onChange({ ...filters, [field]: event.target.value })
    }
  }

  return (
    <form
      role="search"
      aria-label="Filter vehicles"
      className="grid grid-cols-2 items-end gap-4 sm:grid-cols-3 lg:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <TextField label="Make" value={filters.make} onChange={changed('make')} />
      <TextField label="Model" value={filters.model} onChange={changed('model')} />
      <SelectField label="Category" value={filters.category} onChange={changed('category')}>
        <option value="">All</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Min price (₹)"
        inputMode="numeric"
        value={filters.minPrice}
        onChange={changed('minPrice')}
      />
      <TextField
        label="Max price (₹)"
        inputMode="numeric"
        value={filters.maxPrice}
        onChange={changed('maxPrice')}
      />
      <Button
        variant="secondary"
        onClick={() => {
          onChange(NO_FILTERS)
        }}
      >
        Clear filters
      </Button>
    </form>
  )
}
