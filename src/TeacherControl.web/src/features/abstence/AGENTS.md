# AGENTS.md

Pravidla pro tento repozitář. Platí pro AI agenty i pro lidi.
Pokud si nejsi jistý, kopíruj tvar existujícího kódu ve `src/features/rating/` a `src/shared/`.

---

## Stack

Tohle je dané. Neměň to a nenavrhuj alternativy.

| Oblast | Co používáme |
|---|---|
| Jazyk | TypeScript, `strict: true` |
| Framework | React 19 (function components + hooks) |
| Build | Vite |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Formuláře | React Hook Form + Zod |
| UI komponenty | Mantine |
| HTTP | generovaný klient v `src/shared/api` |
| Package manager | pnpm |

Verze Node je v `.nvmrc`.

## Zakázané

- `any`, `as any`, `@ts-ignore`, `@ts-expect-error` bez komentáře s důvodem
- `fetch()` nebo `axios` kdekoli mimo `src/shared/api`
- ruční psaní typů pro API odpovědi (viz sekce API)
- `useEffect` na načítání dat (od toho je TanStack Query)
- vlastní CSS framework, vlastní design systém, vlastní komponenty tam, kde Mantine něco má
- Redux, MobX, Recoil, Jotai a další state managery
- třídové komponenty
- instalace nové npm závislosti bez schválení frontend mastera
- import z jiné featury (`src/features/X` nesmí importovat z `src/features/Y`)

Sdílené věci patří do `src/shared/`. Pokud tam něco chybí, **nepřidávej to sám** — napiš frontend masterovi (Karel). Jinak tam skončí čtyři varianty téhož.

## Struktura

```
src/
  features/
    bingo/        F1
    rating/       F2
    hodnoceni/    F3
    absence/      F4
    hlasovani/    F5
    auth/         F6  (jen frontend master)
  shared/
    api/          generovaný klient + wrapper
    auth/         useAuth(), guardy
    ui/           sdílené komponenty
    lib/          utils, formátování dat
  routes/         definice rout
  App.tsx
```

Uvnitř featury:

```
features/absence/
  components/
  hooks/
  api.ts          query/mutation hooky pro tuhle featuru
  types.ts        jen lokální typy, ne API typy
  index.ts        veřejné exporty featury
```

Pracuj **jen ve složce své featury**. Soubory mimo ni neměň.

## API

Backend je ASP.NET Core a vystavuje OpenAPI schéma. Klient se z něj generuje:

```bash
pnpm gen:api
```

Vygenerované soubory v `src/shared/api/generated/` **needituj ručně**, přepíše je to.

Volání vždy přes TanStack Query, nikdy přímo v komponentě:

```ts
// features/absence/api.ts
export function useAbsence(zakId: string) {
  return useQuery({
    queryKey: ['absence', 'detail', zakId],
    queryFn: () => api.GET('/api/absence/{id}', { params: { path: { id: zakId } } }),
  })
}
```

Query key konvence: `[featura, typ, ...parametry]`, například `['hodnoceni', 'list', { predmet }]`.

Dokud backend endpoint neexistuje, používej MSW mock v `src/mocks/handlers/`. Nevymýšlej si dočasné fake funkce v komponentě.

## Auth (důležité)

F6 Login se napojuje na školní systém a bude hotový až později. **Do té doby nikdo nepíše vlastní řešení přihlášení.**

Používej výhradně:

```ts
const { user, roles, isAuthenticated } = useAuth()  // z src/shared/auth
```

Zatím to obsluhuje `MockAuthProvider`, který bere uživatele z dev přepínače. Až bude F6 hotová, vymění se implementace pod `useAuth()` a nic dalšího se měnit nebude. Proto:

- žádné čtení tokenu z localStorage ve featurách
- žádné vlastní `AuthContext`
- žádné volání login endpointu mimo `src/features/auth`
- kontrola oprávnění vždy přes `roles`, ne přes hardcoded jméno uživatele

## Formuláře

React Hook Form + Zod schéma. Schéma je zdroj pravdy pro validaci i typ:

```ts
const schema = z.object({
  datum: z.string().date(),
  duvod: z.string().min(3),
})
type FormValues = z.infer<typeof schema>
```

Nepiš vlastní validační logiku mimo Zod.

## Konvence

- **kód, názvy proměnných a komponent anglicky**, texty pro uživatele česky
- komponenty `PascalCase.tsx`, ostatní soubory `camelCase.ts`
- žádné default exporty kromě stránek v `routes/`
- komentáře jen tam, kde kód není zřejmý; negeneruj komentáře typu `// set the state`

## Než pošleš PR

Musí projít:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

CI to stejně zkontroluje. PR, který neprojde, se nemerguje.

Jeden PR = jedna featura nebo jedna oprava. Neupravuj při tom mimochodem konfiguraci, `package.json` ani cizí featury.
