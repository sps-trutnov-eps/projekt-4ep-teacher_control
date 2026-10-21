import { Alert, Box, Paper, Stack, Tooltip } from '@mantine/core'
import { ApiError, formatRetryAfter, useSubmitMood } from '../api'
import { MOOD_COLORS, MOOD_LABELS, getMoodLevel } from '../mood'

interface MoodMeterProps {
  /** Hodnota nálady 1–5 z backendu. */
  mood: number
  /** V Hodnotit se dá hodnota změnit kliknutím na metr, v Zobrazit je jen pro čtení. */
  editable: boolean
  /** Id učitele — povinné v editovatelné variantě. */
  teacherId?: number
}

const LEVELS = [1, 2, 3, 4, 5] as const
const SEGMENTS_PER_LEVEL = 4

/** Barva segmentu podle úrovně 1–5 (dole zelená, nahoře červená). */
function colorForLevel(level: number): string {
  if (level <= 2) {
    return 'green'
  }

  return level === 3 ? 'yellow' : 'red'
}

/**
 * Metr nálady (design: svislá stupnice 1–5). Ukazuje jen náladu — zpoždění se zobrazuje
 * zvlášť. V Zobrazit je jen ukazatel, v Hodnotit funguje jako ovládání: klikneš na úroveň
 * 1–5 a hodnota se uloží (backend hodnotu přepíše, per učitel platí 30minutový cooldown).
 */
export function MoodMeter({ mood, editable, teacherId }: MoodMeterProps) {
  if (!editable) {
    return <MeterBody mood={mood} editable={false} />
  }

  if (teacherId === undefined) {
    throw new Error('MoodMeter v editovatelné variantě potřebuje teacherId.')
  }

  return <EditableMeter mood={mood} teacherId={teacherId} />
}

/** Statický vzhled metru pro zvolenou hodnotu — stejný pro čtení i editaci. */
function MeterBody({
  mood,
  editable,
  onPick,
  isPending,
}: {
  mood: number
  editable: boolean
  onPick?: (level: number) => void
  isPending?: boolean
}) {
  const filledLevels = Math.round(mood)

  return (
    <Tooltip
      label={
        MOOD_LABELS[getMoodLevel(mood)] +
        (editable ? ' — klikni na úroveň, kterou chceš nastavit' : '')
      }
    >
      <Paper
        p="xs"
        radius="xl"
        withBorder
        aria-label={`Nálada učitele: ${MOOD_LABELS[getMoodLevel(mood)]}`}
        style={(theme) => ({
          borderColor: theme.colors[MOOD_COLORS[getMoodLevel(mood)]][6],
          width: 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        })}
      >
        {[...LEVELS].reverse().map((level) => (
          <LevelGroup
            key={level}
            level={level}
            filledLevels={filledLevels}
            editable={editable}
            isPending={isPending ?? false}
            onPick={onPick}
          />
        ))}
      </Paper>
    </Tooltip>
  )
}

/** Jedna úroveň metru (skupina segmentů). Editovatelná varianta je tlačítko. */
function LevelGroup({
  level,
  filledLevels,
  editable,
  isPending,
  onPick,
}: {
  level: number
  filledLevels: number
  editable: boolean
  isPending: boolean
  onPick?: (level: number) => void
}) {
  const segments = Array.from({ length: SEGMENTS_PER_LEVEL }, (_, index) => {
    const fromBottom = (level - 1) * SEGMENTS_PER_LEVEL + (SEGMENTS_PER_LEVEL - 1 - index)
    const isActive = fromBottom < filledLevels * SEGMENTS_PER_LEVEL
    const segmentLevel = Math.floor(fromBottom / SEGMENTS_PER_LEVEL) + 1

    return (
      <Box
        key={index}
        flex={1}
        bg={isActive ? colorForLevel(segmentLevel) : 'gray.1'}
        style={{
          borderRadius: 2,
          border: '1px solid var(--mantine-color-dark-4)',
        }}
      />
    )
  })

  if (!editable) {
    return (
      <Box h={SEGMENTS_PER_LEVEL * 10} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {segments}
      </Box>
    )
  }

  return (
    <Tooltip label={`${level}/5 — ${MOOD_LABELS[getMoodLevel(level)]}`} position="left">
      <Box
        component="button"
        type="button"
        disabled={isPending}
        onClick={() => onPick?.(level)}
        aria-label={`Nastavit náladu na ${level} z 5 (${MOOD_LABELS[getMoodLevel(level)]})`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          height: SEGMENTS_PER_LEVEL * 10,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: isPending ? 'wait' : 'pointer',
        }}
      >
        {segments}
      </Box>
    </Tooltip>
  )
}

/** Metr v režimu Hodnotit: klik na úroveň 1–5 rovnou uloží, řeší pending i chyby. */
function EditableMeter({ mood, teacherId }: { mood: number; teacherId: number }) {
  const submitMood = useSubmitMood(teacherId)

  const pick = (level: number) => {
    submitMood.mutate({ value: level })
  }

  return (
    <Stack gap="xs" align="flex-start">
      {submitMood.isError ? (
        <Alert color="red" title="Chyba">
          {submitMood.error instanceof ApiError && submitMood.error.status === 429
            ? `Náladu tohohle učitele jsi nedávno měnil, zkus to znovu ${formatRetryAfter(submitMood.error.retryAfterSeconds)}.`
            : 'Náladu se nepodařilo uložit.'}
        </Alert>
      ) : null}
      <MeterBody mood={mood} editable onPick={pick} isPending={submitMood.isPending} />
    </Stack>
  )
}
