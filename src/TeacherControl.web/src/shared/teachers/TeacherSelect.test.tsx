import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { expect, test, vi } from 'vitest'
import { server } from '@/mocks/server'
import { theme } from '@/shared/theme'
import { TeacherSelect } from './TeacherSelect'

function renderSelect(onChange: (teacherId: number | null) => void) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <TeacherSelect value={null} onChange={onChange} />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

test('nabídne učitele podle abecedy a vrátí id vybraného', async () => {
  const onChange = vi.fn()
  renderSelect(onChange)

  const options = await screen.findAllByRole('option', { hidden: true })
  // Každá možnost začíná iniciálami z avataru, proto se porovnává jen pořadí jmen.
  expect(options.map((option) => option.textContent).join(' ')).toMatch(
    /Eva Dvořáková.*Jana Nováková.*Martin Černý.*Petr Svoboda/,
  )

  fireEvent.click(screen.getByRole('option', { name: /Petr Svoboda/, hidden: true }))

  expect(onChange).toHaveBeenCalledWith(2)
})

test('když se seznam nenačte, řekne to', async () => {
  server.use(http.get('*/api/pololeti/teachers', () => new HttpResponse(null, { status: 500 })))
  renderSelect(vi.fn())

  expect(await screen.findByText('Seznam učitelů se nepodařilo načíst.')).toBeDefined()
})
