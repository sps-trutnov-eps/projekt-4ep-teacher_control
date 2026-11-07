import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MockAuthProvider } from '@/shared/auth'
import { theme } from '@/shared/theme'
import { PololetiPage } from './PololetiPage'
import type { PololetiTeacher, TeacherCard } from './types'

/**
 * Netestujeme přes MSW — openapi-fetch staví `new Request('/api/...')`, což v Node padá na
 * `Invalid URL`. V prohlížeči to funguje. Proto se tu mockují hooky z `api.ts` a testuje se UI
 * proti tomu, co uživatel vidí.
 */

const TEACHERS: PololetiTeacher[] = [
  { teacherId: 1, name: 'Jana Nováková', photoUrl: null },
  { teacherId: 2, name: 'Petr Svoboda', photoUrl: null },
]

const CARD: TeacherCard = {
  teacherId: 1,
  name: 'Jana Nováková',
  photoUrl: null,
  description: 'Učí matematiku.',
  pololeti: 0,
  pololetiText: '2026/2027 – 1. pololetí',
  titles: [
    { teacherTitleId: 1, title: 'Nejlepší učitel', votes: 12, myVoteTeacherId: null },
    { teacherTitleId: 2, title: 'Nejvtipnější učitel', votes: 3, myVoteTeacherId: 1 },
    { teacherTitleId: 3, title: 'Nejspravedlivější učitel', votes: 7, myVoteTeacherId: 2 },
  ],
}

const castVote = vi.fn()

vi.mock('./api', () => ({
  ApiError: class ApiError extends Error {
    readonly status: number

    constructor(status: number) {
      super(`API volání skončilo ${status}.`)
      this.status = status
    }
  },
  usePololetiTeachers: () => ({ data: TEACHERS, isPending: false, isError: false }),
  usePololetiTeacher: (teacherId: number | null) => ({
    data: teacherId === null ? undefined : CARD,
    isPending: teacherId === null,
    isError: false,
  }),
  useCastVote: () => ({
    mutate: castVote,
    isPending: false,
    isError: false,
    error: null,
    variables: undefined,
  }),
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          <PololetiPage />
        </MockAuthProvider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('PololetiPage', () => {
  it('vykreslí seznam učitelů a výzvu k výběru', () => {
    renderPage()

    const list = screen.getByRole('navigation', { name: 'Učitelé' })
    expect(within(list).getByText('Jana Nováková')).toBeDefined()
    expect(within(list).getByText('Petr Svoboda')).toBeDefined()
    expect(screen.getByText('Vyber učitele ze seznamu.')).toBeDefined()
  })

  it('po výběru učitele ukáže kartu s tituly a počty hlasů', () => {
    renderPage()

    fireEvent.click(screen.getByText('Jana Nováková'))

    expect(screen.getByText('2026/2027 – 1. pololetí')).toBeDefined()
    expect(screen.getByText('Nejlepší učitel')).toBeDefined()
    expect(screen.getByText('Hlasů: 12')).toBeDefined()
  })

  it('odliší titul, kde už hlasuju pro něj, a titul, kde hlasuju pro jiného učitele', () => {
    renderPage()

    fireEvent.click(screen.getByText('Jana Nováková'))

    expect(screen.getByRole('button', { name: 'Hlasovat' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Tvůj hlas' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Přesunout hlas sem' })).toBeDefined()
  })

  it('klik na Hlasovat odešle hlas o daný titul', () => {
    renderPage()

    fireEvent.click(screen.getByText('Jana Nováková'))
    fireEvent.click(screen.getByRole('button', { name: 'Hlasovat' }))

    expect(castVote).toHaveBeenCalledWith(1)
  })
})
