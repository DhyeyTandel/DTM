import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { StylePage } from './StylePage'
import { SAMPLE_VEHICLES } from './styleSamples'

test('the hero counts the whole lot and the SOLD OUT tab narrows the grid to zero stock', async () => {
  render(
    <MemoryRouter>
      <StylePage />
    </MemoryRouter>,
  )
  const lot = SAMPLE_VEHICLES.length
  const soldOut = SAMPLE_VEHICLES.filter((vehicle) => vehicle.quantity === 0).length

  await userEvent.click(screen.getByRole('button', { name: 'Sold out' }))

  const grid = screen.getByRole('list', { name: 'Vehicles' })
  expect(within(grid).getAllByRole('listitem')).toHaveLength(soldOut)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    `${String(lot)} cars on the lot`,
  )
})
