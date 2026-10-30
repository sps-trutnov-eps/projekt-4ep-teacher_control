import { UnstyledButton, Text, Group, Avatar, Stack, Rating } from '@mantine/core'
import { DEFAULT_TEACHER_IMAGE, type TeacherListItem } from '../types'

interface TeacherListProps {
  teachers: TeacherListItem[]
  selectedTeacherId: number | null
  onSelect: (teacherId: number) => void
}

export function TeacherList({ teachers, selectedTeacherId, onSelect }: TeacherListProps) {
  return (
    <Stack gap={0} bd="1px solid var(--mantine-color-default-border)">
      {teachers.map((teacher) => (
        <UnstyledButton
          key={teacher.id}
          onClick={() => onSelect(teacher.id)}
          p="md"
          bg={selectedTeacherId === teacher.id ? 'brand.0' : undefined}
          style={{
            borderBottom: '1px solid var(--mantine-color-default-border)',
            transition: 'background-color 150ms ease',
          }}
        >
          <Group gap="sm" wrap="nowrap" align="center">
            <Avatar
              src={teacher.image_url || DEFAULT_TEACHER_IMAGE}
              name={teacher.full_name}
              alt={teacher.full_name}
              radius="xl"
              color="brand"
            />
            <Stack gap={4}>
              <Text fw={600} size="md" lh={1.2} c="brand.8">
                {teacher.full_name}
              </Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed" lh={1}>
                  Rating:
                </Text>
                {teacher.review !== null ? (
                  <Rating value={teacher.review} readOnly fractions={2} size="xs" />
                ) : (
                  <Text size="xs" c="dimmed" lh={1}>
                    Bez hodnocení
                  </Text>
                )}
              </Group>
            </Stack>
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  )
}
