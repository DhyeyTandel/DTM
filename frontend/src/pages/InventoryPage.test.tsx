import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { getToken } from '../auth/token'
import { renderApp } from '../test/renderApp'
import { server } from '../test/setup'
import { aVehicle } from '../test/vehicles'

function listReturns(vehicles: unknown[]) {
  server.use(http.get('/api/vehicles', () => HttpResponse.json(vehicles)))
}

test('the inventory shows a loading state while the list loads', async () => {
  server.use(
    http.get('/api/vehicles', async () => {
      await delay(100)
      return HttpResponse.json([aVehicle()])
    }),
  )
  renderApp('/', 'customer')

  expect(await screen.findByRole('status')).toHaveTextContent('Loading the lot')
  expect(await screen.findByRole('heading', { name: 'Honda City' })).toBeInTheDocument()
})

test('the inventory shows the vehicles from the api and counts them in the hero', async () => {
  listReturns([aVehicle(), aVehicle({ id: 2, make: 'Toyota', model: 'Fortuner', category: 'suv' })])
  renderApp('/', 'customer')

  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('2 cars on the lot')
  const grid = screen.getByRole('list', { name: 'Vehicles' })
  expect(within(grid).getAllByRole('listitem')).toHaveLength(2)
})

test('a failed load shows the error and a Try again button that loads it again', async () => {
  let calls = 0
  server.use(
    http.get('/api/vehicles', () => {
      calls += 1
      return calls === 1
        ? HttpResponse.json({ detail: 'Internal server error' }, { status: 500 })
        : HttpResponse.json([aVehicle()])
    }),
  )
  renderApp('/', 'customer')

  expect(await screen.findByRole('alert')).toHaveTextContent('Internal server error')
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

  expect(await screen.findByRole('heading', { name: 'Honda City' })).toBeInTheDocument()
})

test('an empty lot says so instead of showing an empty grid', async () => {
  listReturns([])
  renderApp('/', 'customer')

  expect(await screen.findByText('Nothing on the lot yet')).toBeInTheDocument()
})

test('an expired token on the list signs the user out', async () => {
  server.use(
    http.get('/api/vehicles', () =>
      HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 }),
    ),
  )
  renderApp('/', 'customer')

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent('/login')
  })
  expect(getToken()).toBeNull()
})

test('an admin sees Add vehicle and a customer does not', async () => {
  listReturns([aVehicle()])
  const { unmount } = renderApp('/', 'admin')
  expect(await screen.findByRole('link', { name: 'Add vehicle' })).toBeInTheDocument()
  unmount()

  renderApp('/', 'customer')
  await screen.findByRole('heading', { name: 'Honda City' })
  expect(screen.queryByRole('link', { name: 'Add vehicle' })).not.toBeInTheDocument()
})
