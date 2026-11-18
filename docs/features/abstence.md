# Feature: Abstence

## 1. UI Design a šablona stránky
- **Vlastník:** Novák
- **Popis funkcionality:** Vytvoření vizuálního rozvržení (HTML/CSS komponenty) pro přehled absencí učitelů, detail učitele a formulář pro nastavení zpoždění v souladu se styly celé aplikace.
- **Hotovo, když:** Stránka přesně odpovídá designovému systému projektu, je plně responzivní a připravená na napojení dynamických dat bez chyb v zobrazení.

## 2. Frontendová interaktivita a stav aplikace
- **Vlastník:** Blažík
- **Popis funkcionality:** Implementace interaktivních prvků na stránce – přepínání režimů zobrazení, rozklikávání detailu jednotlivých učitelů a klientská logika pro zadávání/změnu zpoždění.
- **Hotovo, když:** Uživatel může plynule přepínat zobrazení, po kliknutí na učitele se zobrazí jeho detail s historií a formulář pro zpoždění validuje a odesílá data na backend/do stavu aplikace.

## 3. Databázová vrstva a CRUD operace
- **Vlastník:** Hudeček
- **Popis funkcionality:** Návrh databázového schématu (tabulky pro absenci a náladu učitelů) a zprovoznění operací pro zápis a čtení těchto záznamů.
- **Hotovo, když:** Databázové schéma je vytvořené a je možné spolehlivě zapsat i načíst data o absenci a náladě učitele (ověřeno dotazy / API endpointy).

## D4

### 1. Sekce nálady a pozdních příchodů v profilu učitele (UI)
- **Vlastník:** Novák
- **Popis funkcionality:** Vytvoření a začlenění vizuální sekce pro zobrazení nálady a pozdních příchodů učitele do společného profilu učitele `/ucitel/<id>` v souladu se styly aplikace.
- **Hotovo, když:** Přihlášený uživatel otevře na nasazené aplikaci profil vybraného učitele (`/ucitel/<id>`) a přímo na stránce profilu uvidí přehlednou, správně nastylovanou sekci s aktuální náladou a záznamy pozdních příchodů daného učitele (na desktopu i mobilu bez rozbitého rozvržení).

### 2. Propojení s profilem učitele, hlášení prodlevy a skrytí pro nepřihlášené (Frontend)
- **Vlastník:** Blažík
- **Popis funkcionality:** Napojení sekce nálady a pozdních příchodů v profilu učitele `/ucitel/<id>` na reálná data, zobrazení srozumitelné hlášky při aktivní 30minutové prodlevě pro konkrétního žáka a zablokování zobrazení údajů o učitelích pro nepřihlášené uživatele.
- **Hotovo, když:** Nepřihlášený uživatel otevře stránku s absencemi a neuvidí žádné údaje o učitelích (je přesměrován na přihlášení nebo uvidí výzvu k přihlášení). Přihlášený žák odešle zápis nálady nebo zpoždění, po otevření profilu učitele (`/ucitel/<id>`) uvidí aktualizované údaje a při pokusu o další zápis před uplynutím 30 minut se mu zobrazí upozornění o čekací lhůtě.

### 3. 30minutová prodleva na jednotlivého žáka a ochrana API (Backend / DB)
- **Vlastník:** Hudeček
- **Popis funkcionality:** Úprava databázové a backendové logiky tak, aby se 30minutová prodleva mezi zápisy počítala pro každého přihlášeného žáka zvlášť (nikoliv globálně pro všechny), poskytování dat o náladě a pozdních příchodech pro profil `/ucitel/<id>` a zamítání neautorizovaných požadavků.
- **Hotovo, když:** Žák A na nasazené aplikaci zapíše zpoždění nebo náladu učitele a jeho další pokus o zápis během 30 minut server odmítne; ihned poté se přihlásí žák B, odešle zápis a zápis se bez chyby uloží a zobrazí. Nepřihlášený uživatel nedostane ze serveru žádná data o učitelích.