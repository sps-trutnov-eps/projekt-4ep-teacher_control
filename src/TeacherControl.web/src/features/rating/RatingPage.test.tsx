import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { RatingPage } from './RatingPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          <RatingPage />
        </MockAuthProvider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

test('vykreslí seznam učitelů z API', async () => {
  renderPage()

  // Z mocks.ts by mělo přijít 'Jan Novák' a další.
  expect(await screen.findByText('Jan Novák')).toBeDefined()
})
