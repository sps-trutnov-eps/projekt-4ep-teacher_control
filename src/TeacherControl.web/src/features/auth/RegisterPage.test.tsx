import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage'

// Mock useAuth
const mockLogin = vi.fn().mockResolvedValue(undefined)
vi.mock('@/shared/auth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: mockLogin,
    logout: vi.fn(),
    hasRole: () => true,
    user: null,
    roles: [],
  }),
}))

// Mock api
const mockApiPost = vi.fn()
vi.mock('@/shared/api', () => ({
  api: {
    POST: (...args: unknown[]) => mockApiPost(...args),
    GET: vi.fn(),
  },
}))

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('RegisterPage flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: function () {},
          removeListener: function () {},
          addEventListener: function () {},
          removeEventListener: function () {},
          dispatchEvent: function () {
            return false
          },
        }
      }
  })

  it('renders Step 1 initially and displays registration inputs', () => {
    renderComponent()

    expect(screen.getByRole('heading', { name: /registrace/i })).toBeDefined()
    expect(screen.getByText(/krok 1 ze 2/i)).toBeDefined()
    expect(screen.getByLabelText(/školní e-mail/i)).toBeDefined()
    expect(screen.getByLabelText(/^heslo/i)).toBeDefined()
    expect(screen.getByLabelText(/potvrzení hesla/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /pokračovat na potvrzení/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /přihlas se/i })).toBeDefined()
  })

  it('progresses to Step 2 after valid credential submission', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: { message: 'OK', email: 'jan.novak@spstrutnov.cz' },
      error: undefined,
    })

    renderComponent()

    fireEvent.change(screen.getByLabelText(/školní e-mail/i), {
      target: { value: 'jan.novak@spstrutnov.cz' },
    })
    fireEvent.change(screen.getByLabelText(/^heslo/i), {
      target: { value: 'SecurePass123!' },
    })
    fireEvent.change(screen.getByLabelText(/potvrzení hesla/i), {
      target: { value: 'SecurePass123!' },
    })

    fireEvent.click(screen.getByRole('button', { name: /pokračovat na potvrzení/i }))

    await waitFor(() => {
      expect(screen.getByText(/krok 2 ze 2/i)).toBeDefined()
    })

    expect(screen.getByText('jan.novak@spstrutnov.cz')).toBeDefined()
    expect(screen.getByRole('button', { name: /změnit e-mail/i })).toBeDefined()
  })

  it('allows returning back to Step 1 and preserves entered email', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: { message: 'OK', email: 'jan.novak@spstrutnov.cz' },
      error: undefined,
    })

    renderComponent()

    fireEvent.change(screen.getByLabelText(/školní e-mail/i), {
      target: { value: 'jan.novak@spstrutnov.cz' },
    })
    fireEvent.change(screen.getByLabelText(/^heslo/i), {
      target: { value: 'SecurePass123!' },
    })
    fireEvent.change(screen.getByLabelText(/potvrzení hesla/i), {
      target: { value: 'SecurePass123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /pokračovat na potvrzení/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /změnit e-mail/i })).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /změnit e-mail/i }))

    await waitFor(() => {
      expect(screen.getByText(/krok 1 ze 2/i)).toBeDefined()
    })

    const emailInput = screen.getByLabelText(/školní e-mail/i) as HTMLInputElement
    expect(emailInput.value).toBe('jan.novak@spstrutnov.cz')
  })

  it('completes registration when confirmation code is submitted', async () => {
    mockApiPost
      .mockResolvedValueOnce({
        data: { message: 'OK', email: 'jan.novak@spstrutnov.cz' },
        error: undefined,
      })
      .mockResolvedValueOnce({
        data: {
          message: 'Confirmed',
          user: { id: 'u1', displayName: 'Jan Novak', roles: ['student'] },
        },
        error: undefined,
      })

    renderComponent()

    fireEvent.change(screen.getByLabelText(/školní e-mail/i), {
      target: { value: 'jan.novak@spstrutnov.cz' },
    })
    fireEvent.change(screen.getByLabelText(/^heslo/i), {
      target: { value: 'SecurePass123!' },
    })
    fireEvent.change(screen.getByLabelText(/potvrzení hesla/i), {
      target: { value: 'SecurePass123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /pokračovat na potvrzení/i }))

    await waitFor(() => {
      expect(screen.getByText(/krok 2 ze 2/i)).toBeDefined()
    })

    const pinInputs = document.querySelectorAll('input')
    const firstPinInput = pinInputs[0]
    if (firstPinInput) {
      fireEvent.change(firstPinInput, { target: { value: '123456' } })
    }

    fireEvent.click(screen.getByRole('button', { name: /potvrdit a dokončit registraci/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })
})
