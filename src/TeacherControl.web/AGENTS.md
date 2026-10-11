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

Soubory v `src/shared/api/generated/` **needituj ručně**, přepíše je další generování.

### Kdy přegenerovat typy z OpenAPI

1. <ins>Backend generuje schéma</ins> automaticky při buildu. Když backendista přidá endpoint a projekt
   zbuildí, aktualizuje se soubor `docs/api/TeacherControl.Api.json`. Ten je potřeba commitnout.
2. Frontend z tohoto JSONu generuje TypeScriptové typy. `pnpm gen:api` přečte `TeacherControl.Api.json`
   a podle něj aktualizuje `src/shared/api/generated/schema.d.ts`. I tento soubor se commituje.
3. `pnpm gen:api` je proto potřeba spustit po každé změně schématu na backendu. Automaticky to nic
   nehlídá. Spouští ho frontendový tým featury, který nový endpoint potřebuje, a to ve svém PR.

Když dva týmy změní schéma zároveň, vzniknou konflikty v `docs/api/TeacherControl.Api.json`
a v `schema.d.ts`. Mergni si aktuální `main`, konflikt v JSONu vyřeš normálně a `schema.d.ts` ručně
neřeš: až je JSON vyřešený, spusť `pnpm gen:api` znovu.

### Jak volat routy

Endpointy, které už backend implementoval, se volají přes `api.GET()`, stejně tak `api.POST()` atd.:

```ts
api.GET('/api/<featura>/{parametr}', { params: { path: { parametr } } })
```

Když napíšeš špatnou cestu, spadne `pnpm typecheck`. Vzor je v `features/abstence/api.ts`.

Pokud endpoint ještě není implementovaný, použij `fetchJson<Typ>('/vzor-items')`, tedy **bez** `/api`,
to přidá sama funkce. Typ odpovědi si každý tým píše ručně do `types.ts` své featury. Je to jediná
výjimka z „typy se nepíšou ručně“. Vzor je ve vzorové featuře, `features/vzor/api.ts`.

Volání vždy přes TanStack Query v `api.ts` své featury, nikdy přímo v komponentě.
Query key konvence: `[featura, typ, ...parametry]`, třeba `['vzor', 'list']`.
Po mutaci invaliduj query key featury.

### Kdy nahradit mock skutečným endpointem

Zaprvé, mocky jsou ve vývoji výchozí stav. Vypínají se v `.env.local` přes `VITE_USE_MOCKS=false`.

Zadruhé, až bude endpoint hotový na backendu:

1. spusť `pnpm gen:api`,
2. přepiš `fetchJson()` na `api.GET()` (případně `api.POST()` atd.) a ruční typ z `types.ts` zahoď,
3. vypni mocky v `.env.local` a otestuj to proti skutečnému backendu.

**Mock nemaž**, je potřeba pro testy.

Když endpoint na backendu ještě není, přidej MSW handler do `mocks.ts` své featury a zapoj ho
v `src/mocks/handlers/index.ts` importem `@/features/<featura>/mocks`.

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

## Testy

Vitest + Testing Library, data z tvých MSW handlerů (`src/mocks/server.ts` je pouští v Node).
Vzor je `features/vzor/VzorPage.test.tsx` — zkopíruj z něj `renderPage()` s providery a piš
testy proti tomu, co uživatel vidí (`findByText`, `findByRole`), ne proti vnitřnostem komponent.

Aspoň jeden test na featuru. Nehoň se za pokrytím.

## Před PR

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Musí projít všechno. Jeden PR = jedna featura. Neupravuj při tom konfiguraci ani cizí featury.
