import { Avatar } from '@mantine/core'
import { MOOD_LABELS } from '../mood'
import type { MoodLevel } from '../types'

interface TeacherAvatarProps {
  firstName: string
  lastName: string
  photoUrl: string | null
  moodColor: string
  mood: MoodLevel
  size?: number | 'sm' | 'md' | 'lg'
}

/**
 * Fotka učitele s inicialami, obarvená podle nálady (zelená = dobrá, červená = špatná) —
 * kolečko ze seznamu v designu. Pro čtečky hlásí, co barva znamená.
 */
export function TeacherAvatar({
  firstName,
  lastName,
  photoUrl,
  moodColor,
  mood,
  size = 'md',
}: TeacherAvatarProps) {
  return (
    <Avatar
      src={photoUrl}
      size={size}
      color={moodColor}
      radius="xl"
      name={`${firstName} ${lastName}`}
      aria-label={`Nálada učitele: ${MOOD_LABELS[mood]}`}
    >
      {`${firstName[0] ?? ''}${lastName[0] ?? ''}`}
    </Avatar>
  )
}
