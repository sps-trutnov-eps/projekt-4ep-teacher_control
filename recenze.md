# Feature: Recenze učitelů (TeacherControl)

## MUST položky

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