export const PASSWORD_MIN_BYTES = 8
export const PASSWORD_MAX_BYTES = 72

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emailError(email: string): string | null {
  if (email.trim() === '') return 'Enter your email.'
  return EMAIL_PATTERN.test(email.trim()) ? null : 'Enter a valid email address.'
}

export function passwordError(password: string): string | null {
  if (password === '') return 'Enter your password.'
  const bytes = new TextEncoder().encode(password).length
  const fits = bytes >= PASSWORD_MIN_BYTES && bytes <= PASSWORD_MAX_BYTES
  return fits
    ? null
    : `Password must be ${String(PASSWORD_MIN_BYTES)} to ${String(PASSWORD_MAX_BYTES)} characters.`
}
