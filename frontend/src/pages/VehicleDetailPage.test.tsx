import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { renderApp } from '../test/renderApp'
import { server } from '../test/setup'
import { aVehicle } from '../test/vehicles'

const honda = aVehicle({ id: 12, quantity: 2, image_url: '/images/vehicles/honda-city.jpg' })

function listReturns(vehicles: unknown[]) {
  server.use(http.get('/api/vehicles', () => HttpResponse.json(vehicles)))
}

test('a visitor opening a vehicle page is sent to the login page', async () => {
  renderApp('/vehicles/12')

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent('/login')
  })
})

test('the vehicle page shows the photo, the price and the status of that vehicle', async () => {
  listReturns([honda, aVehicle({ id: 13, make: 'Toyota', model: 'Fortuner' })])
  renderApp('/vehicles/12', 'customer')

  expect(await screen.findByRole('heading', { level: 1, name: 'Honda City' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Honda City' })).toHaveAttribute(
    'src',
    '/images/vehicles/honda-city.jpg',
  )
  expect(screen.getByText('Ex-showroom price')).toBeInTheDocument()
  expect(screen.getByText('₹14,49,000')).toBeInTheDocument()
  expect(screen.getByText('2 left')).toBeInTheDocument()
  expect(screen.getByText('DTM-0012')).toBeInTheDocument()
  expect(screen.queryByText('Fortuner')).not.toBeInTheDocument()
})

test('the Details button on the inventory opens the vehicle page, and Back returns', async () => {
  listReturns([honda])
  renderApp('/', 'customer')

  await userEvent.click(await screen.findByRole('button', { name: /details/i }))

  expect(await screen.findByRole('heading', { level: 1, name: 'Honda City' })).toBeInTheDocument()
  expect(screen.getByTestId('location')).toHaveTextContent('/vehicles/12')

  await userEvent.click(screen.getByRole('link', { name: /back to the lot/i }))
  expect(await screen.findByRole('heading', { level: 1, name: /on the lot/i })).toBeInTheDocument()
})

test('an unknown vehicle shows a not found state with a way back', async () => {
  listReturns([honda])
  renderApp('/vehicles/999', 'customer')

  expect(await screen.findByText('We could not find that vehicle')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /back to the lot/i })).toBeInTheDocument()
})

test('buying from the vehicle page shows the count the server returned', async () => {
  listReturns([honda])
  server.use(
    http.post('/api/vehicles/12/purchase', () => HttpResponse.json({ ...honda, quantity: 1 })),
  )
  renderApp('/vehicles/12', 'customer')
  const page = within(await screen.findByRole('main'))

  await userEvent.click(page.getByRole('button', { name: /purchase/i }))

  expect(await page.findByText('1 left')).toBeInTheDocument()
  expect(page.getByRole('status')).toHaveTextContent('Purchase complete')
})
