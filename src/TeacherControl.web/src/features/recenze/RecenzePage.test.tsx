import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { RecenzePage } from './RecenzePage'

// jsdom nemá document.fonts (potřebuje ho autosize Textarea) ani window.scrollTo (volá ho stránka).
Object.defineProperty(document, 'fonts', {
  configurable: true,
  value: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
})
window.scrollTo = vi.fn()

afterEach(() => sessionStorage.clear())

/** Výchozí mock uživatel je učitel, ten recenze psát nemůže. */
function loginAsStudent() {
  sessionStorage.setItem('teacher-control.mock-user-id', 'u-student')
}

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

test('po výběru učitele ukáže profil, recenze a reakce na učitele', async () => {
  renderPage()

  fireEvent.click(await screen.findByRole('button', { name: /Jan Novák/ }))

  const detail = screen.getByRole('region', { name: 'Detail učitele' })
  expect(await within(detail).findByRole('heading', { name: /^Recenze \(/ })).toBeDefined()
  expect(within(detail).getByRole('button', { name: /Líbí se mi/ })).toBeDefined()
  expect(within(detail).getByRole('button', { name: 'Zpět na seznam' })).toBeDefined()
})

test('Like se po kliknutí započítá a jde změnit na Dislike', async () => {
  renderPage()

  fireEvent.click(await screen.findByRole('button', { name: /Bc\. Eva Svobodová/ }))
  const detail = screen.getByRole('region', { name: 'Detail učitele' })

  const like = await within(detail).findByRole('button', { name: /Líbí se mi/ })
  expect(like.getAttribute('aria-pressed')).toBe('false')

  fireEvent.click(like)
  await waitFor(() =>
    expect(
      within(detail)
        .getByRole('button', { name: /Líbí se mi/ })
        .getAttribute('aria-pressed'),
    ).toBe('true'),
  )

  expect(
    (within(detail).getByRole('button', { name: /Líbí se mi/ }) as HTMLButtonElement).disabled,
  ).toBe(true)
  const dislike = within(detail).getByRole('button', { name: /Nelíbí se mi/ }) as HTMLButtonElement
  await waitFor(() => expect(dislike.disabled).toBe(false))
  fireEvent.click(dislike)
  await waitFor(() =>
    expect(
      within(detail)
        .getByRole('button', { name: /Nelíbí se mi/ })
        .getAttribute('aria-pressed'),
    ).toBe('true'),
  )
  expect(
    within(detail)
      .getByRole('button', { name: /Líbí se mi/ })
      .getAttribute('aria-pressed'),
  ).toBe('false')
})

test('napsaná recenze se objeví v seznamu a další už psát nejde', async () => {
  loginAsStudent()
  renderPage()

  fireEvent.click(await screen.findByRole('button', { name: /Ing\. Petr Král/ }))
  const detail = screen.getByRole('region', { name: 'Detail učitele' })

  fireEvent.click(await within(detail).findByRole('button', { name: 'Napsat recenzi' }))
  fireEvent.change(await within(detail).findByRole('textbox', { name: /Vaše recenze/ }), {
    target: { value: 'Výborně vysvětluje webové aplikace.' },
  })
  fireEvent.click(within(detail).getByRole('button', { name: 'Odeslat recenzi' }))

  expect(await within(detail).findByText('Výborně vysvětluje webové aplikace.')).toBeDefined()
  expect(within(detail).getByText('Moje recenze')).toBeDefined()
  expect(
    (within(detail).getByRole('button', { name: 'Napsat recenzi' }) as HTMLButtonElement).disabled,
  ).toBe(true)
})
