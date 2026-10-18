import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { BingoPage } from './BingoPage'

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <BingoPage />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

test('vyhledává učitele a umožňuje je jednotlivě vybrat', async () => {
  renderPage()

  const teacherCheckbox = await screen.findByRole('checkbox', { name: 'Mgr. Jan Novák' })
  expect((teacherCheckbox as HTMLInputElement).checked).toBe(true)

  fireEvent.click(teacherCheckbox)
  expect((teacherCheckbox as HTMLInputElement).checked).toBe(false)

  fireEvent.change(screen.getByRole('textbox', { name: 'Vyhledat učitele' }), { target: { value: 'Dvořák' } })
  expect(await screen.findByRole('checkbox', { name: 'Ing. Petr Dvořák' })).toBeDefined()
  expect(screen.queryByRole('checkbox', { name: 'Mgr. Jan Novák' })).toBeNull()
})
