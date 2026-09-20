import { Alert, Loader, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import { useTeacher, useTeachers } from '../api'
import type { Teacher, TeacherFilters } from '../types'
import { TeacherDetail } from './TeacherDetail'
import { TeacherListItem } from './TeacherListItem'

interface TeacherListProps {
  filters: TeacherFilters
  onSelect: (teacherId: string) => void
}

/** Seznam učitelů s vyhledáváním podle jména. Na mobilu se řádek rozklikne, na desktopu vybere detail. */
export function TeacherList({ filters, onSelect }: TeacherListProps) {
  const teachersQuery = useTeachers(filters)
  const [expandedId, setExpandedId] = useState<string | null>(null)
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

  if (teachersQuery.data.length === 0) {
    return <Text c="dimmed">Nikoho jsem nenašel.</Text>
  }

  return (
    <Stack gap="sm">
      <TeacherListItems
        teachers={teachersQuery.data}
        expandedId={isMobile ? expandedId : null}
        onToggle={(teacherId) => {
          onSelect(teacherId)
          if (isMobile) {
            setExpandedId((current) => (current === teacherId ? null : teacherId))
          }
        }}
      />
    </Stack>
  )
}

interface TeacherListItemsProps {
  teachers: Teacher[]
  expandedId: string | null
  onToggle: (teacherId: string) => void
}

/** Rozkliknutý řádek načítá detail přímo u sebe — tohle je mobilní varianta z designu. */
function TeacherListItems({ teachers, expandedId, onToggle }: TeacherListItemsProps) {
  return (
    <>
      {teachers.map((teacher) => (
        <TeacherListItem
          key={teacher.id}
          teacher={teacher}
          isExpanded={expandedId === teacher.id}
          onToggle={() => onToggle(teacher.id)}
        >
          {expandedId === teacher.id ? <ExpandedTeacherDetail teacherId={teacher.id} /> : null}
        </TeacherListItem>
      ))}
    </>
  )
}

function ExpandedTeacherDetail({ teacherId }: { teacherId: string }) {
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
