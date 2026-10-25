import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Hero } from './Hero'

test('the headline carries the live count', () => {
  render(<Hero count={16} tab="current" onTab={vi.fn()} />)

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('16 cars on the lot')
})

test('the headline says car for a count of one', () => {
  render(<Hero count={1} tab="current" onTab={vi.fn()} />)

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('1 car on the lot')
})

test('the active tab is marked and clicking the other one reports it', async () => {
  const onTab = vi.fn()
  render(<Hero count={16} tab="current" onTab={onTab} />)
  expect(screen.getByRole('button', { name: 'Current' })).toHaveAttribute('aria-current', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'Sold out' }))

  expect(onTab).toHaveBeenCalledWith('sold-out')
})
