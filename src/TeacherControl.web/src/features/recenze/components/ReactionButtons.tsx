import { Group, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useAuth } from '@/shared/auth'
import { useSetReaction } from '../api'
import classes from '../Recenze.module.css'
import type { ReactionValue, ReviewTeacher } from '../types'
import { IconThumbDown, IconThumbUp } from './icons'

interface ReactionButtonsProps {
  teacher: ReviewTeacher
}

export function ReactionButtons({ teacher }: ReactionButtonsProps) {
  const { isAuthenticated } = useAuth()
  const setReaction = useSetReaction()

  const handleReaction = (value: ReactionValue) => {
    setReaction.mutate(
      { teacherId: teacher.id, value },
      {
        onError: () =>
          notifications.show({
            color: 'red',
            message: 'Hlas se nepodařilo uložit. Zkus to znovu.',
          }),
      },
    )
  }

  const disabled = !isAuthenticated || setReaction.isPending

  return (
    <Group gap={8} wrap="nowrap">
      <Text className={classes.muted} visibleFrom="xs">
        Líbí se vám tenhle učitel?
      </Text>
      <Tooltip label="Hlasovat můžou jen přihlášení" disabled={isAuthenticated}>
        <Group gap={8} wrap="nowrap">
          <UnstyledButton
            className={classes.voteButton}
            data-kind="like"
            data-active={teacher.myReaction === 1 || undefined}
            aria-pressed={teacher.myReaction === 1}
            aria-label={`Líbí se mi (${teacher.likes})`}
            disabled={disabled || teacher.myReaction === 1}
            onClick={() => handleReaction(1)}
          >
            <IconThumbUp size={18} />
            {teacher.likes}
          </UnstyledButton>
          <UnstyledButton
            className={classes.voteButton}
            data-kind="dislike"
            data-active={teacher.myReaction === -1 || undefined}
            aria-pressed={teacher.myReaction === -1}
            aria-label={`Nelíbí se mi (${teacher.dislikes})`}
            disabled={disabled || teacher.myReaction === -1}
            onClick={() => handleReaction(-1)}
          >
            <IconThumbDown size={18} />
            {teacher.dislikes}
          </UnstyledButton>
        </Group>
      </Tooltip>
    </Group>
  )
}
