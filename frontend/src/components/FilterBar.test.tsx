import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { FilterBar, NO_FILTERS } from './FilterBar'

test('typing in a filter field reports the changed filters', async () => {
  const onChange = vi.fn()
  render(<FilterBar filters={NO_FILTERS} onChange={onChange} />)

  await userEvent.type(screen.getByLabelText('Make'), 'T')

  expect(onChange).toHaveBeenCalledWith({ ...NO_FILTERS, make: 'T' })
})

test('choosing a category reports it', async () => {
  const onChange = vi.fn()
  render(<FilterBar filters={NO_FILTERS} onChange={onChange} />)

  await userEvent.selectOptions(screen.getByLabelText('Category'), 'suv')

  expect(onChange).toHaveBeenCalledWith({ ...NO_FILTERS, category: 'suv' })
})

test('Clear filters resets every field', async () => {
  const onChange = vi.fn()
  const filters = {
    make: 'Toyota',
    model: 'Corolla',
    category: 'sedan',
    minPrice: '1',
    maxPrice: '2',
  }
  render(<FilterBar filters={filters} onChange={onChange} />)

  await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

  expect(onChange).toHaveBeenCalledWith(NO_FILTERS)
})
