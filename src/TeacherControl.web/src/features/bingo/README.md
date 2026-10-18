# F1 Bingo

Vlastník: _Volk_

Tvar kódu zkopíruj z `features/rating`. Pravidla jsou v `AGENTS.md`. Routa: `/bingo`.

Student si na stránce vybere učitele, vygeneruje bingo desku a označuje políčka. Stav desky se
načítá z API, takže po obnovení stránky zůstává zachovaný. Přes formulář lze odeslat novou hlášku
učitele. Po prvním dokončeném bingu frontend požádá API o atomické zapsání denního vítěze a zobrazí
výsledek z API.

Frontend používá endpointy `GET /bingo/daily-winner` a `POST /bingo/daily-winner` pro načtení a
zapsání vítěze. O tom, kdo byl první, rozhoduje server; souběžné požadavky musí být vyhodnoceny
atomicky. Vývojový MSW mock ukládá desky, hlášky a vítěze do `localStorage`, aby se zachovaly po
obnovení stránky.
