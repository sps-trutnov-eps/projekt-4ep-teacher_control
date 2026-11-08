import { Group, Paper, Stack, Text, UnstyledButton } from '@mantine/core'
import { MOOD_COLORS, getMoodLevel } from '../mood'
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
  const moodLevel = getMoodLevel(teacher.mood)

  return (
    <Paper
      withBorder
      p="md"
      style={(theme) => ({
        borderColor: isExpanded ? theme.colors[MOOD_COLORS[moodLevel]][6] : undefined,
      })}
    >
      <Stack gap="xs">
        {/* Rozbalený detail je mimo klikací řádek — jinak by v něm vznikala tlačítka v tlačítku. */}
        <UnstyledButton onClick={onToggle} w="100%">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md" wrap="nowrap">
              <TeacherAvatar
                name={teacher.name}
                photoUrl={teacher.photoUrl}
                moodLevel={moodLevel}
              />
              <Stack gap={0} align="flex-start">
                <Text fw={700}>{teacher.name}</Text>
                {teacher.rating !== null ? (
                  <TeacherStars rating={teacher.rating} />
                ) : (
                  <Text size="sm" c="dimmed">
                    Bez hodnocení
                  </Text>
                )}
              </Stack>
            </Group>

            <Text
              size="xl"
              aria-label={isExpanded ? 'Sbalit detail učitele' : 'Rozbalit detail učitele'}
            >
              {isExpanded ? '▲' : '▼'}
            </Text>
          </Group>
        </UnstyledButton>

        {isExpanded && children ? <Stack gap="sm">{children}</Stack> : null}
      </Stack>
    </Paper>
  )
}
