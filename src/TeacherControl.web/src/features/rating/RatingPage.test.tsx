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

  expect(await screen.findByText('Jan Novák')).toBeDefined()
})

test('vykreslí detail učitele při zadání ?teacher=1', async () => {
  renderPage(['/rating?teacher=1'])

  expect(await screen.findByText('Hodnocení:')).toBeDefined()
})
