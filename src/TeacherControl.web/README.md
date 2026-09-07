# Teacher Control — frontend

## Stack

- **React 19 + TypeScript + Vite** — základ
- **Mantine** — hotové UI komponenty, vlastní CSS nepíšeme
- **TanStack Query** — načítání dat z API, žádný `useEffect` na fetch
- **React Hook Form + Zod** — formuláře a validace
- **MSW** — mockuje endpointy, které backend ještě nemá

## Rozjetí

```bash
pnpm install
pnpm dev
```

Nic dalšího nastavovat nemusíš, mocky se ve vývoji zapnou samy. Běží to na http://localhost:5173.

Před každým PR musí projít:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## Pět pravidel

1. **`AGENTS.md` si tvůj AI agent načte sám** — jsou tam všechna pravidla, nemusíš mu je opisovat.
2. **Sahej jen do své featury** (`src/features/<tvoje>/`). Do `shared/` a do konfigurace ne.
3. **Tvar kódu kopíruj z `src/features/rating`** — je to hotová referenční featura.
4. **Typy pro API se nepíšou ručně**, generují se z OpenAPI přes `pnpm gen:api`.
5. **Uživatele ber jen přes `useAuth()`**, vlastní přihlášení nikdo nepíše — dělá se to ve featuře F6.

Chybí endpoint? Zamockuj si ho v `mocks.ts` své featury, ať nečekáš na backend.

## Kde se ptát

Cokoli kolem frontendu, knihoven a `shared/` → **Karel** (frontend master).
Backend a OpenAPI schéma → **Egmont**. Git, větve a CI → **Souček**. Design → **Niky**.
