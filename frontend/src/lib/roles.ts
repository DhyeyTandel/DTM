import type { CurrentUser } from '../api/types'

export function isAdmin(user: CurrentUser | undefined): boolean {
  return user?.role === 'admin'
}
