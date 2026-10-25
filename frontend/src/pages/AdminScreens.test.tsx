import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, test, vi } from 'vitest'
import { renderApp } from '../test/renderApp'
import { server } from '../test/setup'
import { aVehicle } from '../test/vehicles'

const honda = aVehicle({ id: 12, quantity: 2, image_url: '/images/vehicles/honda-city.jpg' })

function listReturns(vehicles: unknown[]) {
  server.use(http.get('/api/vehicles', () => HttpResponse.json(vehicles)))
}

async function fillAddForm(values: Record<string, string>) {
  for (const [label, value] of Object.entries(values)) {
    const field = screen.getByLabelText(label)
    await userEvent.clear(field)
    if (value) await userEvent.type(field, value)
  }
}

const validAdd = {
  Make: 'Toyota',
  Model: 'Corolla',
  'Price (₹)': '1500000',
  Quantity: '5',
}

test('the add form checks every field before it sends anything', async () => {
  const create = vi.fn(() => HttpResponse.json({}, { status: 201 }))
  server.use(http.post('/api/vehicles', create))
  renderApp('/admin/vehicles/new', 'admin')
  await screen.findByRole('heading', { name: 'Add vehicle' })

  await userEvent.click(screen.getByRole('button', { name: 'Save vehicle' }))
  expect(screen.getByText('Enter the make.')).toBeInTheDocument()
  expect(screen.getByText('Enter the model.')).toBeInTheDocument()
  expect(screen.getByText('Enter a price above zero.')).toBeInTheDocument()
  expect(screen.getByText('Enter how many are in stock.')).toBeInTheDocument()

  await fillAddForm({ ...validAdd, Quantity: '-1', 'Image URL': 'http://example.com/a.jpg' })
  await userEvent.click(screen.getByRole('button', { name: 'Save vehicle' }))
  expect(screen.getByText('Quantity must be a whole number from 0 to 10000.')).toBeInTheDocument()
  expect(
    screen.getByText('Use an https address or a path that starts with /images/.'),
  ).toBeInTheDocument()
  expect(create).not.toHaveBeenCalled()
})

test('a valid add form sends the price in paise and returns to the inventory', async () => {
  let sent: unknown = null
  server.use(
    http.post('/api/vehicles', async ({ request }) => {
      sent = await request.json()
      return HttpResponse.json(aVehicle({ id: 30 }), { status: 201 })
    }),
    http.get('/api/vehicles', () => HttpResponse.json([])),
  )
  renderApp('/admin/vehicles/new', 'admin')
  await screen.findByRole('heading', { name: 'Add vehicle' })

  await fillAddForm({ ...validAdd, 'Image URL': '/images/vehicles/honda-city.jpg' })
  await userEvent.selectOptions(screen.getByLabelText('Category'), 'suv')
  await userEvent.click(screen.getByRole('button', { name: 'Save vehicle' }))

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })
  expect(sent).toEqual({
    make: 'Toyota',
    model: 'Corolla',
    category: 'suv',
    price: 1_500_000_00,
    quantity: 5,
    image_url: '/images/vehicles/honda-city.jpg',
  })
})

test('an error from the api is shown on the add form', async () => {
  server.use(
    http.post('/api/vehicles', () =>
      HttpResponse.json({ detail: 'Admin access required' }, { status: 403 }),
    ),
  )
  renderApp('/admin/vehicles/new', 'admin')
  await screen.findByRole('heading', { name: 'Add vehicle' })

  await fillAddForm(validAdd)
  await userEvent.click(screen.getByRole('button', { name: 'Save vehicle' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Admin access required')
})

test('the edit form opens with the current values, has no quantity, and saves with PUT', async () => {
  let sent: unknown = null
  listReturns([honda])
  server.use(
    http.put('/api/vehicles/12', async ({ request }) => {
      sent = await request.json()
      return HttpResponse.json({ ...honda, model: 'City e:HEV' })
    }),
  )
  renderApp('/admin/vehicles/12/edit', 'admin')
  await screen.findByRole('heading', { name: 'Edit vehicle' })
  expect(screen.getByLabelText('Make')).toHaveValue('Honda')
  expect(screen.getByLabelText('Price (₹)')).toHaveValue('1449000')
  expect(screen.getByLabelText('Image URL')).toHaveValue('/images/vehicles/honda-city.jpg')
  expect(screen.queryByLabelText('Quantity')).not.toBeInTheDocument()

  await userEvent.clear(screen.getByLabelText('Model'))
  await userEvent.type(screen.getByLabelText('Model'), 'City e:HEV')
  await userEvent.clear(screen.getByLabelText('Image URL'))
  await userEvent.click(screen.getByRole('button', { name: 'Save vehicle' }))

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent('/vehicles/12')
  })
  expect(sent).toEqual({
    make: 'Honda',
    model: 'City e:HEV',
    category: 'sedan',
    price: 14_49_000_00,
    image_url: null,
  })
})

test('Delete asks first: Cancel does nothing and confirming deletes and returns to the inventory', async () => {
  const remove = vi.fn(() => new HttpResponse(null, { status: 204 }))
  listReturns([honda])
  server.use(http.delete('/api/vehicles/12', remove))
  renderApp('/vehicles/12', 'admin')
  await screen.findByRole('heading', { level: 1, name: 'Honda City' })

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(screen.getByText('Delete Honda City? This cannot be undone.')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(remove).not.toHaveBeenCalled()
  expect(screen.queryByText(/This cannot be undone/)).not.toBeInTheDocument()

  server.use(http.get('/api/vehicles', () => HttpResponse.json([])))
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
  await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })
  expect(remove).toHaveBeenCalledTimes(1)
})

test('Restock takes an amount from 1 to 1000 and shows the quantity the server returns', async () => {
  const restock = vi.fn(() => HttpResponse.json({ ...honda, quantity: 12 }))
  listReturns([honda])
  server.use(http.post('/api/vehicles/12/restock', restock))
  renderApp('/vehicles/12', 'admin')
  await screen.findByRole('heading', { level: 1, name: 'Honda City' })
  const amount = screen.getByLabelText('Restock amount')

  for (const bad of ['0', '1001', 'abc']) {
    await userEvent.clear(amount)
    await userEvent.type(amount, bad)
    await userEvent.click(screen.getByRole('button', { name: 'Restock' }))
    expect(screen.getByText('Enter a whole number from 1 to 1000.')).toBeInTheDocument()
  }
  expect(restock).not.toHaveBeenCalled()

  await userEvent.clear(amount)
  await userEvent.type(amount, '10')
  await userEvent.click(screen.getByRole('button', { name: 'Restock' }))

  expect(await screen.findByText('In stock')).toBeInTheDocument()
  expect(restock).toHaveBeenCalledTimes(1)
})

test('a restock the server refuses shows its message', async () => {
  listReturns([honda])
  server.use(
    http.post('/api/vehicles/12/restock', () =>
      HttpResponse.json(
        { detail: 'Restocking would take the vehicle past the stock limit' },
        { status: 409 },
      ),
    ),
  )
  renderApp('/vehicles/12', 'admin')
  await screen.findByRole('heading', { level: 1, name: 'Honda City' })

  await userEvent.type(screen.getByLabelText('Restock amount'), '10')
  await userEvent.click(screen.getByRole('button', { name: 'Restock' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('past the stock limit')
})

test('an admin sees Edit, Restock and Delete on the vehicle page and a customer does not', async () => {
  listReturns([honda])
  const { unmount } = renderApp('/vehicles/12', 'admin')
  await screen.findByRole('heading', { level: 1, name: 'Honda City' })
  const controls = within(screen.getByRole('region', { name: 'Admin controls' }))
  expect(controls.getByRole('link', { name: 'Edit' })).toBeInTheDocument()
  expect(controls.getByRole('button', { name: 'Restock' })).toBeInTheDocument()
  expect(controls.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  unmount()

  renderApp('/vehicles/12', 'customer')
  await screen.findByRole('heading', { level: 1, name: 'Honda City' })
  expect(screen.queryByRole('region', { name: 'Admin controls' })).not.toBeInTheDocument()
})

test('a customer opening the edit page is sent to the inventory', async () => {
  listReturns([honda])
  renderApp('/admin/vehicles/12/edit', 'customer')

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })
})
