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

Profil `/ucitel/<id>` má pro každou featuru jednu sekci. Nadpis a kartu kreslí profil, tým dodá jen obsah:

1. Ve své featuře napiš komponentu, která bere `TeacherSectionProps`, tedy `{ teacherId }`, a data si načte sama.
2. Vyexportuj ji z `index.ts` své featury.
3. V `src/routes/teacherSections.tsx` ji doplň do svého řádku jako `Component`.

Seznam učitelů se zatím bere z `/api/pololeti/teachers`, společný endpoint backend nemá.
