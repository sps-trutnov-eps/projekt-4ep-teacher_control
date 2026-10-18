import { Alert, Avatar, Button, Group, Select, Skeleton, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { useTeacherReviews } from '../api'
import classes from '../Recenze.module.css'
import { formatReviewDate } from '../format'
import type { Review, ReviewSort } from '../types'
import { StarRating } from './StarRating'
import { VoteButtons } from './VoteButtons'

const PAGE_SIZE = 5

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'newest', label: 'Nejnovější' },
  { value: 'oldest', label: 'Nejstarší' },
  { value: 'best', label: 'Nejlépe hodnocené' },
  { value: 'helpful', label: 'Nejužitečnější' },
]

interface ReviewListProps {
  teacherId: string
  total: number
}

export function ReviewList({ teacherId, total }: ReviewListProps) {
  const [sort, setSort] = useState<ReviewSort>('newest')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const reviewsQuery = useTeacherReviews(teacherId, sort)

  return (
    <section className={classes.panel} aria-labelledby="recenze-list-title">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <h2 id="recenze-list-title" className={classes.sectionTitle}>
          Recenze ({total})
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

      {reviewsQuery.isPending ? (
        <Stack gap="md">
          <Skeleton height={96} radius="md" />
          <Skeleton height={96} radius="md" />
        </Stack>
      ) : reviewsQuery.isError ? (
        <Alert color="red" title="Chyba">
          Recenze se nepodařilo načíst. Zkus to prosím znovu.
        </Alert>
      ) : reviewsQuery.data.length === 0 ? (
        <Text className={classes.muted}>Tenhle učitel zatím nemá žádnou recenzi. Buď první!</Text>
      ) : (
        <Stack gap={0}>
          {reviewsQuery.data.slice(0, visibleCount).map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}

          {reviewsQuery.data.length > visibleCount ? (
            <Button
              variant="default"
              radius="md"
              mt="md"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Zobrazit další ({reviewsQuery.data.length - visibleCount})
            </Button>
          ) : null}
        </Stack>
      )}
    </section>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const author = review.authorName ?? 'Student (anonymně)'
  const meta = [review.className, formatReviewDate(review.createdAt)].filter(Boolean).join(' • ')

  return (
    <article className={classes.reviewCard}>
      <Stack gap={10}>
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
          <Group gap="sm" wrap="nowrap" miw={0}>
            <Avatar radius="xl" size={40} classNames={{ placeholder: classes.avatar }} />
            <Stack gap={0} miw={0}>
              <Text className={classes.reviewAuthor} truncate>
                {author}
              </Text>
              <Text className={classes.muted}>{meta}</Text>
            </Stack>
          </Group>
          <StarRating value={review.rating} suffix={`${review.rating}/5`} />
        </Group>

        {review.title ? <h3 className={classes.reviewTitle}>{review.title}</h3> : null}
        <p className={classes.reviewText}>{review.text}</p>

        <Group justify="flex-end">
          <VoteButtons review={review} />
        </Group>
      </Stack>
    </article>
  )
}
