# shared/api

- `generated/schema.d.ts` je generovaný soubor, **needituj ho ručně**. Regeneruje se přes `pnpm gen:api`
  z `/docs/api/TeacherControl.Api.json`.
- `client.ts` je jediné místo v aplikaci, kde se smí volat síť. Ve featurách se používá `api` z tohohle
  balíčku uvnitř TanStack Query hooků v `api.ts` featury.
- `/docs/api/TeacherControl.Api.json` je zatím placeholder z bootstrapu. Jakmile backend dodá reálný export,
  spusť `pnpm gen:api` znovu.
