import { useState, type SyntheticEvent, type ReactNode } from 'react'
import { emailError, passwordError } from '../lib/validation'
import { Button } from './Button'
import { TextField } from './TextField'

interface CredentialsFormProps {
  title: string
  submitLabel: string
  notice?: string
  pending: boolean
  passwordAutoComplete: 'current-password' | 'new-password'
  serverError: string | null
  onSubmit: (email: string, password: string) => void
  footer: ReactNode
}

export function CredentialsForm({
  title,
  submitLabel,
  notice,
  pending,
  passwordAutoComplete,
  serverError,
  onSubmit,
  footer,
}: CredentialsFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email: string | null; password: string | null }>({
    email: null,
    password: null,
  })

  function handleSubmit(event: SyntheticEvent): void {
    event.preventDefault()
    const found = { email: emailError(email), password: passwordError(password) }
    setErrors(found)
    if (found.email === null && found.password === null) onSubmit(email.trim(), password)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <h1 className="text-3xl font-semibold">{title}</h1>
      {notice && <p className="mt-4 border border-line bg-surface p-3">{notice}</p>}
      <form noValidate onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={errors.email ?? undefined}
          onChange={(event) => {
            setEmail(event.target.value)
          }}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete={passwordAutoComplete}
          value={password}
          error={errors.password ?? undefined}
          onChange={(event) => {
            setPassword(event.target.value)
          }}
        />
        {serverError && (
          <p role="alert" className="text-error">
            {serverError}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </form>
      <p className="mt-6 text-ink-muted">{footer}</p>
    </div>
  )
}
