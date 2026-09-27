import { Group, Paper, Stack, Text, UnstyledButton } from '@mantine/core'
import { MOOD_COLORS, getMoodLevel } from '../mood'
import type { MoodLevel } from '../types'
import type { Teacher } from '../types'
import { TeacherAvatar } from './TeacherAvatar'
import { TeacherStars } from './TeacherStars'

interface TeacherListItemProps {
  teacher: Teacher
  isExpanded: boolean
  onToggle: () => void
  children?: React.ReactNode
}

/**
 * Řádek učitele v seznamu. Na mobilu se rozklikne (design: šipka nahoru/dolů),
 * na desktopu slouží jako výběr učitele do detailu vedle.
 */
export function TeacherListItem({ teacher, isExpanded, onToggle, children }: TeacherListItemProps) {
  const moodColor = MOOD_COLORS[getMoodLevel(teacher.averageDelayMinutes)]
  const fullName = `${teacher.firstName} ${teacher.lastName}`

  return (
    <Paper
      withBorder
      p="md"
      style={(theme) => ({
        borderColor: isExpanded ? theme.colors[moodColor][6] : undefined,
      })}
    >
      <UnstyledButton onClick={onToggle} w="100%">
        <Stack gap="xs">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md" wrap="nowrap">
            <TeacherAvatar
              firstName={teacher.firstName}
              lastName={teacher.lastName}
              photoUrl={teacher.photoUrl}
              moodColor={moodColor}
              mood={getMoodLevel(teacher.averageDelayMinutes) as MoodLevel}
            />
              <Stack gap={0} align="flex-start">
                <Text fw={700}>{fullName}</Text>
                <TeacherStars rating={teacher.rating} />
              </Stack>
            </Group>

            <Text size="xl" aria-label={isExpanded ? 'Sbalit detail učitele' : 'Rozbalit detail učitele'}>
              {isExpanded ? '▲' : '▼'}
            </Text>
          </Group>

          {isExpanded && children ? <Stack gap="sm">{children}</Stack> : null}
        </Stack>
      </UnstyledButton>
    </Paper>
  )
}
