# Bingo – MUST položky

## 1. Frontend
- **Co umí:** Student si na stránce /bingo vybere učitele ze seznamu (s vyhledáváním), vygeneruje si bingo desku a kliknutím označuje políčka. Může odeslat novou hlášku učitele a vidí, kdo je králem/královnou dne.
- **Hotovo, když:** student na /bingo vybere učitele, vygeneruje desku, označí políčka a po reloadu stránky vidí stejnou desku se stejně označenými políčky, může odeslat novou hlášku učitele a vidí, kdo je králem/královnou dne (kdo první splní bingo za den).
- **Vlastník:** Antonín Vaňouček

## 2. Backend
- **Co umí:** API vrací seznam učitelů a jejich hlášek, vygeneruje a uloží bingo desku pro studenta, ukládá označená políčka každého studenta zvlášť, přijímá nové hlášky od studentů a určí krále/královnu dne (první student, který za den splní bingo).
- **Hotovo, když:** endpointy jsou popsané v OpenAPI (docs/api/TeacherControl.Api.json), deska i označená políčka zůstanou uložená v databázi i po restartu serveru, nově odeslaná hláška se uloží a endpoint pro krále/královnu dne vrátí správného studenta.
- **Vlastník:** Matěj Prokopec

## 3. Design – návrh stránky /bingo
- **Co umí:** Návrh (wireframe/mockup) stránky /bingo: rozložení seznamu učitelů s vyhledáváním, bingo desky, formuláře pro zaslání hlášky a zobrazení krále/královny dne, včetně barev a vzhledu políček (neoznačené/označené/bingo).
- **Hotovo, když:** Návrh je hotový v Canvě, hotová stránka /bingo mu odpovídá a designér to potvrdí schválením (review) frontendového PR.
- **Vlastník:** Eva Brátová