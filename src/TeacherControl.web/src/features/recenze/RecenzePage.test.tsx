import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { RecenzePage } from './RecenzePage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          <RecenzePage />
        </MockAuthProvider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

test('filtruje učitele a po výběru zobrazí jeho recenzi', async () => {
  renderPage()

  const search = await screen.findByRole('textbox', { name: 'Hledat' })
  fireEvent.change(search, { target: { value: 'Jan' } })

  expect(screen.getByRole('button', { name: /Jan Novák/ })).toBeDefined()
  expect(screen.queryByRole('button', { name: /Petr Svoboda/ })).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: /Jan Novák/ }))
  expect(await screen.findByText('Férový učitel')).toBeDefined()
  expect(screen.getByRole('button', { name: 'Zpět' })).toBeDefined()
})
