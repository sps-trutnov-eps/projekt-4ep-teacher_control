# OpenAPI schéma

Sem backend commituje `TeacherControl.Api.json` vyexportovaný z `src/TeacherControl.Api`.

Frontend si z něj generuje typy: `cd src/TeacherControl.web && pnpm gen:api`.

**Stav:** popsané endpointy jsou zatím nekompletní a budou se ještě měnit. Featury, jejichž
endpoint ve schématu ještě není, ho mockují přes MSW a tvar odpovědi si drží ve svém `types.ts`.
Jakmile endpoint v exportu přibude, stačí spustit `pnpm gen:api`.
