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

## Designová rozhodnutí

### 30minutové zamknutí učitele (cooldown)
Po úspěšném zápisu pozdního příchodu (nebo nálady) je učitel pro daný typ zápisu **zamčený na 30 minut pro všechny studenty**. Další pokus od kohokoli server odmítne odpovědí `429 Too Many Requests` s hlavičkou `Retry-After` (zbývající sekundy) a českým varováním v těle: „Zápis pro tohoto učitele už byl v posledních 30 minutách odeslán. Zkus to prosím znovu za chvíli.“ Frontend ho zobrazuje jako varování, ne jako chybu.

**Proč je zámek na učiteli, a ne na jednotlivém studentovi:**
- Pozdní příchody se u učitele za den **sčítají** (`LateArrivalMinutesToday`). Kdyby měl každý student vlastní prodlevu, mohlo by víc studentů současně nahlásit zpoždění téhož učitele a jedno reálné zpoždění by se započetlo opakovaně jako jedno velké.
- Zamknutím učitele se jedno zpoždění započte jen jednou, bez ohledu na to, kolik studentů ho zároveň vidí a chce nahlásit. Ostatní studenti vidí už zapsanou hodnotu.
- U nálady stejné pravidlo brání tomu, aby si studenti hodnotu učitele rychle přepisovali.

**Chování:**
- Pozdní příchod a nálada mají **nezávislé** zámky (jeden typ zápisu neblokuje druhý).
- Zámek je per učitel: nahlášení zpoždění u učitele A nezamyká učitele B.
- Čas posledního zápisu je uložen na učiteli (`Teachers.LastLateArrivalSubmissionAt`, `Teachers.LastMoodSubmissionAt`, UTC).
- Zápis i čtení údajů o učitelích vyžadují přihlášení (nepřihlášený dostane `401`).

**Důsledek pro UI:** hláška o prodlevě se zobrazuje každému studentovi, i když sám nic neodeslal — učitel je zamčený kvůli zápisu někoho jiného. Text hlášky proto nemá říkat „právě jsi odeslal“, ale např. „Zpoždění tohoto učitele už někdo nahlásil, další zápis bude možný za X minut.“