import { Alert, Divider, Group, Loader, SegmentedControl, Stack, Text, Title } from '@mantine/core'
import { useState } from 'react'
import { PageHeader } from '@/shared/ui'
import { useAuth } from '@/shared/auth'
import { useTeacherDelays } from '../api'
import { MOOD_COLORS, getMoodLevel } from '../mood'
import type { MoodLevel } from '../types'
import { formatDateTime } from '@/shared/lib'
import type { Teacher } from '../types'
import { DelayForm } from './DelayForm'
import { MoodThermometer } from './MoodThermometer'
import { TeacherAvatar } from './TeacherAvatar'
import { TeacherStars } from './TeacherStars'

interface TeacherDetailProps {
  teacher: Teacher
}

/**
 * Detail učitele: profil s náladovým teploměrem. Dvě záložky z designu —
 * "Zobrazit" (profil a historie) a "Hodnotit" (zadání zpoždění).
 */
export function TeacherDetail({ teacher }: TeacherDetailProps) {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState('view')

  const moodColor = MOOD_COLORS[getMoodLevel(teacher.averageDelayMinutes)]
  const fullName = `${teacher.firstName} ${teacher.lastName}`

  return (
    <Stack gap="md">
      <PageHeader title={fullName} description="Profil učitele — zpoždění a nálada" />

      <Group align="flex-start" gap="xl" wrap="nowrap">
        <Stack gap="sm" style={{ flex: 1 }}>
          <Group gap="md" wrap="nowrap">
            <TeacherAvatar
              firstName={teacher.firstName}
              lastName={teacher.lastName}
              photoUrl={teacher.photoUrl}
              moodColor={moodColor}
              mood={getMoodLevel(teacher.averageDelayMinutes) as MoodLevel}
              size={96}
            />
            <Stack gap={4}>
              <TeacherStars rating={teacher.rating} />
              <Text size="sm" c="dimmed">
                Nálada podle průměrného zpoždění
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
            <DelayForm teacherId={teacher.id} />
          ) : (
            <TeacherProfile teacher={teacher} />
          )}
        </Stack>

        <MoodThermometer averageDelayMinutes={teacher.averageDelayMinutes} />
      </Group>
    </Stack>
  )
}

function TeacherProfile({ teacher }: { teacher: Teacher }) {
  const delaysQuery = useTeacherDelays(teacher.id)

  return (
    <Stack gap="xs">
      <Title order={4}>Nahlášená zpoždění</Title>
      {delaysQuery.isPending ? (
        <Loader size="sm" />
      ) : delaysQuery.isError ? (
        <Alert color="red" title="Chyba">
          Zpoždění se nepodařilo načíst.
        </Alert>
      ) : delaysQuery.data.length === 0 ? (
        <Text c="dimmed">Zatím tu nejsou žádná nahlášená zpoždění.</Text>
      ) : (
        <Stack gap={4}>
          {delaysQuery.data.map((delay) => (
            <Text key={delay.id} size="sm">
              +{delay.minutes} min — {delay.authorName} ({formatDateTime(delay.createdAt)})
            </Text>
          ))}
        </Stack>
      )}

      <Divider my="xs" />
      <Text size="sm" c="dimmed">
        Zelené kolečko znamená dobrou náladu, červené špatnou. Barvu určuje průměrné zpoždění
        učitele po zvonění.
      </Text>
    </Stack>
  )
}
