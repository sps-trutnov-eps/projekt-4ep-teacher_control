import { Notifications } from '@mantine/notifications'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { AbstencePage } from './AbstencePage'
import type { Teacher } from './types'

/**
 * Poznámka: netestujeme přes MSW — openapi-fetch staví `new Request('/api/...')`, což v Node
 * (jsdom nemá fetch) padá na `Invalid URL`. V prohlížeči to funguje, MSW handlery z `mocks.ts`
 * jdou ověřit ručně přes `pnpm dev`. Tady se mockují hooky z `api.ts` a testuje se UI proti
 * návrhu (desktop + mobil JPG).
 */

const TEACHERS: Teacher[] = [
  { id: 't-1', firstName: 'Jana', lastName: 'Nováková', averageDelayMinutes: 1, rating: 4.5, photoUrl: null },
  { id: 't-2', firstName: 'Petr', lastName: 'Svoboda', averageDelayMinutes: 14, rating: 3, photoUrl: null },
  { id: 't-4', firstName: 'Martin', lastName: 'Černý', averageDelayMinutes: 22, rating: 2, photoUrl: null },
]

const useTeachers = vi.fn().mockReturnValue({ data: TEACHERS, isPending: false, isError: false })
const useTeacher = vi.fn().mockImplementation((id: string) => ({
  data: TEACHERS.find((teacher) => teacher.id === id),
  isPending: false,
  isError: false,
}))
const useTeacherDelays = vi.fn().mockReturnValue({
  data: [
    {
      id: 'd-1',
      teacherId: 't-2',
      teacherName: 'Petr Svoboda',
      minutes: 15,
      authorName: 'Student Novák',
      createdAt: '2026-09-15T08:05:00.000Z',
    },
  ],
  isPending: false,
  isError: false,
})
const createDelayMock = vi.fn().mockResolvedValue({})
const useCreateDelay = vi.fn().mockReturnValue({
  mutateAsync: createDelayMock,
  isPending: false,
  isError: false,
})

vi.mock('./api', () => ({
  useTeachers: (filters?: { name?: string }) => useTeachers(filters),
  useTeacher: (id: string) => useTeacher(id),
  useTeacherDelays: (id: string) => useTeacherDelays(id),
  useCreateDelay: (id: string) => useCreateDelay(id),
}))

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MantineProvider>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          <AbstencePage />
        </MockAuthProvider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

beforeAll(() => {
  // jsdom nemá matchMedia ani ResizeObserver; Mantine je potřebuje.
  window.matchMedia =
    window.matchMedia ??
    vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

  window.ResizeObserver =
    window.ResizeObserver ??
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('AbstencePage oproti návrhu', () => {
  it('desktop: vyhledávání + seznam učitelů (jméno, hvězdy, kolečko podle nálady)', () => {
    renderPage()

    expect(screen.getByText('Jana Nováková')).toBeTruthy()
    expect(screen.getByText('Petr Svoboda')).toBeTruthy()
    expect(screen.getByText('Martin Černý')).toBeTruthy()

    // Dobrá nálada (1 min) → zelená, špatná (14 i 22 min) → červená.
    expect(screen.getAllByLabelText('Nálada učitele: Dobrá nálada').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Nálada učitele: Špatná nálada').length).toBeGreaterThan(0)
  })

  it('vyhledávání předává filtr jména do hooku', () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Vyhledat učitele'), {
      target: { value: 'Svoboda' },
    })

    expect(useTeachers).toHaveBeenLastCalledWith({ name: 'Svoboda' })
  })

  it('detail: záložky Zobrazit/Hodnotit z designu, Zobrazit ukazuje historii zpoždění', () => {
    renderPage()

    fireEvent.click(screen.getByText('Petr Svoboda'))

    // Detail se otevře: popisek profilu + záložky z designu (SegmentedControl = radio).
    expect(screen.getByText('Profil učitele — zpoždění a nálada')).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Zobrazit' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Hodnotit' })).toBeTruthy()

    // Historie na záložce Zobrazit (čas se formátuje do lokální zóny, tak pomocí regexu).
    expect(screen.getByText(/\+15 min — Student Novák/)).toBeTruthy()

    // Teploměr s průměrem z designu.
    expect(screen.getAllByLabelText('Nálada učitele: Špatná nálada').length).toBeGreaterThan(0)
    expect(screen.getByText('14 min')).toBeTruthy()
  })

  it('Hodnotit: rychlé tlačítko +5 uloží zpoždění jedním klikem', async () => {
    renderPage()

    fireEvent.click(screen.getByText('Petr Svoboda'))
    fireEvent.click(screen.getByRole('radio', { name: 'Hodnotit' }))

    fireEvent.click(screen.getByRole('button', { name: '+5' }))

    await waitFor(() => {
      expect(createDelayMock).toHaveBeenCalledWith({ minutes: 5, note: undefined })
    })
  })

  it('Hodnotit: custom 0 minut projde validací Zod a neodešle se', async () => {
    renderPage()

    fireEvent.click(screen.getByText('Petr Svoboda'))
    fireEvent.click(screen.getByRole('radio', { name: 'Hodnotit' }))

    fireEvent.change(screen.getByLabelText('Vlastní zpoždění (minuty)'), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Uložit zpoždění' }))

    await waitFor(() => {
      expect(screen.getByText('Zpoždění musí být alespoň 1 minuta.')).toBeTruthy()
    })
    expect(createDelayMock).not.toHaveBeenCalled()
  })

  it('mobil: řádek se rozklikne s detailem (varianta z mobilního návrhu)', async () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    try {
      renderPage()

      fireEvent.click(screen.getByText('Jana Nováková'))

      // Po rozkliku se uvnitř řádku objeví teploměr a záložky.
      await waitFor(() => {
        expect(screen.getAllByLabelText('Nálada učitele: Dobrá nálada').length).toBeGreaterThan(0)
      })
    } finally {
      window.matchMedia = original
    }
  })
})
