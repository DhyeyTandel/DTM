import { expect, test, vi } from 'vitest'
import { clearToken, getToken, setToken, subscribeToToken } from './token'

test('a stored token can be read back and cleared', () => {
  setToken('abc')
  expect(getToken()).toBe('abc')

  clearToken()
  expect(getToken()).toBeNull()
})

test('subscribers hear about a new token and about a cleared one', () => {
  const listener = vi.fn()
  const unsubscribe = subscribeToToken(listener)

  setToken('abc')
  clearToken()
  unsubscribe()
  setToken('def')

  expect(listener).toHaveBeenCalledTimes(2)
})
