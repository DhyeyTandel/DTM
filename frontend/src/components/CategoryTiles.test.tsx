import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { CategoryTiles } from './CategoryTiles'

test('there is one tile for each category', () => {
  render(<CategoryTiles selected="" onSelect={vi.fn()} />)

  expect(screen.getAllByRole('button').map((tile) => tile.textContent)).toEqual([
    'Sedan',
    'SUV',
    'Hatchback',
    'Coupe',
    'Truck',
    'EV',
  ])
})

test('clicking a tile sets the category filter', async () => {
  const onSelect = vi.fn()
  render(<CategoryTiles selected="" onSelect={onSelect} />)

  await userEvent.click(screen.getByRole('button', { name: 'SUV' }))

  expect(onSelect).toHaveBeenCalledWith('suv')
})

test('clicking the selected tile clears the category filter', async () => {
  const onSelect = vi.fn()
  render(<CategoryTiles selected="suv" onSelect={onSelect} />)

  await userEvent.click(screen.getByRole('button', { name: 'SUV' }))

  expect(onSelect).toHaveBeenCalledWith('')
  expect(screen.getByRole('button', { name: 'SUV' })).toHaveAttribute('aria-pressed', 'true')
})
