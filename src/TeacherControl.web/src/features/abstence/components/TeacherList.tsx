import { Alert, Loader, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import { useTeacher, useTeachers } from '../api'
import { TeacherDetail } from './TeacherDetail'
import { TeacherListItem } from './TeacherListItem'

interface TeacherListProps {
  /** Filtr jména — backend ho nepodporuje, filtruje se ze staženého seznamu. */
  nameFilter: string
  onSelect: (teacherId: number) => void
}

/** Seznam učitelů s vyhledáváním podle jména. Na mobilu se řádek rozklikne, na desktopu vybere detail. */
export function TeacherList({ nameFilter, onSelect }: TeacherListProps) {
  const teachersQuery = useTeachers()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  // Rozklik řádku je mobilní varianta z designu; na desktopu řádek jen vybere detail vedle.
  const isMobile = useMediaQuery('(max-width: 48em)')

  if (teachersQuery.isPending) {
    return <Loader size="sm" />
  }

  if (teachersQuery.isError) {
    return (
      <Alert color="red" title="Chyba">
        Seznam učitelů se nepodařilo načíst. Zkus to prosím znovu.
      </Alert>
    )
  }

  const normalizedFilter = nameFilter.trim().toLowerCase()
  const teachers = normalizedFilter
    ? teachersQuery.data.filter((teacher) => teacher.name.toLowerCase().includes(normalizedFilter))
    : teachersQuery.data

  if (teachers.length === 0) {
    return <Text c="dimmed">Nikoho jsem nenašel.</Text>
  }

  return (
    <Stack gap="sm">
      {teachers.map((teacher) => (
        <TeacherListItem
          key={teacher.teacherId}
          teacher={teacher}
          isExpanded={isMobile && expandedId === teacher.teacherId}
          onToggle={() => {
            onSelect(teacher.teacherId)
            if (isMobile) {
              setExpandedId((current) => (current === teacher.teacherId ? null : teacher.teacherId))
            }
          }}
        >
          {isMobile && expandedId === teacher.teacherId ? (
            <ExpandedTeacherDetail teacherId={teacher.teacherId} />
          ) : null}
        </TeacherListItem>
      ))}
    </Stack>
  )
}

function ExpandedTeacherDetail({ teacherId }: { teacherId: number }) {
  const { data: teacher, isPending, isError } = useTeacher(teacherId)

  if (isPending) {
    return <Loader size="sm" />
  }

  if (isError || !teacher) {
    return (
      <Alert color="red" title="Chyba">
        Detail učitele se nepodařilo načíst.
      </Alert>
    )
  }

  return <TeacherDetail teacher={teacher} />
}
