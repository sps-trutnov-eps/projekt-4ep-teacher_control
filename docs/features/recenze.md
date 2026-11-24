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

### 1. Jedno hodnocení: hvězdičky a text v profilu učitele
- **Vlastník:** Uher
- **Co přesně umí:** V profilu učitele `/ucitel/<id>` je sekce Recenze s jedním formulářem.
  Žák v něm zadá 1–5 hvězdiček a text recenze a odešle obojí najednou. Dosavadní dvě oddělená
  hodnocení (hvězdičky z Ratingu a textová recenze z Recenzí) jsou sloučená do jednoho, takže
  každý žák má u učitele nejvýš jedno hodnocení. Průměr hvězdiček v profilu i v seznamu učitelů
  se počítá z těchto hodnocení. Své hodnocení může žák upravit nebo smazat.
- **Hotovo, když:**
  - Přihlášený žák otevře `/ucitel/<id>`, v sekci Recenze vybere hvězdičky, napíše text
    a odešle. Recenze se hned objeví v seznamu i s jeho hvězdičkami a průměr učitele
    v profilu i v seznamu na `/recenze` se přepočítá.
  - Formulář bez hvězdiček nebo bez textu nejde odeslat a u chybějícího pole se ukáže chyba.
  - Žák, který už hodnocení má, vidí místo prázdného formuláře své hodnocení s tlačítky
    Upravit a Smazat a druhé hodnocení stejnému učiteli napsat nejde. Upravené hvězdičky
    i text zůstanou i po obnovení stránky. Po smazání se zase ukáže prázdný formulář.
  - Nepřihlášený uživatel na `/ucitel/<id>` ani na `/recenze` žádné recenze ani hodnocení
    neuvidí a aplikace ho pošle na přihlášení.

### 2. Nahlášení nevhodné recenze a skrytí správcem
- **Vlastník:** Synáč
- **Co přesně umí:** U každé cizí recenze je tlačítko Nahlásit, kterým žák odešle nahlášení
  s důvodem. Správce má stránku Nahlášené recenze, kde vidí nahlášené recenze s textem,
  učitelem a důvody nahlášení a u každé zvolí Skrýt nebo Ponechat. Skrytá recenze zmizí
  ostatním žákům a nepočítá se do průměru hvězdiček. Správce ji může znovu zobrazit.
- **Hotovo, když:**
  - Žák u cizí recenze klikne na Nahlásit, napíše důvod a odešle. Uvidí potvrzení
    a stejnou recenzi už znovu nahlásit nemůže. U vlastní recenze tlačítko Nahlásit není.
  - Správce otevře stránku Nahlášené recenze a nahlášenou recenzi tam vidí i s důvodem.
    Běžný žák tuto stránku v menu nemá a po zadání její adresy uvidí hlášku, že na ni nemá
    oprávnění.
  - Když správce klikne na Skrýt, recenze z přehledu zmizí. Jiný žák ji po obnovení profilu
    učitele už nevidí a průměr hvězdiček se přepočítá bez ní. Když správce klikne na Ponechat,
    recenze zůstane vidět a z přehledu nahlášených zmizí.
  - Správce skrytou recenzi najde v přehledu pod filtrem Skryté a tlačítkem Zobrazit ji
    vrátí, takže ji žáci zase vidí.

### 3. Skrytý autor recenze a jeho dohledání správcem
- **Vlastník:** Zbitek
- **Co přesně umí:** Žákům se u recenzí nezobrazuje, kdo je napsal. Místo jména vidí
  „Anonymní žák“ a jméno, e-mail ani ID autora nepřijde ani v odpovědi API. Vlastní recenzi
  žák pozná podle štítku „Tvoje recenze“. Správce u každé recenze, v profilu učitele
  i v přehledu nahlášených, vidí jméno a školní e-mail autora a může si zobrazit všechny
  recenze tohoto autora.
- **Hotovo, když:**
  - Žák v profilu učitele vidí u cizích recenzí jen „Anonymní žák“. Ani v nástrojích
    prohlížeče (F12, záložka Síť) není v odpovědi s recenzemi jméno, e-mail ani ID autora.
  - Žák u své recenze vidí štítek „Tvoje recenze“.
  - Správce u stejné recenze vidí jméno a e-mail autora. Po kliknutí na jméno uvidí seznam
    všech recenzí tohoto autora u všech učitelů.
  - Žák, který otevře adresu přehledu recenzí autora, uvidí hlášku, že na ni nemá oprávnění,
    a žádná jména se mu nezobrazí.

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
