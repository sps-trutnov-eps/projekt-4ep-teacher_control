
# Pravidla designu

## Barevná paleta

Hlavními barvami aplikace jsou modrá a bílá, inspirované barvami SPŠ Trutnov. Doplňkové barvy slouží pro text, upozornění a další komponenty.

| Barva | HEX kód | Použití |
|---|---|---|
| Primární modrá | `#1655A3` | Hlavní tlačítka, odkazy, navigace |
| Tmavě modrá | `#173B70` | Nadpisy, aktivní položky |
| Světle modrá | `#EAF2FF` | Zvýrazněné sekce, pozadí |
| Bílá | `#FFFFFF` | Karty, formuláře |
| Světle šedá | `#F4F7FB` | Pozadí stránky |
| Černá | `#000000` | Běžný text |
| Středně šedá | `#64748B` | Vedlejší a pomocný text |
| Šedomodrá | `#D9E3F0` | Okraje a oddělovací čáry |
| Zelená | `#15803D` | Úspěšné akce a potvrzení |
| Červená | `#DC2626` | Chyby, odstranění |
| Zlatá | `#D99A17` | Vybrané hvězdičky hodnocení |
| Šedá pro hvězdičky | `#CBD5E1` | Nevybrané hvězdičky |

## Typografie

Pro celou stránku se bude používat font **Inter** a záložní font je Arial, sans-serif.

Velikosti textu:

| Prvek | Velikost | Styl |
|---|---|---|
| Hlavní nadpis (H1) | 28 px | Tučný |
| Nadpis sekce (H2) | 24 px | Tučný |
| Menší nadpis (H3) | 20 px | Polotučný |
| Běžný text | 16 px | Normální |
| Pomocný text | 14 px | Normální |
| Text tlačítek | 16 px | Polotučný |

Text bude zarovnán převážně vlevo. Nadpisy a důležité informace můžou být zarovnané na střed.

Pro běžný text bude použita černá barva `#000000`, pro vedlejší text šedá `#64748B` a pro nadpisy tmavě modrá `#173B70`.

## Komponenty

Všechny části aplikace musí používat jednotný vzhled komponent.

### Tlačítka

- **Hlavní tlačítka:** modré pozadí `#1655A3`, bílý text
- **Vedlejší tlačítka:** bílé pozadí, modrý text a modrý okraj
- **Tlačítka pro odstranění:** červené pozadí `#DC2626`, bílý text
- Zaoblení rohů: 8 px
- Minimální výška: 40 px
- Při najetí myší se tlačítko mírně ztmaví nebo zvýrazní

### Vstupní pole

- Bílé pozadí a šedomodrý okraj `#D9E3F0`
- Zaoblení rohů: 8 px
- Vnitřní odsazení: 12 px
- Popisek pole bude umístěn nad vstupním polem
- Při kliknutí do pole se okraj zvýrazní modře
- Chybové zprávy budou zobrazeny červeně

### Karty

Karty slouží k zobrazování informací, například hodnocení učitelů.

- Bílé pozadí
- Zaoblení rohů: 12 px
- Jemný stín nebo šedomodrý okraj `#D9E3F0`
- Vnitřní odsazení: 20 px
- Jednotné mezery mezi jednotlivými kartami

### Navigace

- Navigace bude používat hlavní modrou a bílou barvu
- Aktivní položka bude vizuálně zvýrazněna
- Všechny stránky budou mít jednotný styl navigace
- Na mobilních zařízeních se navigace přizpůsobí velikosti obrazovky

### Hodnocení

- Pro hodnocení učitelů budou použity hvězdičky na stupnici 1–5
- Vybrané hvězdičky budou mít zlatou barvu `#D99A17`
- Nevybrané hvězdičky budou mít světle šedou barvu `#CBD5E1`
- Vedle hvězdiček může být zobrazena také číselná hodnota

### Vyskakovací okna

- Bílé pozadí a zaoblené rohy 12 px
- Zobrazení uprostřed obrazovky
- Pozadí stránky bude při otevření okna ztmavené
- Okno musí mít možnost zavření

### Upozornění

- **Úspěšná akce:** zelená `#15803D`
- **Chyba:** červená `#DC2626`
- **Informační upozornění:** modrá `#1655A3`
- Upozornění musí obsahovat krátký a srozumitelný text
- Upozornění mohou obsahovat také ikonu odpovídající typu zprávy

## Rozložení stránky

- Design musí být jednoduchý a přehledný
- Jednotlivé prvky musí být správně zarovnané
- Pro mezery používat hodnoty 8, 16, 24 a 32 px
- Mezi jednotlivými sekcemi musí být dostatečné rozestupy

## Responzivní design

Aplikace musí být použitelná na počítačích, tabletech i mobilních telefonech.

- Obsah se musí přizpůsobovat šířce obrazovky
- Na menších obrazovkách se mohou karty řadit pod sebe
- Tlačítka a formuláře musí být pohodlně ovladatelné i na mobilu
- Text musí zůstat dobře čitelný na všech zařízeních

