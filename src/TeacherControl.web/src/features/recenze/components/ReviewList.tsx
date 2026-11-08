import { Avatar, Button, Group, Select, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useDeleteReview } from '../api'
import classes from '../Recenze.module.css'
import { formatReviewDate } from '../format'
import type { Review, ReviewSort } from '../types'

const PAGE_SIZE = 5

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'newest', label: 'Nejnovější' },
  { value: 'oldest', label: 'Nejstarší' },
]

const REVIEW_SORTERS: Record<ReviewSort, (a: Review, b: Review) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
}

interface ReviewListProps {
  reviews: Review[]
  onEdit: (review: Review) => void
}

export function ReviewList({ reviews, onEdit }: ReviewListProps) {
  const [sort, setSort] = useState<ReviewSort>('newest')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sorted = [...reviews].sort(REVIEW_SORTERS[sort])

  return (
    <section className={classes.panel} aria-labelledby="recenze-list-title">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <h2 id="recenze-list-title" className={classes.sectionTitle}>
          Recenze ({reviews.length})
        </h2>
        <Select
          aria-label="Řadit recenze"
          data={SORT_OPTIONS}
          value={sort}
          onChange={(value) => {
            if (!value) return
            setSort(value as ReviewSort)
            setVisibleCount(PAGE_SIZE)
          }}
          allowDeselect={false}
          w={190}
          radius="md"
        />
      </Group>

      {sorted.length === 0 ? (
        <Text className={classes.muted}>Tenhle učitel zatím nemá žádnou recenzi. Buď první!</Text>
      ) : (
        <Stack gap={0}>
          {sorted.slice(0, visibleCount).map((review) => (
            <ReviewItem key={review.id} review={review} onEdit={onEdit} />
          ))}

          {sorted.length > visibleCount ? (
            <Button
              variant="default"
              radius="md"
              mt="md"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Zobrazit další ({sorted.length - visibleCount})
            </Button>
          ) : null}
        </Stack>
      )}
    </section>
  )
}

function ReviewItem({ review, onEdit }: { review: Review; onEdit: (review: Review) => void }) {
  const deleteReview = useDeleteReview()
  const author = review.isMine ? 'Moje recenze' : 'Student (anonymně)'
  const meta = [formatReviewDate(review.createdAt), review.updatedAt ? 'upraveno' : null]
    .filter(Boolean)
    .join(' • ')

  const handleDelete = () => {
    if (!window.confirm('Opravdu chceš recenzi smazat?')) return

    deleteReview.mutate(review.id, {
      onError: () =>
        notifications.show({
          color: 'red',
          message: 'Recenzi se nepodařilo smazat. Zkus to znovu.',
        }),
    })
  }

  return (
    <article className={classes.reviewCard}>
      <Stack gap={10}>
        <Group gap="sm" wrap="nowrap" miw={0}>
          <Avatar radius="xl" size={40} classNames={{ placeholder: classes.avatar }} />
          <Stack gap={0} miw={0}>
            <Text className={classes.reviewAuthor} truncate>
              {author}
            </Text>
            <Text className={classes.muted}>{meta}</Text>
          </Stack>
        </Group>

        <p className={classes.reviewText}>{review.content}</p>

        {review.isMine ? (
          <Group justify="flex-end" gap={8}>
            <Button variant="default" radius="md" size="xs" onClick={() => onEdit(review)}>
              Upravit
            </Button>
            <Button
              variant="default"
              color="red"
              radius="md"
              size="xs"
              loading={deleteReview.isPending}
              onClick={handleDelete}
            >
              Smazat
            </Button>
          </Group>
        ) : null}
      </Stack>
    </article>
  )
}
