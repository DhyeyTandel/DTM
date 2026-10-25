import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { expect, test, vi } from 'vitest'
import { renderApp } from '../test/renderApp'
import { server } from '../test/setup'
import { aVehicle } from '../test/vehicles'

const OUT_OF_STOCK_NOTICE = 'Sorry, someone else just got the last one.'
const GENERAL_NOTICE = 'The purchase did not go through. Please try again.'

function cardOf(name: string): HTMLElement {
  return screen.getByRole('heading', { name }).closest('article') as HTMLElement
}

test('clicking Purchase buys that vehicle once and the card shows the count the server returned', async () => {
  const purchase = vi.fn(() => HttpResponse.json(aVehicle({ quantity: 2 })))
  server.use(
    http.get('/api/vehicles', () => HttpResponse.json([aVehicle({ quantity: 5 })])),
    http.post('/api/vehicles/1/purchase', purchase),
  )
  renderApp('/', 'customer')
  const card = within(await screen.findByRole('article'))
  expect(card.getByText('In stock')).toBeInTheDocument()

  await userEvent.click(card.getByRole('button', { name: /purchase/i }))

  expect(await card.findByText('2 left')).toBeInTheDocument()
  expect(purchase).toHaveBeenCalledTimes(1)
  expect(card.getByRole('status')).toHaveTextContent('Purchase complete')
})

test('the count does not change before the server answers, and the button is disabled meanwhile', async () => {
  server.use(
    http.get('/api/vehicles', () => HttpResponse.json([aVehicle({ quantity: 5 })])),
    http.post('/api/vehicles/1/purchase', async () => {
      await delay(150)
      return HttpResponse.json(aVehicle({ quantity: 4 }))
    }),
  )
  renderApp('/', 'customer')
  const card = within(await screen.findByRole('article'))

  await userEvent.click(card.getByRole('button', { name: /purchase/i }))

  expect(card.getByRole('button', { name: /purchase/i })).toBeDisabled()
  expect(card.getByText('In stock')).toBeInTheDocument()
  await waitFor(() => {
    expect(card.getByRole('button', { name: /purchase/i })).toBeEnabled()
  })
})

test('a 409 because someone else got the last one shows a message on that card and refreshes it', async () => {
  let listCalls = 0
  server.use(
    http.get('/api/vehicles', () => {
      listCalls += 1
      return HttpResponse.json([
        aVehicle({ quantity: listCalls === 1 ? 1 : 0 }),
        aVehicle({ id: 2, make: 'Toyota', model: 'Fortuner', quantity: 5 }),
      ])
    }),
    http.post('/api/vehicles/1/purchase', () =>
      HttpResponse.json({ detail: 'Vehicle is out of stock' }, { status: 409 }),
    ),
  )
  renderApp('/', 'customer')
  await screen.findByRole('heading', { name: 'Honda City' })

  await userEvent.click(within(cardOf('Honda City')).getByRole('button', { name: /purchase/i }))

  const honda = within(cardOf('Honda City'))
  expect(await honda.findByRole('alert')).toHaveTextContent(OUT_OF_STOCK_NOTICE)
  expect(await honda.findByText('Sold out', { selector: 'p' })).toBeInTheDocument()
  expect(honda.getByRole('button', { name: 'Out of stock' })).toBeDisabled()
  expect(within(cardOf('Toyota Fortuner')).queryByRole('alert')).not.toBeInTheDocument()
})

test('any other purchase error shows a general message and leaves the list as it was', async () => {
  let listCalls = 0
  server.use(
    http.get('/api/vehicles', () => {
      listCalls += 1
      return HttpResponse.json([aVehicle({ quantity: 5 })])
    }),
    http.post('/api/vehicles/1/purchase', () =>
      HttpResponse.json({ detail: 'Internal server error' }, { status: 500 }),
    ),
  )
  renderApp('/', 'customer')
  const card = within(await screen.findByRole('article'))

  await userEvent.click(card.getByRole('button', { name: /purchase/i }))

  expect(await card.findByRole('alert')).toHaveTextContent(GENERAL_NOTICE)
  expect(card.getByText('In stock')).toBeInTheDocument()
  expect(listCalls).toBe(1)
})
