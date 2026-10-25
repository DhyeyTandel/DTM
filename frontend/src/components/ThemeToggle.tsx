import { useState } from 'react'
import { applyTheme, currentTheme, type Theme } from '../lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  function switchTheme() {
    applyTheme(next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={switchTheme}
      className="min-h-11 cursor-pointer px-2 text-on-band/80 hover:text-on-band"
    >
      {next === 'dark' ? 'Dark mode' : 'Light mode'}
    </button>
  )
}
