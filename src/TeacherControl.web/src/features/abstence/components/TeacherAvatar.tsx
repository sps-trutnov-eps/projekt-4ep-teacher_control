import { Avatar } from '@mantine/core'
import { MOOD_COLORS, MOOD_LABELS } from '../mood'
import type { MoodLevel } from '../types'

interface TeacherAvatarProps {
  /** Celé jméno učitele z backendu (fotky a fallback inicial si řeší Mantine). */
  name: string
  photoUrl: string | null
  moodLevel: MoodLevel
  size?: number | 'sm' | 'md' | 'lg'
}

/**
 * Fotka učitele s inicialami, obarvená podle nálady (zelená = dobrá, červená = špatná) —
 * kolečko ze seznamu v designu. Pro čtečky hlásí, co barva znamená.
 */
export function TeacherAvatar({ name, photoUrl, moodLevel, size = 'md' }: TeacherAvatarProps) {
  return (
    <Avatar
      src={photoUrl}
      size={size}
      color={MOOD_COLORS[moodLevel]}
      radius="xl"
      name={name}
      aria-label={`Nálada učitele: ${MOOD_LABELS[moodLevel]}`}
    />
  )
}
