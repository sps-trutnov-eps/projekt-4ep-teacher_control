import { Group, Text } from '@mantine/core'
import { Rating } from '@mantine/core'

interface TeacherStarsProps {
  rating: number
}

/** Hvězdičkové hodnocení učitele 1–5, jako v designu (jen pro čtení). */
export function TeacherStars({ rating }: TeacherStarsProps) {
  return (
    <Group gap="xs" aria-label={`Hodnocení učitele: ${rating} z 5`}>
      <Rating value={rating} fractions={2} readOnly />
      <Text size="sm" c="dimmed">
        {rating.toFixed(1)}
      </Text>
    </Group>
  )
}
