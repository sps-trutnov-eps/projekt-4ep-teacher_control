# Recenze (F3)

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
| PUT | `/api/reviews/teachers/{teacherId}/reaction` | `{ "value": 1 }` like, `-1` dislike, `0` zrušení hlasu |

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

Nová migrace přidává tabulky TextReviews a TeacherReactions. Existující rating ani jeho data nemění.
Při spuštění API se migrace aplikují podle existující konfigurace Program.cs.
Po úspěšném sestavení se musí aktualizovat OpenAPI export a frontendové typy (`pnpm gen:api`).

## Ověření na běžící databázi

1. Bez přihlášení všechny endpointy vracejí 401.
2. Uživatel A vytvoří recenzi (201), druhý pokus pro stejného učitele vrátí 409.
   Dva souběžné pokusy musí vytvořit právě jeden záznam.
3. Uživatel B vidí stejnou recenzi s `isMine: false`, bez ID nebo jména autora.
   Jeho pokus o změnu či smazání vrací 403.
4. Uživatel A může změnit obsah, pak recenzi smazat (204) a napsat novou.
5. Prázdný text, pouze mezery nebo více než 5000 znaků vracejí 400.
6. Like, opakovaný like, změna na dislike a zrušení hlasu musí mít počty
   postupně (1,0), (1,0), (0,1), (0,0), pokud je uživatel jediný hlasující.
   Hodnota 2 vrací 400. Hlasy uživatele B nesmějí přepsat hlas A.
7. Neexistující učitel vrací 404 při čtení, vytvoření recenze i hlasování.
8. Po restartu API zůstávají recenze i hlasy uložené.

Dosavadní ověření: sestavení bylo blokováno TLS chybou přístupu k NuGet.
Migrace, databázové scénáře a export OpenAPI zatím nebyly spuštěny.
