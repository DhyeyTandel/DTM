import { Outlet } from 'react-router'
import { clearToken } from '../auth/token'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  return (
    <>
      <SiteHeader onSignOut={clearToken} />
      <main>
        <Outlet />
      </main>
    </>
  )
}
