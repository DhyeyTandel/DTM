import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, test, vi } from 'vitest'
import { getToken } from '../auth/token'
import { renderApp, signInAs } from '../test/renderApp'
import { server } from '../test/setup'

async function fillAndSubmit(email: string, password: string) {
  if (email) await userEvent.type(screen.getByLabelText('Email'), email)
  if (password) await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

function watchLoginRequests() {
  const handler = vi.fn(() =>
    HttpResponse.json({ access_token: 'new-token', token_type: 'bearer' }),
  )
  server.use(http.post('/api/auth/login', handler))
  return handler
}

test('an invalid email shows an error and sends no request', async () => {
  const login = watchLoginRequests()
  renderApp('/login')

  await fillAndSubmit('not-an-email', 'correct horse')

  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  expect(login).not.toHaveBeenCalled()
})

test('a password that is too short or too long shows an error and sends no request', async () => {
  const login = watchLoginRequests()
  renderApp('/login')

  await fillAndSubmit('a@b.com', 'short')
  expect(screen.getByText('Password must be 8 to 72 characters.')).toBeInTheDocument()

  await userEvent.clear(screen.getByLabelText('Password'))
  await userEvent.type(screen.getByLabelText('Password'), 'x'.repeat(73))
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  expect(screen.getByText('Password must be 8 to 72 characters.')).toBeInTheDocument()
  expect(login).not.toHaveBeenCalled()
})

test('empty fields show an error and send no request', async () => {
  const login = watchLoginRequests()
  renderApp('/login')

  await fillAndSubmit('', '')

  expect(screen.getByText('Enter your email.')).toBeInTheDocument()
  expect(screen.getByText('Enter your password.')).toBeInTheDocument()
  expect(login).not.toHaveBeenCalled()
})

test('a successful login stores the token and opens the inventory', async () => {
  watchLoginRequests()
  server.use(http.get('/api/vehicles', () => HttpResponse.json([])))
  renderApp('/login')

  await fillAndSubmit('a@b.com', 'correct horse')

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })
  expect(getToken()).toBe('new-token')
})

test('a 401 on login shows the api message inline', async () => {
  server.use(
    http.post('/api/auth/login', () =>
      HttpResponse.json({ detail: 'Invalid email or password' }, { status: 401 }),
    ),
  )
  renderApp('/login')

  await fillAndSubmit('a@b.com', 'wrong password')

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  expect(getToken()).toBeNull()
})

test('a signed in user opening login is sent to the inventory', async () => {
  server.use(http.get('/api/vehicles', () => HttpResponse.json([])))
  signInAs('customer')
  renderApp('/login')

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })
})
