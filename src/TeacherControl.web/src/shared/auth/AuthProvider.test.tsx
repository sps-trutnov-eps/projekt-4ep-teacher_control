import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './AuthContext'

function TestConsumer() {
  const { user, isAuthenticated, logout, login } = useAuth()

  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'logged-in' : 'anonymous'}</span>
      <span data-testid="user-name">{user?.displayName ?? 'none'}</span>
      <button
        onClick={() => void login({ id: 'u-1', displayName: 'Petr Nový', roles: ['student'] })}
      >
        Login
      </button>
      <button onClick={() => void logout()}>Logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  it('initializes as unauthenticated when /api/auth/me returns 401', async () => {
    server.use(
      http.get('*/api/auth/me', () => {
        return new HttpResponse(null, { status: 401 })
      }),
    )

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('anonymous')
    })
    expect(screen.getByTestId('user-name').textContent).toBe('none')
  })

  it('restores authenticated user when /api/auth/me returns a user', async () => {
    server.use(
      http.get('*/api/auth/me', () => {
        return HttpResponse.json({
          id: 'u-42',
          displayName: 'Testovací Uživatel',
          roles: ['student'],
        })
      }),
    )

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('logged-in')
    })
    expect(screen.getByTestId('user-name').textContent).toBe('Testovací Uživatel')
  })

  it('clears session on logout', async () => {
    server.use(
      http.get('*/api/auth/me', () => {
        return HttpResponse.json({
          id: 'u-42',
          displayName: 'Testovací Uživatel',
          roles: ['student'],
        })
      }),
      http.post('*/api/auth/logout', () => {
        return HttpResponse.json({ success: true })
      }),
    )

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('logged-in')
    })

    screen.getByRole('button', { name: 'Logout' }).click()

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('anonymous')
    })
    expect(screen.getByTestId('user-name').textContent).toBe('none')
  })
})
