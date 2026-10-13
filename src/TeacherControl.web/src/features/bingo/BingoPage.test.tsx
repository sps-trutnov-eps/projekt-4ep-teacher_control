import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
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
        <MockAuthProvider>
          <BingoPage />
        </MockAuthProvider>
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

test('umožňuje zrušit výběr všech učitelů', async () => {
  renderPage()

  const teacherCheckbox = await screen.findByRole('checkbox', { name: 'Mgr. Jan Novák' })
  expect((teacherCheckbox as HTMLInputElement).checked).toBe(true)

  fireEvent.click(screen.getByRole('button', { name: 'Zrušit výběr' }))

  expect((teacherCheckbox as HTMLInputElement).checked).toBe(false)
  expect(screen.getByText('0 z 16 vybráno')).toBeDefined()
  expect((screen.getByRole('button', { name: 'Zrušit výběr' }) as HTMLButtonElement).disabled).toBe(true)
})

test('odešle novou hlášku vybraného učitele', async () => {
  renderPage()

  fireEvent.click(await screen.findByRole('combobox', { name: 'Učitel' }))
  fireEvent.click(await screen.findByRole('option', { name: 'Mgr. Jan Novák', hidden: true }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Hláška' }), {
    target: { value: 'Nová hláška od studenta.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Odeslat hlášku' }))

  expect((await screen.findByRole('status')).textContent).toBe('Hláška byla odeslána.')
})

test('ukládá označení políčka do persistentního mockového stavu', async () => {
  localStorage.removeItem('teacher-control.bingo-state')
  sessionStorage.removeItem('teacher-control.mock-user-id')
  renderPage()

  const cells = await screen.findAllByRole('button', { pressed: false })
  const firstCell = cells.find((cell) => cell.getAttribute('aria-pressed') === 'false')
  if (!firstCell) {
    throw new Error('Bingo deska neobsahuje žádná neoznačená políčka.')
  }
  fireEvent.click(firstCell)

  expect(await screen.findByText('✓ Označeno')).toBeDefined()
  expect(localStorage.getItem('teacher-control.bingo-state')).toContain('"isMarked":true')
})

test('zobrazí prvního hráče, který dnes dokončí bingo', async () => {
  renderPage()
  fireEvent.click(await screen.findByRole('button', { name: 'Nová deska' }))

  const cells = await screen.findAllByRole('button', { pressed: false })
  for (const cell of cells.slice(0, 4)) {
    fireEvent.click(cell)
    await waitFor(() => expect(cell.getAttribute('aria-pressed')).toBe('true'))
  }

  expect(await screen.findByText('Učitel Svoboda')).toBeDefined()
})
