import { useSearchParams } from 'react-router'
import { DEFAULT_LISTING_PARAMS, type ListingParams } from '../lib/listing'

const TABS: ListingParams['tab'][] = ['current', 'sold-out']
const SORTS: ListingParams['sort'][] = ['price-asc', 'price-desc', 'name']
const AVAILABILITIES: ListingParams['availability'][] = ['in-stock', 'low', 'sold-out']

function oneOf<T extends string>(value: string | null, allowed: T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback
}

function readParams(search: URLSearchParams): ListingParams {
  return {
    tab: oneOf(search.get('tab'), TABS, DEFAULT_LISTING_PARAMS.tab),
    category: search.get('category') ?? DEFAULT_LISTING_PARAMS.category,
    minPrice: search.get('minPrice') ?? DEFAULT_LISTING_PARAMS.minPrice,
    maxPrice: search.get('maxPrice') ?? DEFAULT_LISTING_PARAMS.maxPrice,
    availability: oneOf(
      search.get('availability'),
      AVAILABILITIES,
      DEFAULT_LISTING_PARAMS.availability,
    ),
    sort: oneOf(search.get('sort'), SORTS, DEFAULT_LISTING_PARAMS.sort),
  }
}

export function useListingParams() {
  const [search, setSearch] = useSearchParams()
  const params = readParams(search)

  function update(changes: Partial<ListingParams>): void {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries({ ...params, ...changes })) {
      if (value !== DEFAULT_LISTING_PARAMS[key as keyof ListingParams]) next.set(key, value)
    }
    setSearch(next, { replace: true })
  }

  return { params, update }
}
