import { UnstyledButton, Text, Group, Avatar, Stack, Rating } from '@mantine/core'
import type { Teacher } from '../types'

interface TeacherListProps {
  teachers: Teacher[]
  selectedTeacherId: string | null
  onSelect: (teacherId: string) => void
}

export function TeacherList({ teachers, selectedTeacherId, onSelect }: TeacherListProps) {
  return (
    <Stack gap={0} bd="1px solid var(--mantine-color-gray-3)">
      {teachers.map((teacher) => (
        <UnstyledButton
          key={teacher.id}
          onClick={() => onSelect(teacher.id)}
          p="md"
          bg={selectedTeacherId === teacher.id ? 'var(--mantine-color-blue-0)' : 'white'}
          style={{
            borderBottom: '1px solid var(--mantine-color-gray-3)',
            transition: 'background-color 150ms ease',
          }}
        >
          <Group gap="sm" wrap="nowrap" align="center">
            <Avatar src={teacher.photoUrl} alt={`${teacher.firstName} ${teacher.lastName}`} radius="xl" color="blue" />
            <Stack gap={4}>
              <Text fw={500} size="md" lh={1}>
                {teacher.firstName} {teacher.lastName}
              </Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed" lh={1}>
                  Rating:
                </Text>
                <Rating value={teacher.ratings.overall} readOnly size="xs" color="yellow" />
              </Group>
            </Stack>
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  )
}
