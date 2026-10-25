import { http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { server } from '../test/setup'
import { setToken } from '../auth/token'
import { request } from './client'

function echoAuthorizationHeader() {
  server.use(
    http.get('/api/echo', ({ request: incoming }) =>
      HttpResponse.json({ authorization: incoming.headers.get('authorization') }),
    ),
  )
}

test('a request sends the stored token as a bearer header', async () => {
  echoAuthorizationHeader()
  setToken('abc.def.ghi')

  const response = await request<{ authorization: string | null }>('/echo')

  expect(response.authorization).toBe('Bearer abc.def.ghi')
})

test('a request with no stored token sends no authorization header', async () => {
  echoAuthorizationHeader()

  const response = await request<{ authorization: string | null }>('/echo')

  expect(response.authorization).toBeNull()
})
