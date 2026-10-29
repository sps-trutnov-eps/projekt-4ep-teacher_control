# Instrukce pro strukturu a práci s backendem (API)

V tomto README jsou instrukce, jako například jakou strukturu v projektu udržovat.

## Struktura projektu

Každý tým má ve složce `/Features` vlastní složku, která nese jméno týmu. Například `/Features/Abstence`. Uvnitř této 
složky budou složky pro rozdělení na `Controllers`, `Services` a `Models`.

### Proč na Controllers a Services

Cíly jsou ve výsledku tři. První je rozdělit kód na dvě části, první je endpoint (v Controlleru), kde se zajistí věci, 
jako že uživatel má práva k tomuto endpointu, že je přihlášený a že tam nejsou hovadiny. Ta druhá část je v Services, 
kde se zajistí komunikace s databází a příslušná logika, pokud nějaká je.

Druhý cíl je, že kdyby tým měl zájem o testování kódu, tak je mnohem jednodušší testovat kód v `Services` než v
`Controllers`.

Třetí se týká druhého, jelikož v případě že by nějaký tým měl zájem o testování kódu, tak kvůli jednoduchosti testování
to rozdělí na `Controllers` a `Services`, ale tím pádem už ztrácíme konzistenci mezi týmy.

## Cesty v API

Cesty v API jsou celkem jednoduché. Budou formátu `/api/{controller}/{action}/{id}`. V případě, že endpoint metoda je 
nějaký víceslovný název, tak lze jej přejmenovat do formátu `{word-word-word}`.

## OpenAPI

API popisujeme pomocí OpenAPI. Specifikace je dostupná v development prostředí na `/openapi/v1.json`
a při buildu se exportuje do souboru `openapi.json` v /docs/api/.