import { Alert, Avatar, Group, Loader, NavLink, Stack, Text } from '@mantine/core'
import { usePololetiTeachers } from '../api'

interface TeacherListProps {
  selectedTeacherId: number | null
  onSelect: (teacherId: number) => void
}

export function TeacherList({ selectedTeacherId, onSelect }: TeacherListProps) {
  const { data, isPending, isError } = usePololetiTeachers()

  if (isPending) {
    return <Loader size="sm" />
  }

  if (isError) {
    return (
      <Alert color="red" title="Chyba">
        Učitele se nepodařilo načíst. Zkus to prosím znovu.
      </Alert>
    )
  }

  if (data.length === 0) {
    return <Text c="dimmed">Zatím tu nejsou žádní učitelé.</Text>
  }

  return (
    <Stack gap={4} component="nav" aria-label="Učitelé">
      {data.map((teacher) => (
        <NavLink
          key={teacher.teacherId}
          active={teacher.teacherId === selectedTeacherId}
          onClick={() => onSelect(teacher.teacherId)}
          label={
            <Group gap="sm" wrap="nowrap">
              <Avatar src={teacher.photoUrl} name={teacher.name} alt={teacher.name} radius="xl" />
              <Text fw={500}>{teacher.name}</Text>
            </Group>
          }
        />
      ))}
    </Stack>
  )
}
