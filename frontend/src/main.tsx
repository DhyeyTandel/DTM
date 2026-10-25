import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ApiError } from './api/client'
import { App } from './App'
import './index.css'
import { applyInitialTheme } from './lib/theme'

applyInitialTheme()

const MAX_NETWORK_RETRIES = 1

// An api answer such as a 401 or a 409 will not change if it is asked again, so only network
// failures are retried.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        !(error instanceof ApiError) && failureCount < MAX_NETWORK_RETRIES,
    },
  },
})
const root = document.getElementById('root')
if (!root) {
  throw new Error('index.html has no #root element')
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
