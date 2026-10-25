import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import type { Vehicle } from '../api/types'
import { VehicleCard } from './VehicleCard'

const corolla: Vehicle = {
  id: 1,
  make: 'Toyota',
  model: 'Corolla',
  category: 'sedan',
  price: 14_49_000_00,
  quantity: 5,
  image_url: null,
}

function renderCard(changes: Partial<Vehicle> = {}) {
  render(<VehicleCard vehicle={{ ...corolla, ...changes }} onPurchase={vi.fn()} />)
}

test('the Purchase button is enabled when stock is above zero', () => {
  renderCard({ quantity: 5 })

  expect(screen.getByRole('button', { name: /purchase/i })).toBeEnabled()
})

test('the Purchase button is disabled when stock is zero', () => {
  renderCard({ quantity: 0 })

  expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled()
})

test('a vehicle with zero stock shows an out of stock label', () => {
  renderCard({ quantity: 0 })

  expect(screen.getByText('Out of stock', { selector: 'p' })).toBeInTheDocument()
})
