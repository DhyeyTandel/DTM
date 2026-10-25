import { http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { server } from '../test/setup'
import { TOKEN_STORAGE_KEY, getToken } from '../auth/token'
import { ApiError, request } from './client'

function echoAuthorizationHeader() {
  server.use(
    http.get('/api/echo', ({ request: incoming }) =>
      HttpResponse.json({ authorization: incoming.headers.get('authorization') }),
    ),
  )
}

test('a request sends the stored token as a bearer header', async () => {
  echoAuthorizationHeader()
  localStorage.setItem(TOKEN_STORAGE_KEY, 'abc.def.ghi')

  const response = await request<{ authorization: string | null }>('/echo')

  expect(response.authorization).toBe('Bearer abc.def.ghi')
})

test('a request with no stored token sends no authorization header', async () => {
  echoAuthorizationHeader()

  const response = await request<{ authorization: string | null }>('/echo')

  expect(response.authorization).toBeNull()
})

test('a 401 response clears the stored token', async () => {
  server.use(http.get('/api/vehicles', () => new HttpResponse(null, { status: 401 })))
  localStorage.setItem(TOKEN_STORAGE_KEY, 'expired.token')

  await request('/vehicles').catch(() => undefined)

  expect(getToken()).toBeNull()
})

test('a response with an error status rejects with an error that carries that status', async () => {
  server.use(
    http.get('/api/vehicles/1', () =>
      HttpResponse.json({ detail: 'Vehicle is out of stock' }, { status: 409 }),
    ),
  )

  const failure = await request('/vehicles/1').catch((error: unknown) => error)

  expect(failure).toBeInstanceOf(ApiError)
  expect(failure).toMatchObject({ status: 409, message: 'Vehicle is out of stock' })
})
