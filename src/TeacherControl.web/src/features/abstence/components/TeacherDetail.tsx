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
 * Detail učitele podle designu. Metr nálady sedí podle návrhu vpravo nahoře profilu.
 * Záložka Zobrazit: dnešní zpoždění a metr jen pro čtení. Záložka Hodnotit: metr jde vybrat
 * kliknutím, ale na backend se hodnota odešle až tlačítkem "Uložit" ve formuláři.
 */
export function TeacherDetail({ teacher }: TeacherDetailProps) {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState<'view' | 'rate'>('view')
  // Klik na úroveň v metru je zatím jen lokální výběr, aby šlo chybu opravit před uložením.
  const [selectedMood, setSelectedMood] = useState<number | null>(null)

  const canRate = isAuthenticated && tab === 'rate'
  const shownMood = selectedMood ?? teacher.mood
  const moodLevel = getMoodLevel(shownMood)
  // Posílá se jen hodnota, která se proti backendu opravdu změnila (sdílený cooldown).
  const moodToSave = selectedMood !== null && selectedMood !== teacher.mood ? selectedMood : null

  return (
    <Stack gap="md">
      <PageHeader title={teacher.name} description="Profil učitele — zpoždění a nálada" />

      {/* wrap="nowrap" drží metr vpravo i na mobilu — jinak by spadl na vlastní řádek vlevo. */}
      <Group align="flex-start" justify="space-between" gap="md" wrap="nowrap">
        <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <TeacherAvatar
            name={teacher.name}
            photoUrl={teacher.photoUrl}
            moodLevel={moodLevel}
            size={96}
          />
          <Stack gap={4} style={{ minWidth: 0 }}>
            {teacher.rating !== null ? <TeacherStars rating={teacher.rating} /> : null}
            <Text size="sm" c="dimmed">
              Nálada podle zpětné vazby studentů
            </Text>
          </Stack>
        </Group>

        <MoodMeter mood={shownMood} editable={canRate} onSelect={setSelectedMood} />
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

      {canRate ? (
        <DelayForm teacherId={teacher.teacherId} mood={moodToSave} />
      ) : (
        <Stack gap="xs">
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
  )
}
