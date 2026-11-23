import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { AuthContext, MockAuthProvider, type AuthContextValue } from '@/shared/auth'
import { theme } from '@/shared/theme'
import { App } from './App'

const ANONYMOUS: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  roles: [],
  hasRole: () => false,
  login: async () => {},
  logout: async () => {},
}

function AnonymousAuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext value={ANONYMOUS}>{children}</AuthContext>
}

function renderApp(path: string, Auth: (props: { children: ReactNode }) => ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Auth>
          <MemoryRouter initialEntries={[path]}>
            <App />
          </MemoryRouter>
        </Auth>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

test('nepřihlášený skončí z domovské stránky na přihlášení a navigaci nevidí', async () => {
  renderApp('/', AnonymousAuthProvider)

  expect(await screen.findByRole('heading', { name: 'Přihlášení' })).toBeDefined()
  expect(screen.queryByRole('link', { name: 'Recenze' })).toBeNull()
})

test('nepřihlášený se nedostane ani na profil učitele', async () => {
  renderApp('/ucitel/1', AnonymousAuthProvider)

  expect(await screen.findByRole('heading', { name: 'Přihlášení' })).toBeDefined()
  expect(screen.queryByText('Jana Nováková')).toBeNull()
})

test('nepřihlášený vidí registraci', async () => {
  renderApp('/register', AnonymousAuthProvider)

  expect(await screen.findByRole('heading', { name: /Registrace/ })).toBeDefined()
})

test('přihlášený vidí domovskou stránku s učiteli a navigaci s názvy featur', async () => {
  renderApp('/', MockAuthProvider)

  expect(await screen.findByRole('link', { name: /Jana Nováková/ })).toBeDefined()
  expect(screen.getByRole('link', { name: 'Domů' })).toBeDefined()
  expect(screen.getByRole('link', { name: 'Pololetní hlasování' })).toBeDefined()
  expect(screen.queryByRole('link', { name: 'Vzor' })).toBeNull()
})

test('neznámá adresa vede přihlášeného na domovskou stránku', async () => {
  renderApp('/tohle-neexistuje', MockAuthProvider)

  expect(await screen.findByRole('heading', { name: 'Učitelé' })).toBeDefined()
})
