import createClient from 'openapi-fetch'
import type { paths } from './generated/schema'

/**
 * Jediný HTTP klient v aplikaci. Typy endpointů jsou generované z OpenAPI (`pnpm gen:api`).
 * Ve featurách se nevolá přímo, ale přes TanStack Query v `features/<featura>/api.ts`.
 */
export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
})
