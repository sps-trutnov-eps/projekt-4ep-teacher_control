import { Pagination, Skeleton, Stack, Text } from '@mantine/core'
import classes from '../Recenze.module.css'
import { BRAND } from '../theme'
import type { ReviewTeacher } from '../types'
import { TeacherCard } from './TeacherCard'

interface TeacherListProps {
  teachers: ReviewTeacher[]
  selectedId: string | null
  onSelect: (teacherId: string) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TeacherList({
  teachers,
  selectedId,
  onSelect,
  page,
  totalPages,
  onPageChange,
}: TeacherListProps) {
  if (teachers.length === 0) {
    return (
      <div className={classes.panel}>
        <Text fw={600}>Nikoho jsem nenašel.</Text>
        <Text className={classes.muted}>Zkus jiné jméno nebo zruš filtr předmětu.</Text>
      </div>
    )
  }

  return (
    <Stack gap="md">
      <Stack gap="sm" component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
        {teachers.map((teacher) => (
          <li key={teacher.id}>
            <TeacherCard
              teacher={teacher}
              isActive={teacher.id === selectedId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </Stack>

      {totalPages > 1 ? (
        <Pagination
          value={page}
          onChange={onPageChange}
          total={totalPages}
          color={BRAND.primary}
          radius="md"
          withEdges={false}
          style={{ alignSelf: 'center' }}
          getControlProps={(control) => ({
            'aria-label': control === 'previous' ? 'Předchozí strana' : 'Další strana',
          })}
        />
      ) : null}
    </Stack>
  )
}

export function TeacherListSkeleton() {
  return (
    <Stack gap="sm" aria-label="Načítám učitele">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} height={98} radius={12} />
      ))}
    </Stack>
  )
}
