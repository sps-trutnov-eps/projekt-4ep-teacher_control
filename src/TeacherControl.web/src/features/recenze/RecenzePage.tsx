import { Alert, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { useReviewTeachers } from './api'
import { IconSearch } from './components/icons'
import { ReviewForm } from './components/ReviewForm'
import { TeacherDetail } from './components/TeacherDetail'
import { TeacherList, TeacherListSkeleton } from './components/TeacherList'
import { TeacherSearch } from './components/TeacherSearch'
import classes from './Recenze.module.css'
import type { Review, ReviewTeacher, TeacherSort } from './types'

const PAGE_SIZE = 8

/** Pod touhle šířkou je vidět buď seznam, nebo detail — stejná hranice jako v CSS. */
const SINGLE_COLUMN_QUERY = '(max-width: 74.99em)'

type DetailMode = 'profile' | 'write'

const TEACHER_SORTERS: Record<TeacherSort, (a: ReviewTeacher, b: ReviewTeacher) => number> = {
  reviews: (a, b) => b.reviewCount - a.reviewCount,
  rating: (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
  name: (a, b) => a.name.localeCompare(b.name, 'cs'),
}

/**
 * F3 Recenze. Desktop: vyhledávání a seznam učitelů vlevo, detail s recenzemi vpravo.
 * Užší obrazovky: seznam → detail → formulář, mezi nimi tlačítko Zpět (mobilní návrh).
 */
export function RecenzePage() {
  const teachersQuery = useReviewTeachers()

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TeacherSort>('reviews')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  /** Recenze, kterou formulář upravuje; bez ní se píše nová. */
  const [editing, setEditing] = useState<Review | null>(null)
  const [mode, setMode] = useState<DetailMode>('profile')

  const scrollTopOnMobile = () => {
    if (window.matchMedia(SINGLE_COLUMN_QUERY).matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const selectTeacher = (teacherId: number) => {
    setSelectedId(teacherId)
    setEditing(null)
    setMode('profile')
    scrollTopOnMobile()
  }

  const changeMode = (next: DetailMode) => {
    setMode(next)
    scrollTopOnMobile()
  }

  const startWriting = () => {
    setEditing(null)
    changeMode('write')
  }

  const startEditing = (review: Review) => {
    setEditing(review)
    changeMode('write')
  }

  const allTeachers = teachersQuery.data ?? []
  const filtered = filterTeachers(allTeachers, search).sort(TEACHER_SORTERS[sort])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className={classes.root}>
      <Stack gap="lg">
        <header>
          <h1 className={classes.title}>Recenze učitelů</h1>
          <p className={classes.subtitle}>
            Přečti si, co o učitelích píšou ostatní studenti, a přidej vlastní recenzi.
          </p>
        </header>

        <div className={classes.layout} data-has-selection={selectedId !== null || undefined}>
          <section className={classes.listColumn} aria-label="Seznam učitelů">
            <Stack gap="md">
              <TeacherSearch
                search={search}
                onSearchChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
                sort={sort}
                onSortChange={(value) => {
                  setSort(value)
                  setPage(1)
                }}
              />

              {teachersQuery.isPending ? (
                <TeacherListSkeleton />
              ) : teachersQuery.isError ? (
                <Alert color="red" title="Chyba">
                  Seznam učitelů se nepodařilo načíst. Zkus to prosím znovu.
                </Alert>
              ) : (
                <TeacherList
                  teachers={pageItems}
                  selectedId={selectedId}
                  onSelect={selectTeacher}
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </Stack>
          </section>

          <section className={classes.detailColumn} aria-label="Detail učitele">
            {selectedId === null ? (
              <EmptyDetail />
            ) : mode === 'write' ? (
              <ReviewForm
                key={`${selectedId}-${editing?.id ?? 'new'}`}
                teacherId={selectedId}
                review={editing ?? undefined}
                onBack={() => changeMode('profile')}
                onSubmitted={() => changeMode('profile')}
              />
            ) : (
              <TeacherDetail
                teacherId={selectedId}
                onBack={() => setSelectedId(null)}
                onWrite={startWriting}
                onEdit={startEditing}
              />
            )}
          </section>
        </div>
      </Stack>
    </div>
  )
}

function EmptyDetail() {
  return (
    <div className={`${classes.panel} ${classes.placeholder}`}>
      <Stack gap="xs" align="center">
        <span className={classes.placeholderIcon}>
          <IconSearch size={28} />
        </span>
        <Text fw={600} size="lg">
          Vyber učitele ze seznamu
        </Text>
        <Text className={classes.muted} maw={320}>
          Zobrazí se jeho profil, hodnocení a recenze od studentů.
        </Text>
      </Stack>
    </div>
  )
}

/** Filtruje se ze staženého seznamu, aby hledání fungovalo bez ohledu na diakritiku. */
function filterTeachers(teachers: ReviewTeacher[], search: string) {
  const query = normalize(search.trim())

  return teachers.filter((teacher) => !query || normalize(teacher.name).includes(query))
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
