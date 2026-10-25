import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { Wordmark } from './Wordmark'

test('the wordmark is a link home named after the dealership', () => {
  render(
    <MemoryRouter>
      <Wordmark />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'Dhyey Tandel Motors' })).toHaveAttribute('href', '/')
})
