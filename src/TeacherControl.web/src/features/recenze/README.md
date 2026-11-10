# F3 Recenze

Vlastník: _Ondráček_ · UI a responzivní design: _Zbitek_

Routa: `/recenze`. Tvar kódu podle `features/vzor`, pravidla v `AGENTS.md`, barvy a typografie
podle `docs/design/design_rules.md`.

## Co stránka umí

- **Levý sloupec** – vyhledávání podle jména (bez ohledu na diakritiku), řazení a stránkovaný seznam
  karet učitelů s průměrným hodnocením.
- **Pravý sloupec** – profil učitele (fotka, jméno, přezdívka, popis, průměr), Like/Dislike učitele,
  tlačítko Napsat recenzi, seznam recenzí s řazením (nejnovější / nejstarší), tlačítko Zpět.
- **Formulář recenze** – jen text s počítadlem 0/5000. Recenze jsou anonymní, autor se z backendu
  neposílá. Validace v `schema.ts` (Zod). Psát můžou jen uživatelé s rolí `student`, na učitele
  jedna recenze (druhá až po smazání). Vlastní recenzi jde upravit i smazat.
- **Responzivita** – od 1200 px dva sloupce vedle sebe (detail je sticky). Pod tím seznam → detail →
  formulář jako v mobilním návrhu, mezi nimi tlačítko Zpět.
- **Stavy** – hover / active / focus u karet, vyhledávání, Like/Dislike a tlačítek; skeletony
  při načítání, chybové a prázdné stavy.

## Napojení na data

Featura volá backend `/api/reviews` (Synáč, `docs/features/recenze.md`) přes `api.GET()` / `api.POST()` /
`api.PUT()` / `api.DELETE()`. Typy se berou z `docs/api/TeacherControl.Api.json`
(`pnpm gen:api`), mapování je v `types.ts`. Ve vývoji odpovídá MSW z `mocks.ts`, které kopíruje
chování backendu (409 na druhou recenzi, 403 na cizí).

| Hook                   | Endpoint                                                         |
| ---------------------- | ---------------------------------------------------------------- |
| `useReviewTeachers()`  | `GET /api/reviews/teachers`                                      |
| `useReviewTeacher(id)` | `GET /api/reviews/teachers/{id}` (profil včetně recenzí)         |
| `useCreateReview(id)`  | `POST /api/reviews/teachers/{id}/reviews` s `{ content }`        |
| `useUpdateReview()`    | `PUT /api/reviews/{reviewId}` s `{ content }`                    |
| `useDeleteReview()`    | `DELETE /api/reviews/{reviewId}`                                 |
| `useSetReaction()`     | `PUT /api/reviews/teachers/{id}/reaction` s `{ value: 1 \| -1 }` |

Hvězdičkové hodnocení (`averageRating`) se jen čte z featury Rating. Předměty, třídy, kategorie
ani hodnocení u recenze backend nemá, proto je stránka nezobrazuje.
