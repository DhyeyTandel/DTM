import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { TextField } from './TextField'

test('a text field with an error is marked invalid and the message is read with it', () => {
  render(<TextField label="Password" error="Use at least 8 characters." />)

  const input = screen.getByLabelText('Password')
  expect(input).toBeInvalid()
  expect(input).toHaveAccessibleDescription('Use at least 8 characters.')
})

test('a text field without an error is not marked invalid', () => {
  render(<TextField label="Password" />)

  expect(screen.getByLabelText('Password')).toBeValid()
})

test('a field error is announced as an alert', () => {
  render(<TextField label="Password" error="Use at least 8 characters." />)

  expect(screen.getByRole('alert')).toHaveTextContent('Use at least 8 characters.')
})
