import { Outlet } from 'react-router'
import { ThemeToggle } from './ThemeToggle'
import { Wordmark } from './Wordmark'

export function Layout() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
          <Wordmark />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </>
  )
}
