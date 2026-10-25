import { Link } from 'react-router'
import { ThemeToggle } from './ThemeToggle'
import { Wordmark } from './Wordmark'

interface SiteHeaderProps {
  onSignOut: () => void
}

export function SiteHeader({ onSignOut }: SiteHeaderProps) {
  return (
    <header className="border-b border-line bg-band text-on-band">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="flex items-center gap-2 sm:gap-5">
          <Link to="/" className="hidden min-h-11 items-center px-2 sm:flex">
            Inventory
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={onSignOut}
            className="min-h-11 cursor-pointer border border-on-band/60 px-4 font-semibold hover:bg-on-band hover:text-band"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}
