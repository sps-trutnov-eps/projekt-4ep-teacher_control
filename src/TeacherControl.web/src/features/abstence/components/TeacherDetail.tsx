import { Group, SegmentedControl, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { PageHeader } from '@/shared/ui'
import { useAuth } from '@/shared/auth'
import { getMoodLevel } from '../mood'
import type { Teacher } from '../types'
import { DelayForm } from './DelayForm'
import { MoodMeter } from './MoodMeter'
import { TeacherAvatar } from './TeacherAvatar'
import { TeacherStars } from './TeacherStars'

interface TeacherDetailProps {
  teacher: Teacher
}

/**
 * Detail učitele podle designu. Záložka Zobrazit: profil, dnešní zpoždění a metr nálady
 * jen pro čtení. Záložka Hodnotit: zadání zpoždění a metr nálady editovatelný kliknutím.
 */
export function TeacherDetail({ teacher }: TeacherDetailProps) {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState<'view' | 'rate'>('view')

  const moodLevel = getMoodLevel(teacher.mood)

  return (
    <Stack gap="md">
      <PageHeader title={teacher.name} description="Profil učitele — zpoždění a nálada" />

      <Group align="flex-start" gap="xl" wrap="nowrap">
        <Stack gap="sm" style={{ flex: 1 }}>
          <Group gap="md" wrap="nowrap">
            <TeacherAvatar
              name={teacher.name}
              photoUrl={teacher.photoUrl}
              moodLevel={moodLevel}
              size={96}
            />
            <Stack gap={4}>
              {teacher.rating !== null ? <TeacherStars rating={teacher.rating} /> : null}
              <Text size="sm" c="dimmed">
                Nálada podle zpětné vazby studentů
              </Text>
            </Stack>
          </Group>

          {isAuthenticated ? (
            <SegmentedControl
              fullWidth
              value={tab}
              onChange={setTab}
              aria-label="Menu profilu učitele"
              data={[
                { value: 'view', label: 'Zobrazit' },
                { value: 'rate', label: 'Hodnotit' },
              ]}
            />
          ) : null}

          {isAuthenticated && tab === 'rate' ? (
            <Stack gap="md">
              <DelayForm teacherId={teacher.teacherId} />
              <MoodMeter mood={teacher.mood} editable teacherId={teacher.teacherId} />
            </Stack>
          ) : (
            <Stack gap="xs">
              <MoodMeter mood={teacher.mood} editable={false} />
              <Text size="sm">
                Dnes nahlášeno{' '}
                <Text span fw={700}>
                  {teacher.lateArrivalMinutesToday} min
                </Text>{' '}
                zpoždění.
              </Text>
              <Text size="sm" c="dimmed">
                Zelené kolečko znamená dobrou náladu, červené špatnou.
              </Text>
            </Stack>
          )}
        </Stack>
      </Group>
    </Stack>
  )
}
