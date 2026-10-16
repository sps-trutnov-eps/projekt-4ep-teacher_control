# shared/api

- `generated/schema.d.ts` je generovaný soubor, **needituj ho ručně**. Regeneruje se přes `pnpm gen:api`
  z `/docs/api/TeacherControl.Api.json`.
- `client.ts` je jediné místo v aplikaci, kde se smí volat síť. Ve featurách se používá `api` z tohohle
  balíčku uvnitř TanStack Query hooků v `api.ts` featury.
- Export z backendu je zatím prázdný (`"paths": { }`), takže `api` nemá co volat. Dokud tvůj endpoint
  ve schématu není, použij `fetchJson()` a tvar odpovědi si popiš v `types.ts` své featury — viz
  `features/vzor`.
