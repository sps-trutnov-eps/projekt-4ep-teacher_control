import { Group, Rating, Text, type MantineSize } from '@mantine/core'
import classes from '../Recenze.module.css'
import { formatRating } from '../format'
import { BRAND } from '../theme'

interface StarRatingProps {
  value: number
  size?: MantineSize | number
  /** Číslo vedle hvězdiček, např. „4,2“. */
  showValue?: boolean
  suffix?: string
}

/** Hvězdičky 1–5 jen pro čtení (zlatá / světle šedá podle designu). */
export function StarRating({ value, size = 'sm', showValue = false, suffix }: StarRatingProps) {
  return (
    <Group gap={8} wrap="nowrap" aria-label={`Hodnocení ${formatRating(value)} z 5`} role="img">
      <Rating
        value={value}
        fractions={2}
        readOnly
        size={size}
        color={BRAND.star}
        classNames={{ starSymbol: classes.star }}
        aria-hidden="true"
      />
      {showValue ? (
        <Text span size="sm" className={classes.ratingValue}>
          {formatRating(value)}
        </Text>
      ) : null}
      {suffix ? (
        <Text span size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          {suffix}
        </Text>
      ) : null}
    </Group>
  )
}
