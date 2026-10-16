import { Notifications } from '@mantine/notifications'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { AbstencePage } from './AbstencePage'
import type { Teacher } from './types'

/**
 * Netestujeme přes MSW — openapi-fetch staví `new Request('/api/...')`, což v Node (jsdom
 * nemá fetch) padá na `Invalid URL`. V prohlížeči to funguje. Tady se mockují hooky z `api.ts`
 * (a ApiError/formatRetryAfter se nechají z reálného modulu) a testuje se UI proti návrhu.
 */

const TEACHERS: Teacher[] = [
  { teacherId: 1, name: 'Jana Nováková', photoUrl: null, rating: 4.5, mood: 1, lateArrivalMinutesToday: 0 },
  { teacherId: 2, name: 'Petr Svoboda', photoUrl: null, rating: 3, mood: 4, lateArrivalMinutesToday: 15 },
  { teacherId: 4, name: 'Martin Černý', photoUrl: null, rating: 2, mood: 5, lateArrivalMinutesToday: 25 },
]

const useTeachers = vi.fn().mockReturnValue({ data: TEACHERS, isPending: false, isError: false })
const useTeacher = vi.fn().mockImplementation((id: number) => ({
  data: TEACHERS.find((teacher) => teacher.teacherId === id),
  isPending: false,
  isError: false,
}))
const submitLateArrivalMock = vi.fn()
const useSubmitLateArrival = vi.fn().mockReturnValue({
  mutate: submitLateArrivalMock,
  mutateAsync: submitLateArrivalMock,
  isPending: false,
  isError: false,
  error: null,
})
const submitMoodMock = vi.fn()
const useSubmitMood = vi.fn().mockReturnValue({
  mutate: submitMoodMock,
  mutateAsync: submitMoodMock,
  isPending: false,
  isError: false,
  error: null,
})

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTeachers: () => useTeachers(),
  useTeacher: (id: number) => useTeacher(id),
  useSubmitLateArrival: (id: number) => useSubmitLateArrival(id),
  useSubmitMood: (id: number) => useSubmitMood(id),
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

    // Nálada 1 → zelená (Dobrá), 4 a 5 → červená (Špatná).
    expect(screen.getAllByLabelText('Nálada učitele: Dobrá nálada').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Nálada učitele: Špatná nálada').length).toBeGreaterThan(0)
  })

  it('vyhledávání filtruje seznam podle jména (filtr řeší frontend)', () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Vyhledat učitele'), {
      target: { value: 'Svoboda' },
    })

    expect(screen.getByText('Petr Svoboda')).toBeTruthy()
    expect(screen.queryByText('Jana Nováková')).toBeNull()
    expect(screen.queryByText('Martin Černý')).toBeNull()
  })

  it('detail: záložky Zobrazit/Hodnotit z designu, Zobrazit ukazuje dnešní zpoždění a metr jen pro čtení', () => {
    renderPage()

    fireEvent.click(screen.getByText('Petr Svoboda'))

    // Detail se otevře: popisek profilu + záložky z designu (SegmentedControl = radio).
    expect(screen.getByText('Profil učitele — zpoždění a nálada')).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Zobrazit' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Hodnotit' })).toBeTruthy()

    // Dnešní zpoždění na záložce Zobrazit (text je rozdělený do vnořených elementů).
    expect(screen.getByText(/Dnes nahlášeno/)).toBeTruthy()
    expect(screen.getByText('15 min')).toBeTruthy()

    // Metr nálady je na Zobrazit jen pro čtení — žádná tlačítka úrovní.
    expect(screen.queryByRole('button', { name: /Nastavit náladu/ })).toBeNull()
    expect(screen.getAllByLabelText('Nálada učitele: Špatná nálada').length).toBeGreaterThan(0)
  })

  it('Hodnotit: metr nálady je editovatelný, klik na úroveň uloží hodnotu', () => {
    renderPage()

    fireEvent.click(screen.getByText('Petr Svoboda'))
    fireEvent.click(screen.getByRole('radio', { name: 'Hodnotit' }))

    fireEvent.click(screen.getByRole('button', { name: /Nastavit náladu na 2 z 5/ }))

    expect(submitMoodMock).toHaveBeenCalledWith({ value: 2 })
  })

  it('Hodnotit: rychlé tlačítko +5 uloží zpoždění jedním klikem', () => {
    renderPage()

    fireEvent.click(screen.getByText('Petr Svoboda'))
    fireEvent.click(screen.getByRole('radio', { name: 'Hodnotit' }))

    fireEvent.click(screen.getByRole('button', { name: '+5' }))

    expect(submitLateArrivalMock).toHaveBeenCalledWith({ minutes: 5 })
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
    expect(submitLateArrivalMock).not.toHaveBeenCalled()
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

      // Po rozkliku se uvnitř řádku objeví detail s metrem a dnešním zpožděním. Vedle může
      // zůstat i desktopový detail, takže obsahů "Dnes nahlášeno" může být víc.
      await waitFor(() => {
        expect(screen.getAllByLabelText('Nálada učitele: Dobrá nálada').length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Dnes nahlášeno/).length).toBeGreaterThan(0)
      })
    } finally {
      window.matchMedia = original
    }
  })
})
