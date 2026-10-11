import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './src/mocks/server'

// jsdom neumí matchMedia a Mantine ho potřebuje. Bez tohohle spadne každý test s UI.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
