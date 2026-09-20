import { Box, Text, Tooltip } from '@mantine/core'
import { MOOD_LABELS, getMoodLevel } from '../mood'

const SEGMENT_COUNT = 6

interface MoodThermometerProps {
  averageDelayMinutes: number
}

/**
 * Náladový teploměr — svislá stupnice rozdělená do segmentů podle průměrného zpoždění.
 * Zelená dole (dobrá nálada), červená nahoře (špatná nálada), podobně jako v designu.
 */
export function MoodThermometer({ averageDelayMinutes }: MoodThermometerProps) {
  const mood = getMoodLevel(averageDelayMinutes)
  const activeCount = Math.min(
    SEGMENT_COUNT,
    Math.max(1, Math.ceil((averageDelayMinutes / 30) * SEGMENT_COUNT)),
  )

  return (
    <Tooltip
      label={`${MOOD_LABELS[mood]} — průměrné zpoždění ${Math.round(averageDelayMinutes)} min`}
    >
      <Box
        aria-label={`Nálada učitele: ${MOOD_LABELS[mood]}`}
        p={6}
        style={{
          border: '2px solid var(--mantine-color-dark-4)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: 44,
        }}
      >
        {Array.from({ length: SEGMENT_COUNT }, (_, index) => {
          const fromBottom = SEGMENT_COUNT - 1 - index
          const isActive = fromBottom < activeCount
          const color = isActive ? (fromBottom < 2 ? 'green' : fromBottom < 4 ? 'yellow' : 'red') : 'gray'

          return (
            <Box
              key={index}
              h={22}
              bg={isActive ? color : 'gray.1'}
              style={{
                borderRadius: 4,
                border: '1px solid var(--mantine-color-dark-4)',
              }}
            />
          )
        })}
        <Text ta="center" size="xs" fw={600}>
          {Math.round(averageDelayMinutes)} min
        </Text>
      </Box>
    </Tooltip>
  )
}
