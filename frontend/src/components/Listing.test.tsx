import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, test, vi } from 'vitest'
import type { Vehicle } from '../api/types'
import { Listing } from './Listing'

function vehicle(changes: Partial<Vehicle>): Vehicle {
  return {
    id: 1,
    make: 'Toyota',
    model: 'Corolla',
    category: 'sedan',
    price: 15_00_000_00,
    quantity: 5,
    image_url: null,
    ...changes,
  }
}

const vehicles = [
  vehicle({ id: 1, make: 'Honda', model: 'City' }),
  vehicle({ id: 2, make: 'Toyota', model: 'Fortuner', category: 'suv', quantity: 2 }),
  vehicle({ id: 3, make: 'Maruti', model: 'Swift', category: 'hatchback', quantity: 0 }),
]

function renderListing(url = '/') {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Listing vehicles={vehicles} onPurchase={vi.fn()} onDetails={vi.fn()} />
    </MemoryRouter>,
  )
}

test('the result count says how many vehicles are shown', () => {
  renderListing()
  expect(screen.getByText('3 vehicles')).toBeInTheDocument()
})

test('the result count says vehicle for one', () => {
  renderListing('/?category=suv')
  expect(screen.getByText('1 vehicle')).toBeInTheDocument()
})

test('clicking a category tile narrows the grid to that category', async () => {
  renderListing()

  await userEvent.click(screen.getByRole('button', { name: 'SUV' }))

  const grid = screen.getByRole('list', { name: 'Vehicles' })
  expect(within(grid).getAllByRole('listitem')).toHaveLength(1)
  expect(within(grid).getByRole('heading', { name: 'Toyota Fortuner' })).toBeInTheDocument()
})

test('Hide filters hides the sidebar and Show filters brings it back', async () => {
  renderListing()
  expect(screen.getByRole('complementary', { name: 'Filters' })).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: 'Hide filters' }))
  expect(screen.queryByRole('complementary', { name: 'Filters' })).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Show filters' }))
  expect(screen.getByRole('complementary', { name: 'Filters' })).toBeVisible()
})

test('the sort control orders the grid', async () => {
  renderListing()

  await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'name')

  const titles = within(screen.getByRole('list', { name: 'Vehicles' }))
    .getAllByRole('heading')
    .map((heading) => heading.textContent)
  expect(titles).toEqual(['Honda City', 'Maruti Swift', 'Toyota Fortuner'])
})
