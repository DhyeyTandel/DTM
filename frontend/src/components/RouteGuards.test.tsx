import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, test, vi } from 'vitest'
import { getToken } from '../auth/token'
import { renderApp } from '../test/renderApp'
import { server } from '../test/setup'

function whereAmI() {
  return screen.getByTestId('location')
}

test('a visitor opening any app page is sent to the login page', async () => {
  renderApp('/')
  await waitFor(() => {
    expect(whereAmI()).toHaveTextContent('/login')
  })
})

test('a customer opening an admin page is sent to the inventory', async () => {
  server.use(http.get('/api/vehicles', () => HttpResponse.json([])))
  renderApp('/admin/vehicles/new', 'customer')
  await waitFor(() => {
    expect(whereAmI()).toHaveTextContent(/^\/$/)
  })
})

test('an admin can open the admin pages', async () => {
  renderApp('/admin/vehicles/new', 'admin')

  expect(await screen.findByRole('heading', { name: 'Add vehicle' })).toBeInTheDocument()
  expect(whereAmI()).toHaveTextContent('/admin/vehicles/new')
})

test('the role is fetched with the stored token, and not at all without one', async () => {
  const me = vi.fn(() => HttpResponse.json({ id: 1, email: 'a@b.com', role: 'admin' }))
  server.use(http.get('/api/auth/me', me))
  renderApp('/login')
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })
  expect(me).not.toHaveBeenCalled()
})

test('logging out clears the token and sends the user to the login page', async () => {
  server.use(http.get('/api/vehicles', () => HttpResponse.json([])))
  renderApp('/', 'customer')

  await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }))

  await waitFor(() => {
    expect(whereAmI()).toHaveTextContent('/login')
  })
  expect(getToken()).toBeNull()
})
