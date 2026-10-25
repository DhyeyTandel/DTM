import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test } from 'vitest'
import { applyTheme, currentTheme } from '../lib/theme'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => {
  delete document.documentElement.dataset.theme
})

test('the toggle switches between light and dark and remembers the choice', async () => {
  applyTheme('light')
  render(<ThemeToggle />)

  await userEvent.click(screen.getByRole('button', { name: 'Dark mode' }))

  expect(currentTheme()).toBe('dark')
  expect(localStorage.getItem('dtm-theme')).toBe('dark')
  expect(screen.getByRole('button', { name: 'Light mode' })).toBeInTheDocument()
})
