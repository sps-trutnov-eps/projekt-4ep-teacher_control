# Recenze učitelů (F3)

## D2 – MUST položky

### 1. Backend API a databázová logika pro recenze a profily učitelů
- **Vlastník:** Synáč
- **Co přesně umí:** Poskytuje REST API endpointy pro vyhledávání v seznamu učitelů (včetně napojení na celkové hodnocení), načtení detailu profilu konkrétního učitele (jméno, příjmení, přezdívka, vyučované předměty, základní info) a ukládání či načítání textových recenzí včetně hodnocení Like/Dislike.
- **Hotovo, když:**
  - Endpoint pro seznam učitelů vrací data z databáze s možností filtrování podle jména a zahrnuje celkové hodnocení učitele.
  - Endpoint pro detail učitele vrátí kompletní informace o vybraném učiteli a seznam jeho dosavadních recenzí.
  - Endpointy pro přidání nové textové recenze a hlasování (Like/Dislike) správně validují vstupy, ukládají data do databáze a vrací příslušné stavové kódy (HTTP 200/201 při úspěchu, 400/404 při chybě).

### 2. Kompletní UI a responzivní design podstránky Recenze
- **Vlastník:** Zbitek
- **Co přesně umí:** Definuje vizuální podobu, rozložení (layout) a stylování podstránky Recenze podle schváleného návrhu – zahrnuje horní navigační lištu (TeacherControl, Menu, Login), levý boční panel (F1–F5), vyhledávací sloupec se seznamem učitelů a pravou sekci s detailem profilu učitele, textovým polem pro recenzi a tlačítky (Zpět, Like/Dislike).
- **Hotovo, když:**
  - Je nakódovaná kompletní HTML/CSS šablona podstránky přesně odpovídající grafickému návrhu.
  - Rozložení stránky je přehledné, responzivní a má vizuálně ošetřené stavy prvků (hover a active efekty u tlačítek, karet učitelů v seznamu, vyhledávacího pole a přepínače Like/Dislike).
  - Komponenty jsou připravené pro snadné napojení na dynamická data z frontendu.

### 3. Frontendová logika, živé vyhledávání a správa recenzí
- **Vlastník:** Uher
- **Co přesně umí:** Zajišťuje interaktivitu podstránky a komunikaci s backendovým API – umožňuje filtrovat učitele přes vyhledávací pole („Hledat“), po kliknutí na učitele v levém seznamu dynamicky vykreslí jeho profil (jméno, příjmení, přezdívku, předměty, základní info a celkové hodnocení) a umožňuje uživatelům odeslat novou textovou recenzi nebo udělit Like/Dislike.
- **Hotovo, když:**
  - Vyhledávací lišta plynule filtruje seznam učitelů v levém sloupci a u každého zobrazuje i jeho celkové hodnocení.
  - Kliknutí na konkrétního učitele v seznamu bez nutnosti znovunačtení celé stránky zobrazí v pravé části jeho profilové údaje a recenze, přičemž tlačítko „zpět“ správně vrací zobrazení do výchozího stavu.
  - Formulář s textovým polem pro recenzi a tlačítka Like/Dislike odesílají data na backend a po odeslání se nová recenze i stav hodnocení okamžitě projeví na stránce.

## D4

Cíl týmu: učitel má jedno hodnocení, tedy hvězdičky a text v jednom formuláři v profilu.
Žák může nevhodnou recenzi nahlásit a správce ji skryje. Ostatním žákům je autor skrytý,
správce ho dohledá. Správce je uživatel s rolí `Admin`. Bez přihlášení není o učitelích
vidět nic.

### 1. Backend: jedno hodnocení, nahlašování a skrytý autor
- **Vlastník:** Synáč
- **Co přesně umí:** API ukládá jedno hodnocení žáka u učitele, které obsahuje 1–5 hvězdiček
  a text. Dosavadní dvě oddělená hodnocení (hvězdičky z Ratingu a textová recenze
  z Recenzí) jsou sloučená a průměr hvězdiček se počítá jen z viditelných hodnocení. API
  přijímá nahlášení recenze s důvodem a správci vrací přehled nahlášených recenzí. Recenzi umí
  skrýt, ponechat nebo znovu zobrazit. Žákům API nikdy nepošle jméno, e-mail ani ID autora,
  správci je posílá. Všechny endpointy vyžadují přihlášení a správcovské endpointy roli
  `Admin`. Endpointy jsou popsané v OpenAPI (`docs/api/TeacherControl.Api.json`).
- **Hotovo, když:**
  - Žák odešle v profilu učitele hvězdičky s textem a po obnovení stránky tam jeho hodnocení
    pořád je. Průměr učitele se změní podle jeho hvězdiček. Druhé hodnocení stejnému učiteli
    se neuloží a aplikace ukáže chybu.
  - Odeslání bez hvězdiček, s hodnotou mimo 1–5 nebo bez textu skončí chybou a nic se neuloží.
  - Žák nahlásí cizí recenzi a ta se objeví v přehledu správce i s důvodem. Druhé nahlášení
    téže recenze stejným žákem se nezapočítá. Vlastní recenzi nahlásit nejde.
  - Po skrytí správcem recenzi ostatní žáci po obnovení profilu nevidí a průměr hvězdiček se
    přepočítá bez ní. Po opětovném zobrazení je recenze zase vidět.
  - V nástrojích prohlížeče (F12, záložka Síť) žák v odpovědi s recenzemi nenajde jméno,
    e-mail ani ID autora, kdežto správce je tam u každé recenze vidí.
  - Nepřihlášený uživatel nedostane žádná data o učitelích ani recenzích. Žák, který otevře
    adresu správcovského endpointu, dostane chybu 403.

### 2. Design: formulář hodnocení, nahlášení a přehled pro správce
- **Vlastník:** Zbitek
- **Co přesně umí:** Návrh (v Canvě) a vzhled všech nových částí: sekce Recenze v profilu
  učitele `/ucitel/<id>` s jedním formulářem (hvězdičky a text), zobrazení vlastního
  hodnocení s tlačítky Upravit a Smazat, recenze s „Anonymní žák“ a štítkem „Tvoje recenze“,
  tlačítko a okno Nahlásit a stránka správce Nahlášené recenze se jménem autora a tlačítky
  Skrýt, Ponechat a Zobrazit. Návrh dodržuje `docs/design/design_rules.md` a je i pro mobil.
- **Hotovo, když:**
  - Návrh všech uvedených obrazovek je hotový v Canvě a odkaz na něj je v tomto souboru.
  - Sekce Recenze v profilu učitele, okno Nahlásit a stránka Nahlášené recenze na nasazené
    aplikaci vypadají jako návrh, včetně stavů hover, active a focus u hvězdiček a tlačítek.
  - Na šířce telefonu (kolem 375 px) se formulář, recenze i přehled správce vejdou na obrazovku
    bez vodorovného posouvání a všechna tlačítka jde pohodlně stisknout.
  - Designér shodu s návrhem potvrdí schválením (review) frontendového PR.

### 3. Frontend: formulář v profilu, nahlašování a stránka pro správce
- **Vlastník:** Uher
- **Co přesně umí:** Sekce Recenze v profilu učitele `/ucitel/<id>` načítá recenze a průměr
  z API a má jeden formulář na hvězdičky a text. Žák v ní své hodnocení upraví nebo smaže
  a cizí recenzi nahlásí s důvodem. U cizích recenzí ukazuje „Anonymní žák“ a u vlastní štítek
  „Tvoje recenze“. Správci ukazuje u recenzí jméno a e-mail autora a nabízí stránku Nahlášené
  recenze s filtrem Skryté a tlačítky Skrýt, Ponechat a Zobrazit. Po každé akci se data na
  stránce hned obnoví bez načítání celé stránky.
- **Hotovo, když:**
  - Přihlášený žák v profilu učitele vybere hvězdičky, napíše text a odešle. Recenze se hned
    objeví v seznamu a průměr se přepočítá. Formulář bez hvězdiček nebo textu nejde odeslat
    a u chybějícího pole se ukáže chyba.
  - Žák, který už hodnocení má, vidí místo prázdného formuláře své hodnocení s tlačítky Upravit
    a Smazat. Po smazání se zase ukáže prázdný formulář.
  - Žák u cizí recenze klikne na Nahlásit, napíše důvod a odešle. Uvidí potvrzení a tlačítko
    u té recenze zmizí. U cizích recenzí vidí jen „Anonymní žák“, u své „Tvoje recenze“.
  - Správce má v menu stránku Nahlášené recenze, vidí tam recenze s důvodem a jménem autora.
    Po kliknutí na Skrýt nebo Ponechat recenze z přehledu hned zmizí a skrytou najde pod
    filtrem Skryté. Žák tuto stránku v menu nemá a po zadání její adresy uvidí hlášku, že na ni
    nemá oprávnění.
  - Nepřihlášený uživatel na `/ucitel/<id>` ani na `/recenze` žádné recenze neuvidí a aplikace
    ho pošle na přihlášení.

## API (backend `/api/reviews`, stav D2)

Všechny endpointy `/api/reviews` vyžadují přihlášení pomocí existující Identity cookie.
Autor recenze se do odpovědí neposílá. `isMine` označuje vlastní recenzi.
Jedna textová recenze na uživatele a učitele; po smazání lze napsat novou.
Text je povinný, nejvýše 5000 znaků; mezery na začátku a konci se odstraní.

| Metoda | URL | Význam |
| --- | --- | --- |
| GET | `/api/reviews/teachers?search=Jan` | Vyhledání učitelů podle jména, bez rozlišení velikosti písmen |
| GET | `/api/reviews/teachers/{teacherId}` | Profil učitele |
| GET | `/api/reviews/teachers/{teacherId}/reviews` | Anonymní recenze, nejnovější první |
| POST | `/api/reviews/teachers/{teacherId}/reviews` | Vytvoření vlastní recenze: `{ "content": "Text recenze" }` |
| PUT | `/api/reviews/{reviewId}` | Úprava vlastní recenze: `{ "content": "Nový text" }` |
| DELETE | `/api/reviews/{reviewId}` | Smazání vlastní recenze |
| PUT | `/api/reviews/teachers/{teacherId}/reaction` | `{ "value": 1 }` like, `-1` dislike |

Profil obsahuje `id`, `name`, `photoUrl`, `description`, `averageRating`, `reviewCount`,
`likes`, `dislikes`, `myReaction`. Celkové hvězdičkové hodnocení se pouze čte z existujících
dat ratingu; bez hodnocení je `null`. `reviewCount` počítá textové recenze F3.
Jméno a popis jsou ze společné tabulky Teachers; předměty a přezdívka v jejím schématu chybí.

Recenze obsahuje `id`, `teacherId`, `content`, `createdAt`, `updatedAt`, `isMine`.
Časy jsou v UTC. Odpověď na hlas obsahuje `likes`, `dislikes`, `myReaction` (`null` bez hlasu).
Hlasy jsou nezávislé na textových recenzích, každý uživatel má nejvýše jeden hlas na učitele.

Chyby: 400 neplatný vstup, 401 nepřihlášený, 403 úprava/smazání cizí recenze,
404 neexistující učitel/recenze, 409 druhá recenze téhož uživatele pro stejného učitele.
Unikátní databázový index chrání proti souběžnému vytvoření dvou recenzí;
hlasy používají atomický PostgreSQL upsert.

Recenze a reakce vyžadují v databázi tabulky `TextReviews` a `TeacherReactions`.
Po úspěšném sestavení se musí aktualizovat OpenAPI export a frontendové typy (`pnpm gen:api`).

### Ověření na běžící databázi

1. Bez přihlášení všechny endpointy vracejí 401.
2. Uživatel A vytvoří recenzi (201), druhý pokus pro stejného učitele vrátí 409.
   Dva souběžné pokusy musí vytvořit právě jeden záznam.
3. Uživatel B vidí stejnou recenzi s `isMine: false`, bez ID nebo jména autora.
   Jeho pokus o změnu či smazání vrací 403.
4. Uživatel A může změnit obsah, pak recenzi smazat (204) a napsat novou.
5. Prázdný text, pouze mezery nebo více než 5000 znaků vracejí 400.
6. Like, opakovaný like a změna na dislike musí mít počty postupně
   (1,0), (1,0), (0,1), pokud je uživatel jediný hlasující. Hodnoty 0 a 2 vracejí 400. Hlasy uživatele B nesmějí přepsat hlas A.
7. Neexistující učitel vrací 404 při čtení, vytvoření recenze i hlasování.
8. Po restartu API zůstávají recenze i hlasy uložené.
