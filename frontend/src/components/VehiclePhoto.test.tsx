import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { VehiclePhoto } from './VehiclePhoto'

test('a vehicle with no image shows a plain block and no broken image', () => {
  render(<VehiclePhoto imageUrl={null} description="Toyota Corolla" />)

  expect(screen.getByText('No photo yet')).toBeInTheDocument()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

test('a vehicle with an image shows it with the car name as its alt text', () => {
  render(<VehiclePhoto imageUrl="https://example.com/corolla.jpg" description="Toyota Corolla" />)

  expect(screen.getByRole('img', { name: 'Toyota Corolla' })).toHaveAttribute(
    'src',
    'https://example.com/corolla.jpg',
  )
  expect(screen.queryByText('No photo yet')).not.toBeInTheDocument()
})
