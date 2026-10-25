import { Outlet } from 'react-router'
import { useSignOut } from '../hooks/useSignOut'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  const signOut = useSignOut()

  return (
    <>
      <SiteHeader onSignOut={signOut} />
      <main>
        <Outlet />
      </main>
    </>
  )
}
