import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router'
import { expect, test } from 'vitest'
import { useListingParams } from './useListingParams'

function renderAt(url: string) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  }
  return renderHook(() => ({ listing: useListingParams(), location: useLocation() }), {
    wrapper: Wrapper,
  })
}

test('the tab, filters and sort are read from the url', () => {
  const { result } = renderAt(
    '/?tab=sold-out&category=suv&minPrice=500000&maxPrice=900000&availability=low&sort=price-asc',
  )

  expect(result.current.listing.params).toEqual({
    tab: 'sold-out',
    category: 'suv',
    minPrice: '500000',
    maxPrice: '900000',
    availability: 'low',
    sort: 'price-asc',
  })
})

test('a missing or unknown value falls back to the default', () => {
  const { result } = renderAt('/?tab=archive&sort=random&availability=maybe')

  expect(result.current.listing.params.tab).toBe('current')
  expect(result.current.listing.params.sort).toBe('')
  expect(result.current.listing.params.availability).toBe('')
})

test('changing a filter writes it to the url and keeps the others', () => {
  const { result } = renderAt('/?category=suv')

  act(() => {
    result.current.listing.update({ maxPrice: '900000' })
  })

  expect(result.current.location.search).toBe('?category=suv&maxPrice=900000')
})

test('a value set back to its default is removed from the url', () => {
  const { result } = renderAt('/?category=suv&tab=sold-out')

  act(() => {
    result.current.listing.update({ category: '', tab: 'current' })
  })

  expect(result.current.location.search).toBe('')
})
