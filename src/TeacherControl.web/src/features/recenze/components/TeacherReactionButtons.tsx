import { Group, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useAuth } from '@/shared/auth'
import { useTeacherReaction } from '../api'
import classes from '../Recenze.module.css'
import type { ReviewTeacherDetail } from '../types'
import { IconThumbDown, IconThumbUp } from './icons'

interface TeacherReactionButtonsProps {
  teacher: ReviewTeacherDetail
}

export function TeacherReactionButtons({ teacher }: TeacherReactionButtonsProps) {
  const { isAuthenticated } = useAuth()
  const setReaction = useTeacherReaction()

  const handleReaction = (value: 1 | -1) => {
    setReaction.mutate(
      { teacherId: teacher.id, value },
      {
        onError: () =>
          notifications.show({
            color: 'red',
            message: 'Reakci se nepodařilo uložit. Zkus to znovu.',
          }),
      },
    )
  }

  const disabled = !isAuthenticated || setReaction.isPending

  return (
    <Group gap={8} wrap="nowrap" mt="md" aria-label="Reakce na učitele">
      <Text className={classes.muted} visibleFrom="xs">
        Jaký je váš názor?
      </Text>
      <Tooltip label="Reagovat můžou jen přihlášení" disabled={isAuthenticated}>
        <Group gap={8} wrap="nowrap">
          <UnstyledButton
            className={classes.voteButton}
            data-kind="like"
            data-active={teacher.myReaction === 1 || undefined}
            aria-pressed={teacher.myReaction === 1}
            aria-label={`Líbí se mi učitel (${teacher.likes})`}
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
            aria-label={`Nelíbí se mi učitel (${teacher.dislikes})`}
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
