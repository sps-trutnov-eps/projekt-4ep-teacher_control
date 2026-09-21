import { HttpResponse, http } from 'msw'
import type { VzorItem } from './types'

let items: VzorItem[] = [
  {
    id: 'v-1',
    title: 'První položka',
    note: 'Takhle vypadá řádek ze seznamu.',
    authorName: 'Učitel Svoboda',
    createdAt: '2026-09-01T10:15:00.000Z',
  },
]

/** MSW handlery featury. Přidávej sem endpointy, které backend ještě nemá hotové. */
export const vzorHandlers = [
  http.get('/api/vzor-items', () => HttpResponse.json(items)),

  http.post('/api/vzor-items', async ({ request }) => {
    const body = (await request.json()) as { title: string; note?: string }

    const created: VzorItem = {
      id: crypto.randomUUID(),
      title: body.title,
      note: body.note || null,
      authorName: 'Přihlášený uživatel',
      createdAt: new Date().toISOString(),
    }

    items = [...items, created]

    return HttpResponse.json(created, { status: 201 })
  }),
]
