import createClient from 'openapi-fetch'
import type { paths } from './generated/schema'

// Cesty v OpenAPI už začínají na /api, proto je tady jen adresa backendu (v dev prázdná, jde přes proxy).
const apiUrl: string = import.meta.env.VITE_API_URL ?? ''

/**
 * Jediný HTTP klient v aplikaci. Typy endpointů jsou generované z OpenAPI (`pnpm gen:api`).
 * Ve featurách se nevolá přímo, ale přes TanStack Query v `features/<featura>/api.ts`.
 */
// fetch se předává obalený, aby se bral až při volání. Jinak by ho MSW v testech nezachytil.
export const api = createClient<paths>({ baseUrl: apiUrl, fetch: (request) => fetch(request) })

/**
 * Dočasná náhrada pro endpoint, který v OpenAPI ještě není — `api` umí volat jen to, co je
 * ve schématu, a backend zatím většinu endpointů nedodal. Tvar odpovědi si featura popíše
 * ve svém `types.ts`. Jakmile endpoint v OpenAPI přibude, přepiš volání na `api` a typ zahoď.
 */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${path} skončilo ${response.status}.`)
  }

  return (await response.json()) as T
}
