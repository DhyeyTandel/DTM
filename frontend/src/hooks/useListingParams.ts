import { useSearchParams } from 'react-router'
import { CATEGORIES } from '../lib/categories'
import {
  DEFAULT_LISTING_PARAMS,
  LISTING_KEYS,
  SORT_ORDERS,
  TABS,
  type ListingParams,
} from '../lib/listing'
import { oneOf } from '../lib/oneOf'
import { STOCK_STATUSES } from '../lib/stock'

function readParams(search: URLSearchParams): ListingParams {
  return {
    tab: oneOf(search.get('tab'), TABS, DEFAULT_LISTING_PARAMS.tab),
    category: oneOf(search.get('category'), CATEGORIES, DEFAULT_LISTING_PARAMS.category),
    minPrice: search.get('minPrice') ?? DEFAULT_LISTING_PARAMS.minPrice,
    maxPrice: search.get('maxPrice') ?? DEFAULT_LISTING_PARAMS.maxPrice,
    availability: oneOf(
      search.get('availability'),
      STOCK_STATUSES,
      DEFAULT_LISTING_PARAMS.availability,
    ),
    sort: oneOf(search.get('sort'), SORT_ORDERS, DEFAULT_LISTING_PARAMS.sort),
  }
}

export function useListingParams() {
  const [search, setSearch] = useSearchParams()
  const params = readParams(search)

  function update(changes: Partial<ListingParams>): void {
    const merged = { ...params, ...changes }
    const next = new URLSearchParams()
    for (const key of LISTING_KEYS) {
      if (merged[key] !== DEFAULT_LISTING_PARAMS[key]) next.set(key, merged[key])
    }
    setSearch(next, { replace: true })
  }

  return { params, update }
}
