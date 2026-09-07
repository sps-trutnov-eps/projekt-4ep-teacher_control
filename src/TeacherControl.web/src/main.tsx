import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { queryClient } from '@/shared/api'
import { MockAuthProvider } from '@/shared/auth'

/** MSW jede ve vývoji defaultně. Vypneš ho v .env.local přes VITE_USE_MOCKS=false. */
async function startMocks() {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS === 'false') {
    return
  }

  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('V index.html chybí <div id="root">.')
}

startMocks().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <MantineProvider>
        <Notifications />
        <QueryClientProvider client={queryClient}>
          <MockAuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </MockAuthProvider>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>,
  )
})
