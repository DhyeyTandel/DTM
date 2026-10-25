import { Navigate, Outlet } from 'react-router'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { isAdmin } from '../lib/roles'
import { ROUTES } from '../lib/routes'
import { ErrorState, LoadingState } from './PageState'

export function RequireAdmin() {
  const { data: user, isPending, isError, error, refetch } = useCurrentUser()

  if (isPending) return <LoadingState label="Checking your account" />
  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }
  return isAdmin(user) ? <Outlet /> : <Navigate to={ROUTES.home} replace />
}
