import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { VzorPage } from './VzorPage'

/**
 * Vzorový test. Featura potřebuje stejné providery jako v main.tsx, jen s vlastní
 * QueryClient, ať se cache nepřelévá mezi testy. Data chodí z MSW handlerů featury.
 */
function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          <VzorPage />
        </MockAuthProvider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

test('vykreslí položky z API', async () => {
  renderPage()

  expect(await screen.findByText('První položka')).toBeDefined()
})

test('učiteli ukáže formulář', async () => {
  renderPage()

  // Výchozí mock uživatel je učitel, takže formulář na přidání položky vidí.
  expect(await screen.findByRole('button', { name: 'Uložit' })).toBeDefined()
})
