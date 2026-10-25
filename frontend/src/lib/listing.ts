import type { Vehicle } from '../api/types'
import { PAISE_PER_RUPEE } from './money'
import { stockStatus, type StockStatus } from './stock'

export type Tab = 'current' | 'sold-out'
export type SortOrder = '' | 'price-asc' | 'price-desc' | 'name'

export interface ListingParams {
  tab: Tab
  category: string
  minPrice: string
  maxPrice: string
  availability: StockStatus | ''
  sort: SortOrder
}

export const DEFAULT_LISTING_PARAMS: ListingParams = {
  tab: 'current',
  category: '',
  minPrice: '',
  maxPrice: '',
  availability: '',
  sort: '',
}

function rupeesToPaise(rupees: string): number | null {
  const amount = Number(rupees)
  return rupees === '' || Number.isNaN(amount) ? null : amount * PAISE_PER_RUPEE
}

export function filterVehicles(vehicles: Vehicle[], params: ListingParams): Vehicle[] {
  const minPaise = rupeesToPaise(params.minPrice)
  const maxPaise = rupeesToPaise(params.maxPrice)

  return vehicles.filter(
    (vehicle) =>
      (params.tab === 'current' || vehicle.quantity === 0) &&
      (params.category === '' || vehicle.category === params.category) &&
      (minPaise === null || vehicle.price >= minPaise) &&
      (maxPaise === null || vehicle.price <= maxPaise) &&
      (params.availability === '' || stockStatus(vehicle.quantity) === params.availability),
  )
}

const comparers: Record<Exclude<SortOrder, ''>, (a: Vehicle, b: Vehicle) => number> = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`),
}

export function sortVehicles(vehicles: Vehicle[], sort: SortOrder): Vehicle[] {
  return sort === '' ? vehicles : [...vehicles].sort(comparers[sort])
}
