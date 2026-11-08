# F3 Recenze

Vlastník: _Ondráček_ · UI a responzivní design: _Zbitek_

Routa: `/recenze`. Tvar kódu podle `features/vzor`, pravidla v `AGENTS.md`, barvy a typografie
podle `docs/design/design_rules.md`.

## Co stránka umí

- **Levý sloupec** – vyhledávání podle jména nebo popisu, řazení a stránkovaný seznam učitelů.
- **Pravý sloupec** – profil učitele, průměrné hodnocení, reakce na učitele, formulář a seznam recenzí.
- **Formulář recenze** – text s počítadlem 0/500.
  Validace v `schema.ts` (Zod). Psát můžou jen uživatelé s rolí `student`.
- **Responzivita** – od 1200 px dva sloupce vedle sebe (detail je sticky). Pod tím seznam → detail →
  formulář jako v mobilním návrhu, mezi nimi tlačítko Zpět.
- **Stavy** – hover / active / focus u karet, filtrů, vyhledávání, Like/Dislike a tlačítek; skeletony
  při načítání, chybové a prázdné stavy.

## Napojení na data

API vrací recenze s textem a reakce ukládá k učiteli. Mock odpovědi z `mocks.ts` kopírují tento
kontrakt. Aktuální endpointy:

| Hook                    | Endpoint                                                  |
| ----------------------- | --------------------------------------------------------- |
| `useReviewTeachers()`   | `GET /api/reviews/teachers`                               |
| `useReviewTeacher(id)`  | `GET /api/reviews/teachers/{id}`                          |
| `useTeacherReviews(id)` | `GET /api/reviews/teachers/{id}/reviews`                  |
| `useCreateReview(id)`   | `POST /api/reviews/teachers/{id}/reviews` s `{ content }` |
| `useTeacherReaction()`  | `PUT /api/reviews/teachers/{id}/reaction` s `{ value }`   |

Odpovědi používají číselná ID učitelů, recenze obsahují `content` a `isMine`; `myReaction` je `1`,
`-1` nebo `null`. Po vygenerování chybějících OpenAPI cest má `api.ts` přejít z `fetchJson()` na
typované volání klienta a `types.ts` se odstraní.
