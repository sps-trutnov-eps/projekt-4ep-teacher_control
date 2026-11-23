import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, test } from 'vitest'
import type { TeacherSection, TeacherSectionProps } from '@/shared/teachers'
import { theme } from '@/shared/theme'
import { TeacherProfilePage } from './TeacherProfilePage'

function DoneSection({ teacherId }: TeacherSectionProps) {
  return <p>Obsah sekce pro učitele {teacherId}</p>
}

const SECTIONS: TeacherSection[] = [
  { id: 'hotova', title: 'Hotová sekce', Component: DoneSection },
  { id: 'prazdna', title: 'Prázdná sekce' },
]

function renderProfile(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/ucitel/:id" element={<TeacherProfilePage sections={SECTIONS} />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

test('ukáže jméno učitele a sekci featury s jeho id', async () => {
  renderProfile('/ucitel/2')

  expect(await screen.findByRole('heading', { name: 'Petr Svoboda' })).toBeDefined()
  expect(screen.getByRole('heading', { name: 'Hotová sekce' })).toBeDefined()
  expect(screen.getByText('Obsah sekce pro učitele 2')).toBeDefined()
})

test('sekce bez komponenty má v profilu místo', async () => {
  renderProfile('/ucitel/2')

  expect(await screen.findByRole('heading', { name: 'Prázdná sekce' })).toBeDefined()
  expect(screen.getByText('Tuhle sekci zatím nikdo neudělal.')).toBeDefined()
})

test('neexistující učitel', async () => {
  renderProfile('/ucitel/999')

  expect(await screen.findByText('Učitel nenalezen')).toBeDefined()
})

test('adresa bez čísla', async () => {
  renderProfile('/ucitel/abc')

  expect(await screen.findByText('Učitel nenalezen')).toBeDefined()
})
