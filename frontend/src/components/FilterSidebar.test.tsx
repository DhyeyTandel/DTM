import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DEFAULT_LISTING_PARAMS } from '../lib/listing'
import { FilterSidebar } from './FilterSidebar'

function renderSidebar(onChange = vi.fn()) {
  render(<FilterSidebar params={DEFAULT_LISTING_PARAMS} onChange={onChange} />)
  return onChange
}

test('every filter section starts closed and a click opens and closes it', async () => {
  renderSidebar()
  const section = screen.getByRole('button', { name: /price range/i })
  expect(section).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getByLabelText('Min price (₹)')).not.toBeVisible()

  await userEvent.click(section)
  expect(section).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByLabelText('Min price (₹)')).toBeVisible()

  await userEvent.click(section)
  expect(section).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getByLabelText('Min price (₹)')).not.toBeVisible()
})

test('choosing a category reports it', async () => {
  const onChange = renderSidebar()

  await userEvent.click(screen.getByRole('button', { name: /category/i }))
  await userEvent.click(screen.getByLabelText('Hatchback'))

  expect(onChange).toHaveBeenCalledWith({ category: 'hatchback' })
})

test('typing a price reports it', async () => {
  const onChange = renderSidebar()

  await userEvent.click(screen.getByRole('button', { name: /price range/i }))
  await userEvent.type(screen.getByLabelText('Max price (₹)'), '9')

  expect(onChange).toHaveBeenCalledWith({ maxPrice: '9' })
})

test('choosing an availability reports it', async () => {
  const onChange = renderSidebar()

  await userEvent.click(screen.getByRole('button', { name: /availability/i }))
  await userEvent.click(screen.getByLabelText('Low stock'))

  expect(onChange).toHaveBeenCalledWith({ availability: 'low' })
})

test('a closed section keeps the panel its button controls', () => {
  renderSidebar()
  const section = screen.getByRole('button', { name: /price range/i })

  const panelId = section.getAttribute('aria-controls') ?? ''

  expect(document.getElementById(panelId)).toBeInTheDocument()
})

test('each radio group is named after its section', async () => {
  renderSidebar()

  await userEvent.click(screen.getByRole('button', { name: /category/i }))
  await userEvent.click(screen.getByRole('button', { name: /availability/i }))

  expect(screen.getByRole('radiogroup', { name: 'Category' })).toBeInTheDocument()
  expect(screen.getByRole('radiogroup', { name: 'Availability' })).toBeInTheDocument()
})
