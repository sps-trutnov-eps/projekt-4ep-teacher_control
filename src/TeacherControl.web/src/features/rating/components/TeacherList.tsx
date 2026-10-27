import { UnstyledButton, Text, Group, Avatar, Stack } from '@mantine/core'
import type { TeacherListItem } from '../types'

interface TeacherListProps {
  teachers: TeacherListItem[]
  selectedTeacherId: number | null
  onSelect: (teacherId: number) => void
}

function SimpleRating({ value }: { value: number | null }) {
  const rounded = Math.round(value ?? 0)

  return (
    <Group gap={2}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill={i <= rounded ? '#D99A17' : '#CBD5E1'}
          stroke={i <= rounded ? '#D99A17' : '#CBD5E1'}
          strokeWidth="1.5"
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
    <Stack gap={0} bd="1px solid #D9E3F0">
      {teachers.map((teacher) => (
        <UnstyledButton
          key={teacher.id}
          onClick={() => onSelect(teacher.id)}
          p={16}
          bg={selectedTeacherId === teacher.id ? '#EAF2FF' : '#FFFFFF'}
          style={{
            borderBottom: '1px solid #D9E3F0',
            transition: 'background-color 150ms ease',
          }}
        >
          <Group gap={12} wrap="nowrap" align="center">
            <Avatar
              src={teacher.image_url}
              name={teacher.full_name}
              alt={teacher.full_name}
              radius="xl"
              color="#1655A3"
            />
            <Stack gap={4}>
              <Text fw={600} size="md" lh={1.2} c="#173B70" style={{ fontSize: '16px' }}>
                {teacher.full_name}
              </Text>
              <Group gap={6}>
                <Text size="xs" c="#64748B" lh={1} style={{ fontSize: '14px' }}>
                  Rating:
                </Text>
                {teacher.review !== null ? (
                  <SimpleRating value={teacher.review} />
                ) : (
                  <Text size="xs" c="#64748B" lh={1} style={{ fontSize: '14px' }}>
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
