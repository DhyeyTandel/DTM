import { Link, Navigate, useLocation } from 'react-router'
import { CredentialsForm } from '../components/CredentialsForm'
import { useLogin } from '../hooks/useAuth'
import { useToken } from '../hooks/useToken'

interface LoginLocationState {
  registered?: boolean
}

export function LoginPage() {
  const token = useToken()
  const login = useLogin()
  const state = useLocation().state as LoginLocationState | null

  if (token) return <Navigate to="/" replace />

  return (
    <CredentialsForm
      title="Sign in"
      submitLabel="Sign in"
      notice={state?.registered ? 'Account created. Sign in to continue.' : undefined}
      pending={login.isPending}
      passwordAutoComplete="current-password"
      serverError={login.error?.message ?? null}
      onSubmit={(email, password) => {
        login.mutate({ email, password })
      }}
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-ink underline">
            Create an account
          </Link>
        </>
      }
    />
  )
}
