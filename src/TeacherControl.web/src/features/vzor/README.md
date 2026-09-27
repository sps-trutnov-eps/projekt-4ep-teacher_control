# Vzor (referenční featura)

Vlastník: _Karel_ (frontend master)

Není to featura projektu, je to ukázka. **Kopíruj tvar, ne obsah.** Pravidla jsou v `AGENTS.md`,
routa: `/vzor`.

Co kde najdeš:

| Soubor | Co ukazuje |
| --- | --- |
| `types.ts` | tvar odpovědi, dokud endpoint není v OpenAPI |
| `schema.ts` | validace přes Zod, typ formuláře přes `z.infer` |
| `api.ts` | TanStack Query, query key `['vzor', 'list']`, invalidace po mutaci |
| `mocks.ts` | MSW handlery za backend, který endpoint ještě nemá |
| `components/VzorList.tsx` | loading a error stav |
| `components/VzorForm.tsx` | React Hook Form + Zod + notifikace |
| `VzorPage.tsx` | `hasRole()` na část stránky |
| `index.ts` | jediné, co featura pouští ven — `mocks.ts` sem nepatří |
| `VzorPage.test.tsx` | test se stejnými providery jako appka, data z MSW |

Endpoint `/vzor-items` neexistuje, běží jen na MSW. Proto volá `fetchJson()` a typ má v `types.ts`.
Až tvůj endpoint bude v `docs/api/TeacherControl.Api.json`, spusť `pnpm gen:api`, volej `api.GET()`
a `types.ts` zahoď.
