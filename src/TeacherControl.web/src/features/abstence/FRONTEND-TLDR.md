# Frontend TL;DR

Pro lidi. Detaily jsou v `AGENTS.md` v rootu repa, ten si čtou i agenti.

## Stack

**React 19 + TypeScript + Vite.** K tomu:

- **TanStack Query** na data z backendu
- **React Hook Form + Zod** na formuláře
- **Mantine** na komponenty (tabulky, modaly, datepickery, notifikace)
- **pnpm**

Vue ani nic jiného. Ne protože je horší, ale protože potřebujeme, aby šest týmů psalo podobný kód.

## Pět věcí, co si zapamatuj

1. **`AGENTS.md` je v repu, agenti si ho načtou sami.** Nemusíš do promptu kopírovat konvence. Ale přečti si ho, ať víš, co se od tebe čeká.

2. **Sahej jen do složky své featury.** `src/features/<tvoje-featura>/`. Do `shared/` se nepřidává bez domluvy, jinak tam skončí pět verzí toho samého tlačítka.

3. **Typy pro API nikdo nepíše.** Generují se z backendu: `pnpm gen:api`. Když backend změní model, praskne to při buildu, ne až v prosinci.

4. **Přihlášeného uživatele bereš z `useAuth()`.** Login (F6) se dělá na školní systém a bude až později, zatím to jede na mocku. Když si napíšeš vlastní řešení, budeš to přepisovat.

5. **Když endpoint ještě není hotový**, přidej si MSW mock. Nečekej na backend a nevymýšlej fake funkce přímo v komponentě.

## Workflow

```bash
pnpm install
pnpm dev

# před PR
pnpm lint && pnpm typecheck && pnpm build
```

CI to kontroluje. Co neprojde, nemerguju.

Nová npm závislost = napiš mi předem.

## Kdyby něco

Ptej se v kanálu #frontend. Když nevíš, jak něco udělat, koukni, jak je to udělané v jiné featuře, a udělej to stejně. Konzistence je tady důležitější než elegance.
