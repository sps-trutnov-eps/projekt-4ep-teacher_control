import { Alert, Avatar, Group, Loader, Stack, Text, UnstyledButton } from '@mantine/core'
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
    <Stack gap={0} component="nav" aria-label="Učitelé" bd="1px solid var(--mantine-color-gray-3)">
      {data.map((teacher) => {
        const isSelected = teacher.teacherId === selectedTeacherId

        return (
          <UnstyledButton
            key={teacher.teacherId}
            onClick={() => onSelect(teacher.teacherId)}
            aria-current={isSelected ? 'true' : undefined}
            p="md"
            bg={isSelected ? 'var(--mantine-color-blue-0)' : 'white'}
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              transition: 'background-color 150ms ease',
            }}
          >
            <Group gap="sm" wrap="nowrap" align="center">
              <Avatar
                src={teacher.photoUrl}
                name={teacher.name}
                alt={teacher.name}
                radius="xl"
                color="blue"
              />
              <Text fw={500}>{teacher.name}</Text>
            </Group>
          </UnstyledButton>
        )
      })}
    </Stack>
  )
}
