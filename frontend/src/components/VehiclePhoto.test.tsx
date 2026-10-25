import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { VehiclePhoto } from './VehiclePhoto'

test('a vehicle with no image shows a plain block and no broken image', () => {
  render(<VehiclePhoto imageUrl={null} description="Toyota Corolla" quantity={5} />)

  expect(screen.getByText('No photo yet')).toBeInTheDocument()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

test('a vehicle with an image shows it with the car name as its alt text', () => {
  render(
    <VehiclePhoto
      imageUrl="https://example.com/corolla.jpg"
      description="Toyota Corolla"
      quantity={5}
    />,
  )

  expect(screen.getByRole('img', { name: 'Toyota Corolla' })).toHaveAttribute(
    'src',
    'https://example.com/corolla.jpg',
  )
  expect(screen.queryByText('No photo yet')).not.toBeInTheDocument()
})

test('a photo shows a LOW STOCK strip at 3 or fewer and a SOLD OUT strip at zero', () => {
  const { rerender } = render(
    <VehiclePhoto imageUrl={null} description="Toyota Corolla" quantity={3} />,
  )
  expect(screen.getByText('Low stock')).toBeInTheDocument()

  rerender(<VehiclePhoto imageUrl={null} description="Toyota Corolla" quantity={0} />)
  expect(screen.getByText('Sold out')).toBeInTheDocument()
})

test('a photo of a vehicle with plenty of stock has no strip', () => {
  render(<VehiclePhoto imageUrl={null} description="Toyota Corolla" quantity={4} />)

  expect(screen.queryByText('Low stock')).not.toBeInTheDocument()
  expect(screen.queryByText('Sold out')).not.toBeInTheDocument()
})
