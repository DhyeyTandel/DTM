import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, test, vi } from 'vitest'
import { renderApp } from '../test/renderApp'
import { server } from '../test/setup'

async function fillAndSubmit(email: string, password: string) {
  if (email) await userEvent.type(screen.getByLabelText('Email'), email)
  if (password) await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
}

test('an invalid email, a short password or empty fields send no request', async () => {
  const register = vi.fn(() => HttpResponse.json({}, { status: 201 }))
  server.use(http.post('/api/auth/register', register))
  renderApp('/register')

  await fillAndSubmit('', '')
  expect(screen.getByText('Enter your email.')).toBeInTheDocument()

  await fillAndSubmit('nope', 'short')
  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  expect(screen.getByText('Password must be 8 to 72 characters.')).toBeInTheDocument()
  expect(register).not.toHaveBeenCalled()
})

test('a 409 on register shows that the email is already registered', async () => {
  server.use(
    http.post('/api/auth/register', () =>
      HttpResponse.json({ detail: 'Email already registered' }, { status: 409 }),
    ),
  )
  renderApp('/register')

  await fillAndSubmit('a@b.com', 'correct horse')

  expect(await screen.findByRole('alert')).toHaveTextContent('Email already registered')
})

test('a successful register sends the user to the login page with a note', async () => {
  server.use(
    http.post('/api/auth/register', () =>
      HttpResponse.json({ id: 2, email: 'a@b.com', role: 'customer' }, { status: 201 }),
    ),
  )
  renderApp('/register')

  await fillAndSubmit('a@b.com', 'correct horse')

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent('/login')
  })
  expect(screen.getByText('Account created. Sign in to continue.')).toBeInTheDocument()
})

test('the register password field asks the browser for a new password, and login for the saved one', () => {
  const { unmount } = renderApp('/register')
  expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password')
  unmount()

  renderApp('/login')
  expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password')
})
