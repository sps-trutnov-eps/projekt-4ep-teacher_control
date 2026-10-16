# F6 Login & Registrace

Vlastník: _Jiruš_

Tvar kódu zkopíruj z `features/rating`. Pravidla jsou v `AGENTS.md`. Routa: `/login` (případně `/register` nebo přepínání v rámci auth featury).

Pozor: dokud tahle featura není hotová, jede celá aplikace na mocku v `src/shared/auth`.
Až bude hotová, vymění se jen implementace providera — veřejné API `useAuth()` musí zůstat stejné,
aby se kvůli tomu nemusely měnit ostatní featury.

---

## Změna plánu (místo školního Active Directory)

Školní Active Directory (AD) **nebude k dispozici**. Místo toho používáme vlastní přihlašování a registraci přes **školní e-mail (`@spstrutnov.cz`) s potvrzovacím kódem zaslaným na e-mail**.

---

## Co je potřeba naimplementovat (TODO pro frontend)

### 1. Registrační stránka + potvrzení e-mailu
Vytvořit novou registrační stránku (oddělenou od přihlašovací stránky, s možností přecházet mezi přihlášením a registrací), která má **2 kroky**:

#### Krok 1: Zadání registračních údajů
- Formulář (React Hook Form + Zod v `schema.ts`):
  - **Školní e-mail**: povinný, validní e-mail, **musí končit doménou `@spstrutnov.cz`** (např. `jmeno.prijmeni@spstrutnov.cz`).
  - **Heslo** (a případně potvrzení hesla): dle požadavků backendu.
- Po odeslání se zavolá API endpoint pro registraci / zaslání potvrzovacího kódu na zadaný e-mail a UI přejde na **Krok 2**.
- Odkaz pro přechod na přihlašovací stránku („Už máš účet? Přihlas se“).

#### Krok 2: Potvrzení kódu z e-mailu (uvnitř registrační stránky)
- Zobrazí informaci, na jaký e-mail byl kód odeslán.
- Pole pro zadání **potvrzovacího kódu** z e-mailu (validace přes Zod).
- Po odeslání a ověření kódu na backendu se účet aktivuje/vytvoří a uživatel je přesměrován (na přihlášení nebo rovnou přihlášen na `/`).
- **Znovu odeslat kód (Resend)**:
  - Tlačítko pro opětovné zaslání potvrzovacího kódu.
  - **Cooldown 30 sekund** (odpočet, během kterého je tlačítko zablokované, např. „Znovu odeslat za 30 s“).
- **Změna e-mailu (Zpět)**:
  - Tlačítko / akce „Změnit e-mail“ (návrat zpět na Krok 1 se zachováním nebo možností upravit zadanou e-mailovou adresu).

---

### 2. Úprava přihlašovací stránky (`LoginPage.tsx`)
- Upravit přihlašovací formulář z původního AD `username` (`jmeno.prijmeni`) na **školní e-mail (`@spstrutnov.cz`) + heslo**.
- Přidat odkaz / tlačítko pro přechod na registrační stránku („Nemáš účet? Zaregistruj se“).
- Napojit odeslání formuláře na reálné přihlášení místo prázdného mock `login()`.

---

### 3. Povinná struktura souborů podle `AGENTS.md`
Ve složce `src/features/auth/` musí být dodržena standardní struktura podle referenční featury `src/features/rating`:
- [ ] `schema.ts` — Zod schémata (`loginSchema`, `registerSchema` s kontrolou `@spstrutnov.cz`, `confirmCodeSchema`) a odvozené typy přes `z.infer`.
- [ ] `api.ts` — TanStack Query hooky (`useMutation` / `useQuery`) volající `api` ze `@/shared/api` (přihlášení, odhlášení, registrace, potvrzení kódu, opětovné zaslání kódu, načtení aktuálního uživatele `/api/auth/me`).
- [ ] `mocks.ts` — MSW handlery pro auth endpointy (a jejich registrace v `src/mocks/handlers/index.ts`), aby šel celý flow testovat i bez běžícího backendu.
- [ ] `LoginPage.tsx` a komponenty/stránka pro registraci (`RegisterPage.tsx` nebo komponenty v `components/`).
- [ ] `index.ts` — pojmenované exporty veřejných částí featury.
- [ ] Zapojení případné nové routy v `src/routes/index.tsx`.

> **Připomenutí pravidel z `AGENTS.md`:**
> - Používat výhradně **Mantine** komponenty (např. `TextInput`, `PasswordInput`, `PinInput`, `Button`, `Card`, `Stack`, `Alert`).
> - Žádné `fetch()` mimo `@/shared/api`, žádné `useEffect` pro fetchování dat, žádné `any` ani default exporty.
> - Před PR musí projít `pnpm lint && pnpm typecheck && pnpm build`.

