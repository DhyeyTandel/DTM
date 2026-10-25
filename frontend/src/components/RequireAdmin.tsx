import { Navigate, Outlet } from 'react-router'
import { useCurrentUser } from '../hooks/useCurrentUser'
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
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />
}
