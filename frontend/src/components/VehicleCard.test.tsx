import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test, vi } from 'vitest'
import type { Vehicle } from '../api/types'
import { VehicleCard } from './VehicleCard'

const corolla: Vehicle = {
  id: 12,
  make: 'Toyota',
  model: 'Corolla',
  category: 'sedan',
  price: 14_49_000_00,
  quantity: 5,
  image_url: null,
}

function renderCard(changes: Partial<Vehicle> = {}) {
  render(
    <MemoryRouter>
      <VehicleCard vehicle={{ ...corolla, ...changes }} onPurchase={vi.fn()} />
    </MemoryRouter>,
  )
}

test('the Purchase button is enabled when stock is above zero', () => {
  renderCard({ quantity: 5 })

  expect(screen.getByRole('button', { name: /purchase/i })).toBeEnabled()
})

test('the Purchase button is disabled when stock is zero', () => {
  renderCard({ quantity: 0 })

  expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled()
})

test('a vehicle with zero stock shows a Sold out status', () => {
  renderCard({ quantity: 0 })

  expect(screen.getByText('Sold out', { selector: 'p' })).toBeInTheDocument()
})

test('the status line says In stock, or how many are left when it is low', () => {
  renderCard({ quantity: 12 })
  expect(screen.getByText('In stock')).toBeInTheDocument()
})

test('a low stock vehicle shows how many are left', () => {
  renderCard({ quantity: 2 })

  expect(screen.getByText('2 left')).toBeInTheDocument()
})

test('the card shows the title on two lines, the stock number, the category and the price', () => {
  renderCard()

  expect(screen.getByRole('heading', { name: 'Toyota Corolla' })).toBeInTheDocument()
  expect(screen.getByText('DTM-0012')).toBeInTheDocument()
  expect(screen.getByText('Sedan')).toBeInTheDocument()
  expect(screen.getByText('Ex-showroom price')).toBeInTheDocument()
  expect(screen.getByText('₹14,49,000')).toBeInTheDocument()
})

test('Details is a link to the vehicle page', () => {
  renderCard()

  expect(screen.getByRole('link', { name: /details/i })).toHaveAttribute('href', '/vehicles/12')
})
