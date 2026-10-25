import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, useLocation } from 'react-router'
import { App } from '../App'
import { setToken } from '../auth/token'
import { server } from './setup'

type Role = 'admin' | 'customer'

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>
}

export function signInAs(role: Role): void {
  setToken('test-token')
  server.use(
    http.get('/api/auth/me', () =>
      HttpResponse.json({ id: 1, email: `${role}@example.com`, role }),
    ),
  )
}

export function renderApp(route = '/', role: Role | null = null) {
  if (role) signInAs(role)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <App />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
