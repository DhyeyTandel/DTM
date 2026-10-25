import { Link } from 'react-router'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useToken } from '../hooks/useToken'
import { isAdmin } from '../lib/roles'
import { ROUTES } from '../lib/routes'
import { ThemeToggle } from './ThemeToggle'
import { Wordmark } from './Wordmark'

interface SiteHeaderProps {
  onSignOut: () => void
}

const navLinkClasses = 'flex min-h-11 items-center px-2'

export function SiteHeader({ onSignOut }: SiteHeaderProps) {
  const token = useToken()
  const { data: user } = useCurrentUser()

  return (
    <header className="border-b border-line bg-band text-on-band">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="flex items-center gap-2 sm:gap-5">
          {token && (
            <Link to={ROUTES.home} className={`${navLinkClasses} hidden sm:flex`}>
              Inventory
            </Link>
          )}
          {isAdmin(user) && (
            <Link to={ROUTES.newVehicle} className={navLinkClasses}>
              Add vehicle
            </Link>
          )}
          <ThemeToggle />
          {token ? (
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-11 cursor-pointer border border-on-band/60 px-4 font-semibold hover:bg-on-band hover:text-band"
            >
              Sign out
            </button>
          ) : (
            <Link
              to={ROUTES.login}
              className="flex min-h-11 items-center border border-on-band/60 px-4 font-semibold hover:bg-on-band hover:text-band"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
