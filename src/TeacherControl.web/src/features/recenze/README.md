# F3 Recenze

Vlastník: _Ondráček_ · UI a responzivní design: _Zbitek_

Routa: `/recenze`. Tvar kódu podle `features/vzor`, pravidla v `AGENTS.md`, barvy a typografie
podle `docs/design/design_rules.md`.

## Co stránka umí

- **Levý sloupec** – vyhledávání (jméno i předmět, bez ohledu na diakritiku), filtr předmětů
  (Všichni / 3 nejčastější / menu Více), řazení a stránkovaný seznam karet učitelů.
- **Pravý sloupec** – profil učitele (fotka, předmět, průměr, třídy, škola), hodnocení v kategoriích,
  tlačítko Napsat recenzi, seznam recenzí s řazením a přepínačem Like/Dislike, tlačítko Zpět.
- **Formulář recenze** – hvězdičky, nadpis, text s počítadlem 0/500, anonymita, zobrazení třídy.
  Validace v `schema.ts` (Zod). Psát můžou jen uživatelé s rolí `student`.
- **Responzivita** – od 1200 px dva sloupce vedle sebe (detail je sticky). Pod tím seznam → detail →
  formulář jako v mobilním návrhu, mezi nimi tlačítko Zpět.
- **Stavy** – hover / active / focus u karet, filtrů, vyhledávání, Like/Dislike a tlačítek; skeletony
  při načítání, chybové a prázdné stavy.

## Napojení na data

Backend recenze zatím nemá, takže `api.ts` volá `fetchJson()` a odpovědi dodává MSW z `mocks.ts`.
Tvary odpovědí jsou v `types.ts`:

| Hook                          | Endpoint                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `useReviewTeachers()`         | `GET /api/recenze/teachers`                                                          |
| `useReviewTeacher(id)`        | `GET /api/recenze/teachers/{id}`                                                     |
| `useTeacherReviews(id, sort)` | `GET /api/recenze/teachers/{id}/reviews?sort=newest\|oldest\|best\|helpful`          |
| `useCreateReview(id)`         | `POST /api/recenze/teachers/{id}/reviews`                                            |
| `useVoteReview()`             | `PUT /api/recenze/reviews/{reviewId}/vote` s `{ vote: 'like' \| 'dislike' \| null }` |

Až backend endpointy dodá: `pnpm gen:api`, přepsat `fetchJson()` na `api.GET()` / `api.POST()`
a smazat ruční typy z `types.ts`. Komponenty se měnit nemusí.
