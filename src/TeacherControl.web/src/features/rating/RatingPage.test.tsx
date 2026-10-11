import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { RatingPage } from './RatingPage'

function renderPage(initialEntries: string[] = ['/rating']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <RatingPage />
          </MemoryRouter>
        </MockAuthProvider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

test('vykreslí seznam učitelů z API', async () => {
  renderPage(['/rating'])

  // Z mocks.ts by mělo přijít 'Jan Novák' v seznamu
  expect(await screen.findByText('Jan Novák')).toBeDefined()
})

test('vykreslí detail učitele při zadání ?teacher=1', async () => {
  renderPage(['/rating?teacher=1'])

  // V detailu by se mělo zobrazit jméno a sekce hodnocení
  expect(await screen.findAllByText('Jan Novák')).toBeDefined()
  expect(await screen.findByText('Hodnocení:')).toBeDefined()
})
