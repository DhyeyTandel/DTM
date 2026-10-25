import type { Vehicle } from '../api/types'
import type { Category } from './categories'
import { PAISE_PER_RUPEE } from './money'
import { stockStatus, type StockStatus } from './stock'

export const TABS = ['current', 'sold-out'] as const
export type Tab = (typeof TABS)[number]

export const SORT_ORDERS = ['price-asc', 'price-desc', 'name'] as const
export type SortOrder = (typeof SORT_ORDERS)[number] | ''

export interface ListingParams {
  tab: Tab
  category: Category | ''
  minPrice: string
  maxPrice: string
  availability: StockStatus | ''
  sort: SortOrder
}

export const LISTING_KEYS = [
  'tab',
  'category',
  'minPrice',
  'maxPrice',
  'availability',
  'sort',
] as const satisfies readonly (keyof ListingParams)[]

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
  if (rupees === '' || Number.isNaN(amount) || amount < 0) return null
  return Math.round(amount * PAISE_PER_RUPEE)
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

const COMPARERS: Record<(typeof SORT_ORDERS)[number], (a: Vehicle, b: Vehicle) => number> = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`),
}

export function sortVehicles(vehicles: Vehicle[], sort: SortOrder): Vehicle[] {
  return sort === '' ? vehicles : [...vehicles].sort(COMPARERS[sort])
}
