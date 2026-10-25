import { Navigate, Outlet } from 'react-router'
import { useToken } from '../hooks/useToken'
import { ROUTES } from '../lib/routes'

export function RequireAuth() {
  const token = useToken()
  return token ? <Outlet /> : <Navigate to={ROUTES.login} replace />
}
