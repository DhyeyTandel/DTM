import { afterEach, expect, test, vi } from 'vitest'
import { applyInitialTheme, applyTheme, currentTheme } from './theme'

function systemPrefersDark(prefersDark: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches: prefersDark }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  delete document.documentElement.dataset.theme
})

test('the theme starts from the system setting when nothing is stored', () => {
  systemPrefersDark(true)

  applyInitialTheme()

  expect(currentTheme()).toBe('dark')
})

test('the stored theme wins over the system setting', () => {
  systemPrefersDark(true)
  localStorage.setItem('dtm-theme', 'light')

  applyInitialTheme()

  expect(currentTheme()).toBe('light')
})

test('applying a theme remembers it for the next visit', () => {
  systemPrefersDark(false)
  applyTheme('dark')

  document.documentElement.dataset.theme = 'light'
  applyInitialTheme()

  expect(currentTheme()).toBe('dark')
})
