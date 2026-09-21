# AGENTS.md — frontend

Pravidla pro práci v `src/TeacherControl.web`. Čti je celé, než něco změníš.

## Stack

Dané, neměň a nenavrhuj alternativy: TypeScript (strict), React 19, Vite, React Router v8,
TanStack Query v5, React Hook Form + Zod, Mantine, openapi-fetch, pnpm. Verze Node je v `.nvmrc`.

## Pracuj jen ve své featuře

Tvoje území je `src/features/<tvoje-featura>/`. Nesahej na cizí featury, na `src/shared/`, na
konfiguraci ani na `src/routes/` — jedinou výjimkou je jeden řádek v `src/routes/index.tsx`, kde
svoji stránku zapojíš do routingu.

Povinné soubory ve featuře: `api.ts`, `mocks.ts`, `index.ts`, `<Něco>Page.tsx`.
Volitelné, až budou potřeba: `components/`, `hooks/`, `types.ts`, `schema.ts`.

**Tvar kódu kopíruj z `src/features/vzor`.** Je to referenční featura, která ukazuje všechny
konvence najednou. Kopíruj tvar, ne obsah.

## Zakázané (většinu z toho shodí `pnpm lint`)

- `any`, `as any`, `@ts-ignore` bez komentáře s důvodem
- `fetch()` nebo axios mimo `src/shared/api`
- import z jiné featury
- import z `react-router-dom` — ten balíček ve v8 zanikl, importuje se z `react-router`
- ruční psaní typů pro API odpovědi, generují se z OpenAPI
- `useEffect` na načítání dat, od toho je TanStack Query
- vlastní CSS framework nebo vlastní komponenta tam, kde Mantine něco má
- Redux, Zustand, Jotai a další state managery
- třídové komponenty
- nová npm závislost bez schválení frontend mastera

Když ve `shared/` něco chybí, nepřidávej to sám, napiš frontend masterovi.

## API

Klient se generuje z OpenAPI přes `pnpm gen:api`. Soubory v `src/shared/api/generated/` **needituj
ručně**, přepíše je další generování.

Backend zatím většinu endpointů nedodal, takže je ve schématu nenajdeš. Dokud tam ten tvůj není,
volej `fetchJson()` ze `src/shared/api` a tvar odpovědi si popiš ve svém `types.ts`. Je to jediná
výjimka z „typy se nepíšou ručně" a platí jen do chvíle, než endpoint v OpenAPI přibude — pak
`pnpm gen:api`, přepiš volání na `api.GET()` a ruční typ zahoď.

Volání vždy přes TanStack Query v `api.ts` své featury, nikdy přímo v komponentě.
Query key konvence: `[featura, typ, ...parametry]`, třeba `['vzor', 'list']`.
Po mutaci invaliduj query key featury.

Když endpoint na backendu ještě není, přidej MSW handler do `mocks.ts` své featury a zapoj ho
v `src/mocks/handlers/index.ts` importem `@/features/<featura>/mocks`. Ve vývoji jedou mocky
defaultně.

`mocks.ts` **nikdy nereexportuj z `index.ts` své featury.** Barrel se táhne do produkčního bundlu
a přitáhl by si s sebou celé `msw`. Hlídá to `pnpm lint`.

## Auth

Featura F6 Login bude hotová později. Do té doby **nikdo nepíše vlastní přihlášení.**

Používej výhradně `useAuth()` ze `src/shared/auth`. Žádné čtení tokenu ve featurách, žádný vlastní
AuthContext. Oprávnění řeš přes `hasRole('student' | 'teacher' | 'admin')`, nikdy přes jméno
uživatele.

Co na co:

- `RequireAuth` — celá appka, je už v `App.tsx`, znovu ji nebalíš.
- `RequireRole` — celá stránka jen pro jednu roli, obal jí obsah své `<Něco>Page.tsx`.
- `hasRole()` — jen část stránky (tlačítko, formulář). Když něco schováš, napiš uživateli proč,
  viz `VzorPage.tsx`.

## Formuláře

React Hook Form + Zod, typ odvozený přes `z.infer`. Validační logika patří jen do Zod schématu,
ne do komponenty.

## Konvence

Kód a názvy anglicky, texty pro uživatele česky. Komponenty `PascalCase.tsx`, ostatní `camelCase.ts`.
Žádné default exporty, všechno pojmenovaně. Nepiš komentáře k samozřejmostem.

## Před PR

```bash
pnpm lint && pnpm typecheck && pnpm build
```

Musí projít všechno. Jeden PR = jedna featura. Neupravuj při tom konfiguraci ani cizí featury.
