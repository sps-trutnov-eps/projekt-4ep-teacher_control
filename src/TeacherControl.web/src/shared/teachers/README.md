# shared/teachers

Učitel je ve všech featurách stejný, proto je jeho seznam, avatar a výběr tady a ve featurách se nepíšou znovu.

- `useTeachers()` vrací všechny učitele podle abecedy, `useTeacher(id)` jednoho (`null`, když neexistuje).
- `<TeacherAvatar name photoUrl />` je fotka nebo iniciály. Bere props Mantine `Avatar`, třeba `size` a `color`.
- `<TeacherSelect value onChange />` je výběr s hledáním, hodnota je id učitele. Bere props Mantine `Select`.
- `teacherProfilePath(id)` je adresa profilu `/ucitel/<id>`.

```tsx
const [teacherId, setTeacherId] = useState<number | null>(null)

<TeacherSelect value={teacherId} onChange={setTeacherId} />
```

Ve formuláři přes `Controller` z React Hook Form: `value={field.value}`, `onChange={field.onChange}`,
`error={errors.teacherId?.message}`.

## Sekce v profilu učitele

Profil `/ucitel/<id>` skládá `src/features/ucitel/TeacherProfilePage.tsx` ze seznamu `TEACHER_SECTIONS`
v `src/routes/teacherSections.tsx`. Každá featura tam má jeden záznam `{ id, title, Component? }`.
Profil pro každý záznam vykreslí `<Card component="section" id={id}>` s nadpisem `<Title order={2}>`
a do karty vloží `<Component teacherId={teacher.id} />`. Dokud `Component` chybí, je v kartě jen text,
že sekce ještě není hotová.

Postup na příkladu Recenzí:

1. Komponenta ve featuře. Props jsou `TeacherSectionProps`, tedy `{ teacherId: number }`.
   `useTeacherReviews` je tady vlastní hook featury z jejího `api.ts`.

```tsx
// src/features/recenze/components/TeacherReviewsSection.tsx
import { Alert, Loader, Text } from '@mantine/core'
import type { TeacherSectionProps } from '@/shared/teachers'
import { useTeacherReviews } from '../api'

export function TeacherReviewsSection({ teacherId }: TeacherSectionProps) {
  const { data: reviews, isPending, isError } = useTeacherReviews(teacherId)

  if (isPending) return <Loader size="sm" />
  if (isError) return <Alert color="red">Recenze se nepodařilo načíst.</Alert>
  if (reviews.length === 0) return <Text c="dimmed">Zatím žádná recenze.</Text>

  return reviews.map((review) => <Text key={review.id}>{review.text}</Text>)
}
```

2. Export z barrelu featury.

```ts
// src/features/recenze/index.ts
export { TeacherReviewsSection } from './components/TeacherReviewsSection'
```

3. Zápis do seznamu sekcí.

```tsx
// src/routes/teacherSections.tsx
import { TeacherReviewsSection } from '@/features/recenze'

export const TEACHER_SECTIONS: TeacherSection[] = [
  // …
  { id: 'recenze', title: 'Recenze', Component: TeacherReviewsSection },
]
```

Co platí pro každou sekci:

- `teacherId` je vždy id existujícího učitele. Sekce se vykreslí až po načtení učitele, neplatnou adresu
  řeší profil.
- Načítání, chybu a prázdný stav řeší sekce sama uvnitř své karty.
- Sekce nekreslí vlastní `Card`, `PageHeader` ani svůj nadpis. Podnadpisy uvnitř začínají na
  `<Title order={3}>`.
- Query key obsahuje `teacherId`, třeba `['recenze', 'teacher', teacherId]`, aby se nepletla data dvou
  učitelů.
- `id` záznamu je zároveň kotva v adrese: `/ucitel/3#recenze`.
- Odkaz na profil odjinud: `<Link to={teacherProfilePath(teacher.id)}>`.

Seznam učitelů se bere z `/api/pololeti/teachers`. Volá se na jediném místě, v `api.ts` v téhle složce.
