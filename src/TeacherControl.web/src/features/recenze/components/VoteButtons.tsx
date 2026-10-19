import { Group, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useAuth } from '@/shared/auth'
import { useVoteReview } from '../api'
import classes from '../Recenze.module.css'
import type { Review, ReviewVote } from '../types'
import { IconThumbDown, IconThumbUp } from './icons'

interface VoteButtonsProps {
  review: Review
}

/** Přepínač Like / Dislike u recenze. Druhé kliknutí na stejný hlas ho zruší. */
export function VoteButtons({ review }: VoteButtonsProps) {
  const { isAuthenticated } = useAuth()
  const voteReview = useVoteReview()

  const handleVote = (vote: ReviewVote) => {
    voteReview.mutate(
      { reviewId: review.id, vote: review.myVote === vote ? null : vote },
      {
        onError: () =>
          notifications.show({
            color: 'red',
            message: 'Hlas se nepodařilo uložit. Zkus to znovu.',
          }),
      },
    )
  }

  const disabled = !isAuthenticated || voteReview.isPending

  return (
    <Group gap={8} wrap="nowrap">
      <Text className={classes.muted} visibleFrom="xs">
        Pomohla vám recenze?
      </Text>
      <Tooltip label="Hlasovat můžou jen přihlášení" disabled={isAuthenticated}>
        <Group gap={8} wrap="nowrap">
          <UnstyledButton
            className={classes.voteButton}
            data-kind="like"
            data-active={review.myVote === 'like' || undefined}
            aria-pressed={review.myVote === 'like'}
            aria-label={`Líbí se mi (${review.likes})`}
            disabled={disabled}
            onClick={() => handleVote('like')}
          >
            <IconThumbUp size={18} />
            {review.likes}
          </UnstyledButton>
          <UnstyledButton
            className={classes.voteButton}
            data-kind="dislike"
            data-active={review.myVote === 'dislike' || undefined}
            aria-pressed={review.myVote === 'dislike'}
            aria-label={`Nelíbí se mi (${review.dislikes})`}
            disabled={disabled}
            onClick={() => handleVote('dislike')}
          >
            <IconThumbDown size={18} />
            {review.dislikes}
          </UnstyledButton>
        </Group>
      </Tooltip>
    </Group>
  )
}
