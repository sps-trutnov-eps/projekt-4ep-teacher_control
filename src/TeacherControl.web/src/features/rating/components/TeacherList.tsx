import { UnstyledButton, Text, Group, Avatar, Stack } from '@mantine/core'
import type { TeacherProfile, TeacherListItem } from '../types'

type DisplayTeacher = TeacherProfile | TeacherListItem

interface TeacherListProps {
  teachers: DisplayTeacher[]
  selectedTeacherId: string | number | null
  onSelect: (teacherId: string | number) => void
}

function SimpleRating({ value }: { value: number }) {
  return (
    <Group gap={2}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? 'var(--mantine-color-yellow-5)' : 'none'}
          stroke={
            i <= Math.round(value) ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-gray-4)'
          }
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
      {teachers.map((teacher) => {
        const anyTeacher = teacher as unknown as Record<string, unknown>
        const id = teacher.id
        const isSelected = String(selectedTeacherId) === String(id)
        const name =
          (anyTeacher.full_name as string) ||
          (anyTeacher.fullName as string) ||
          (anyTeacher.name as string) ||
          'Jméno Příjmení'
        const photo =
          (anyTeacher.image_url as string) ||
          (anyTeacher.imageUrl as string) ||
          (anyTeacher.photoUrl as string) ||
          null
        const rating = Number(
          anyTeacher.rating ??
            anyTeacher.review ??
            anyTeacher.averageRating ??
            (anyTeacher.ratings as Record<string, unknown> | undefined)?.overall ??
            0,
        )

        return (
          <UnstyledButton
            key={String(id)}
            onClick={() => onSelect(id)}
            p="md"
            bg={isSelected ? 'var(--mantine-color-blue-0)' : 'white'}
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-3)',
              transition: 'background-color 150ms ease',
            }}
          >
            <Group gap="sm" wrap="nowrap" align="center">
              <Avatar src={photo} alt={name} radius="xl" color="blue" />
              <Stack gap={4}>
                <Text fw={500} size="md" lh={1}>
                  {name}
                </Text>
                <Group gap={6}>
                  <Text size="xs" c="dimmed" lh={1}>
                    Rating:
                  </Text>
                  <SimpleRating value={rating} />
                </Group>
              </Stack>
            </Group>
          </UnstyledButton>
        )
      })}
    </Stack>
  )
}
