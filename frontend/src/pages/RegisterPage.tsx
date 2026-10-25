import { Link, Navigate, useNavigate } from 'react-router'
import { CredentialsForm } from '../components/CredentialsForm'
import { useRegister } from '../hooks/useAuth'
import { useToken } from '../hooks/useToken'
import { ROUTES } from '../lib/routes'

export function RegisterPage() {
  const token = useToken()
  const register = useRegister()
  const navigate = useNavigate()

  if (token) return <Navigate to={ROUTES.home} replace />

  return (
    <CredentialsForm
      title="Create account"
      submitLabel="Create account"
      pending={register.isPending}
      passwordAutoComplete="new-password"
      serverError={register.error?.message ?? null}
      onSubmit={(email, password) => {
        register.mutate(
          { email, password },
          {
            onSuccess: () => {
              void navigate(ROUTES.login, { state: { registered: true } })
            },
          },
        )
      }}
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-semibold text-ink underline">
            Sign in
          </Link>
        </>
      }
    />
  )
}
