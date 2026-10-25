import { useMutation } from '@tanstack/react-query'
import { login, register } from '../api/auth'
import { setToken } from '../auth/token'

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setToken(await login(email, password))
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      register(email, password),
  })
}
