export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'dtm-theme'

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function applyInitialTheme(): void {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light')
}
