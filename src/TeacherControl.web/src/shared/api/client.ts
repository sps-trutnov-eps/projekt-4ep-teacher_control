import createClient from 'openapi-fetch'
import type { paths } from './generated/schema'

const baseUrl: string = import.meta.env.VITE_API_BASE_URL ?? '/api'

/**
 * Jediný HTTP klient v aplikaci. Typy endpointů jsou generované z OpenAPI (`pnpm gen:api`).
 * Ve featurách se nevolá přímo, ale přes TanStack Query v `features/<featura>/api.ts`.
 */
export const api = createClient<paths>({ baseUrl })

/**
 * Dočasná náhrada pro endpoint, který v OpenAPI ještě není — `api` umí volat jen to, co je
 * ve schématu, a backend zatím většinu endpointů nedodal. Tvar odpovědi si featura popíše
 * ve svém `types.ts`. Jakmile endpoint v OpenAPI přibude, přepiš volání na `api` a typ zahoď.
 */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${path} skončilo ${response.status}.`)
  }

  return (await response.json()) as T
}
