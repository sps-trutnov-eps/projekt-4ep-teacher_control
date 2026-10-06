import { Box, Paper, Tooltip } from '@mantine/core'
import { MOOD_COLORS, MOOD_LABELS, getMoodLevel } from '../mood'

interface MoodMeterProps {
  /** Hodnota nálady 1–5 — vybraná úroveň, nebo hodnota z backendu. */
  mood: number
  /** V Hodnotit se dá hodnota vybrat kliknutím, v Zobrazit je jen pro čtení. */
  editable: boolean
  /** Klik na úroveň 1–5. Výběr se uloží až tlačítkem "Uložit" ve formuláři. */
  onSelect?: (level: number) => void
}

const LEVELS = [1, 2, 3, 4, 5] as const
const SEGMENTS_PER_LEVEL = 4

// Segmenty jsou záměrně drobné — metr sedí vedle profilu, kde původní rozměr vypadal jako sloupek.
const SEGMENT_HEIGHT = 7
const SEGMENT_GAP = 1
const LEVEL_GAP = 2
const LEVEL_HEIGHT = SEGMENTS_PER_LEVEL * SEGMENT_HEIGHT + (SEGMENTS_PER_LEVEL - 1) * SEGMENT_GAP

/** Barva segmentu podle úrovně 1–5 (dole zelená, nahoře červená). */
function colorForLevel(level: number): string {
  if (level <= 2) {
    return 'green'
  }

  return level === 3 ? 'yellow' : 'red'
}

/**
 * Metr nálady (design: svislá stupnice 1–5). Ukazuje jen náladu — zpoždění se zobrazuje
 * zvlášť. V Zobrazit je jen ukazatel, v Hodnotit jde kliknutím na úroveň 1–5 vybrat hodnotu;
 * na backend se ale nic neposílá, klik se uloží až tlačítkem "Uložit" ve formuláři na zpoždění.
 */
export function MoodMeter({ mood, editable, onSelect }: MoodMeterProps) {
  if (!editable) {
    return <MeterBody mood={mood} editable={false} />
  }

  if (onSelect === undefined) {
    throw new Error('MoodMeter v editovatelné variantě potřebuje onSelect.')
  }

  return <MeterBody mood={mood} editable onPick={onSelect} />
}

/** Statický vzhled metru pro zvolenou hodnotu — stejný pro čtení i výběr. */
function MeterBody({
  mood,
  editable,
  onPick,
}: {
  mood: number
  editable: boolean
  onPick?: (level: number) => void
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
        p={6}
        radius="xl"
        withBorder
        aria-label={`Nálada učitele: ${MOOD_LABELS[getMoodLevel(mood)]}`}
        style={(theme) => ({
          borderColor: theme.colors[MOOD_COLORS[getMoodLevel(mood)]][6],
          width: 44,
          display: 'flex',
          flexDirection: 'column',
          gap: LEVEL_GAP,
        })}
      >
        {[...LEVELS].reverse().map((level) => (
          <LevelGroup
            key={level}
            level={level}
            filledLevels={filledLevels}
            editable={editable}
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
  onPick,
}: {
  level: number
  filledLevels: number
  editable: boolean
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
      <Box h={LEVEL_HEIGHT} style={{ display: 'flex', flexDirection: 'column', gap: SEGMENT_GAP }}>
        {segments}
      </Box>
    )
  }

  return (
    <Tooltip label={`${level}/5 — ${MOOD_LABELS[getMoodLevel(level)]}`} position="left">
      <Box
        component="button"
        type="button"
        onClick={() => onPick?.(level)}
        aria-label={`Nastavit náladu na ${level} z 5 (${MOOD_LABELS[getMoodLevel(level)]})`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SEGMENT_GAP,
          width: '100%',
          height: LEVEL_HEIGHT,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        {segments}
      </Box>
    </Tooltip>
  )
}
