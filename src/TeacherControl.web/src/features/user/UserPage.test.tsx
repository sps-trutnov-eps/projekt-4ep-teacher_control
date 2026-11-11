import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue, type User } from '@/shared/auth'
import { UserPage } from './UserPage'

function renderPage(authOverride?: Partial<AuthContextValue>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  const defaultUser: User = {
    id: 'u-test',
    displayName: 'Testovací Uživatel',
    email: 'test.uzivatel@spstrutnov.cz',
    roles: ['student'],
  }

  const authValue: AuthContextValue = {
    user: defaultUser,
    isAuthenticated: true,
    roles: ['student'],
    hasRole: (role) => role === 'student',
    login: async () => {},
    logout: async () => {},
    ...authOverride,
  }

  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext value={authValue}>
          <MemoryRouter initialEntries={['/user']}>
            <UserPage />
          </MemoryRouter>
        </AuthContext>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('UserPage', () => {
  it('zobrazuje jméno a e-mail přihlášeného uživatele', () => {
    renderPage()

    expect(screen.getAllByText('Testovací Uživatel').length).toBeGreaterThan(0)
    expect(screen.getAllByText('test.uzivatel@spstrutnov.cz').length).toBeGreaterThan(0)
    expect(screen.getByText('Student')).toBeDefined()
    expect(screen.getByText('u-test')).toBeDefined()
  })

  it('vygeneruje školní e-mail i v případě, že uživatel nemá e-mail explicitně nastavený', () => {
    const userWithoutEmail: User = {
      id: 'u-fallback',
      displayName: 'Jan Svoboda',
      roles: ['teacher'],
    }

    renderPage({
      user: userWithoutEmail,
      isAuthenticated: true,
      roles: ['teacher'],
      hasRole: (r) => r === 'teacher',
    })

    expect(screen.getAllByText('Jan Svoboda').length).toBeGreaterThan(0)
    expect(screen.getAllByText('jan.svoboda@spstrutnov.cz').length).toBeGreaterThan(0)
    expect(screen.getByText('Učitel')).toBeDefined()
  })

  it('zobrazí upozornění a odkaz na přihlášení pro nepřihlášeného uživatele', () => {
    renderPage({
      user: null,
      isAuthenticated: false,
      roles: [],
      hasRole: () => false,
    })

    expect(screen.getByText('Nepřihlášený uživatel')).toBeDefined()
    expect(screen.getByText('Přejít na přihlášení')).toBeDefined()
  })

  it('zavolá funkci logout při kliknutí na tlačítko Odhlásit se', async () => {
    let loggedOut = false
    renderPage({
      logout: async () => {
        loggedOut = true
      },
    })

    const logoutButton = screen.getByRole('button', { name: 'Odhlásit se' })
    await act(async () => {
      fireEvent.click(logoutButton)
    })

    expect(loggedOut).toBe(true)
  })
})
