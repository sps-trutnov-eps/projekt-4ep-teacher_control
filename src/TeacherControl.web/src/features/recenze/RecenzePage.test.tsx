import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
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

test('vykreslí seznam učitelů z API', async () => {
  renderPage()

  expect(await screen.findByText('Mgr. Jan Novák')).toBeDefined()
})

test('vyhledávání filtruje učitele bez ohledu na diakritiku', async () => {
  renderPage()
  await screen.findByText('Mgr. Jan Novák')

  fireEvent.change(screen.getByRole('searchbox', { name: 'Hledat učitele' }), {
    target: { value: 'svobodova' },
  })

  expect(screen.getByText('Bc. Eva Svobodová')).toBeDefined()
  expect(screen.queryByText('Mgr. Jan Novák')).toBeNull()
})

test('po výběru učitele ukáže detail s recenzemi a Like/Dislike', async () => {
  renderPage()

  fireEvent.click(await screen.findByRole('button', { name: /Mgr\. Jan Novák/ }))

  const detail = screen.getByRole('region', { name: 'Detail učitele' })
  expect(await within(detail).findByText('Hodnocení v kategoriích')).toBeDefined()
  expect(
    (await within(detail).findAllByRole('button', { name: /Líbí se mi/ })).length,
  ).toBeGreaterThan(0)
  expect(within(detail).getByRole('button', { name: 'Zpět na seznam' })).toBeDefined()
})
