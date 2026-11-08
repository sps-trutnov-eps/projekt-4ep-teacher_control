import { Avatar, Stack, Text, UnstyledButton } from '@mantine/core'
import classes from '../Recenze.module.css'
import { formatReviewCount, formatTeacherName } from '../format'
import type { ReviewTeacher } from '../types'
import { IconChevronRight } from './icons'
import { StarRating } from './StarRating'

interface TeacherCardProps {
  teacher: ReviewTeacher
  isActive: boolean
  onSelect: (teacherId: number) => void
}

export function TeacherCard({ teacher, isActive, onSelect }: TeacherCardProps) {
  const name = formatTeacherName(teacher)

  return (
    <UnstyledButton
      className={classes.teacherCard}
      data-active={isActive || undefined}
      aria-current={isActive ? 'true' : undefined}
      aria-label={`${name}. Zobrazit recenze`}
      onClick={() => onSelect(teacher.id)}
    >
      <Avatar
        src={teacher.photoUrl}
        name={teacher.name}
        size={64}
        radius="xl"
        classNames={{ placeholder: classes.avatar }}
      />

      <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
        <Text className={classes.teacherName} truncate>
          {name}
        </Text>
        <Text className={classes.muted} lineClamp={2}>
          {teacher.description}
        </Text>
        {teacher.averageRating !== null ? (
          <StarRating
            value={teacher.averageRating}
            showValue
            suffix={`(${formatReviewCount(teacher.reviewCount)})`}
          />
        ) : (
          <Text className={classes.muted}>Zatím bez recenzí</Text>
        )}
      </Stack>

      <span className={classes.chevronBox}>
        <IconChevronRight size={20} />
      </span>
    </UnstyledButton>
  )
}
