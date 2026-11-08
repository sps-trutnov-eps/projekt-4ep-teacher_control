import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { useCreateReview } from './api'
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

  expect(await screen.findByText('Jan Novák')).toBeDefined()
})

test('vyhledávání filtruje učitele bez ohledu na diakritiku', async () => {
  renderPage()
  await screen.findByText('Jan Novák')

  fireEvent.change(screen.getByRole('searchbox', { name: 'Hledat učitele' }), {
    target: { value: 'svobodova' },
  })

  expect(screen.getByText('Eva Svobodová')).toBeDefined()
  expect(screen.queryByText('Jan Novák')).toBeNull()
})

test('po výběru učitele ukáže profil, recenze a reakce na učitele', async () => {
  renderPage()

  fireEvent.click(await screen.findByRole('button', { name: /Jan Novák/ }))

  const detail = screen.getByRole('region', { name: 'Detail učitele' })
  expect(await within(detail).findByText('O učiteli')).toBeDefined()
  expect(await within(detail).findByRole('button', { name: /Líbí se mi učitel/ })).toBeDefined()
  expect(within(detail).getByRole('button', { name: 'Zpět na seznam' })).toBeDefined()
})

test('uloží reakci k učiteli a aktualizuje její počet', async () => {
  renderPage()
  fireEvent.click(await screen.findByRole('button', { name: /Jan Novák/ }))

  const detail = screen.getByRole('region', { name: 'Detail učitele' })
  fireEvent.click(await within(detail).findByRole('button', { name: 'Líbí se mi učitel (0)' }))

  expect(await within(detail).findByRole('button', { name: 'Líbí se mi učitel (1)' })).toBeDefined()
})

test('odešle recenzi s obsahem podle backendového kontraktu', async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useCreateReview(1), { wrapper })
  const content = 'Výklad je jasný a učitel ochotně odpovídá na otázky.'

  let createdContent: string | undefined
  await act(async () => {
    const created = await result.current.mutateAsync({ content })
    createdContent = created.content
  })

  expect(createdContent).toBe(content)
})
