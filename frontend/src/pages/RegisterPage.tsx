import { Link, Navigate, useNavigate } from 'react-router'
import { CredentialsForm } from '../components/CredentialsForm'
import { useRegister } from '../hooks/useAuth'
import { useToken } from '../hooks/useToken'

export function RegisterPage() {
  const token = useToken()
  const register = useRegister()
  const navigate = useNavigate()

  if (token) return <Navigate to="/" replace />

  return (
    <CredentialsForm
      title="Create account"
      submitLabel="Create account"
      pending={register.isPending}
      serverError={register.error?.message ?? null}
      onSubmit={(email, password) => {
        register.mutate(
          { email, password },
          {
            onSuccess: () => {
              void navigate('/login', { state: { registered: true } })
            },
          },
        )
      }}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline">
            Sign in
          </Link>
        </>
      }
    />
  )
}
