# OpenAPI schéma

Sem backend commituje `openapi.json` vyexportovaný z `src/TeacherControl.Api`.

Frontend si z něj generuje typy: `cd src/front-app && pnpm gen:api`.

**Stav:** `openapi.json` je zatím **placeholder** vytvořený při bootstrapu frontendu (obsahuje jen
endpointy `/ratings` pro referenční featuru). Jakmile backend dodá reálný export, tenhle soubor se
přepíše a frontend spustí `pnpm gen:api` znovu.
