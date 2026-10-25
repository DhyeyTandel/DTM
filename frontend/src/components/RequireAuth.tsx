import { Navigate, Outlet } from 'react-router'
import { useToken } from '../hooks/useToken'

export function RequireAuth() {
  const token = useToken()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
