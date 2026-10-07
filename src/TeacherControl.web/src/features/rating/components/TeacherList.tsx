import { UnstyledButton, Text, Group, Avatar, Stack } from '@mantine/core'
import type { Teacher } from '../types'

interface TeacherListProps {
  teachers: Teacher[]
  selectedTeacherId: string | null
  onSelect: (teacherId: string) => void
}

function SimpleRating({ value }: { value: number }) {
  return (
    <Group gap={2}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i <= value ? 'var(--mantine-color-yellow-5)' : 'none'}
          stroke={i <= value ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-gray-4)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
        </svg>
      ))}
    </Group>
  )
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
            <Avatar
              src={teacher.photoUrl}
              alt={`${teacher.firstName} ${teacher.lastName}`}
              radius="xl"
              color="blue"
            />
            <Stack gap={4}>
              <Text fw={500} size="md" lh={1}>
                {teacher.firstName} {teacher.lastName}
              </Text>
              <Group gap={6}>
                <Text size="xs" c="dimmed" lh={1}>
                  Rating:
                </Text>
                <SimpleRating value={teacher.ratings.overall} />
              </Group>
            </Stack>
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  )
}
