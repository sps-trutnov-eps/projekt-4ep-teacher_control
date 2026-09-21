# OpenAPI schéma

Sem backend commituje `TeacherControl.Api.json` vyexportovaný z `src/TeacherControl.Api`.

Frontend si z něj generuje typy: `cd src/TeacherControl.web && pnpm gen:api`.

**Stav:** export je reálný, ale zatím prázdný — `"paths": { }`. Placeholder s `/ratings` z bootstrapu
frontendu je pryč. Dokud backend endpointy nedodá, frontend je mockuje přes MSW a tvar odpovědi si
featura drží ve svém `types.ts`. Jakmile v exportu endpointy přibudou, stačí spustit `pnpm gen:api`.
