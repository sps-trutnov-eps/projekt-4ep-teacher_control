import { Alert, Avatar, Button, Group, Skeleton, Stack, Text } from '@mantine/core'
import { useAuth } from '@/shared/auth'
import { useReviewTeacher } from '../api'
import classes from '../Recenze.module.css'
import { formatRating, formatReviewCount } from '../format'
import { BRAND } from '../theme'
import type { Review, ReviewTeacherDetail } from '../types'
import { IconArrowLeft, IconPencil } from './icons'
import { ReactionButtons } from './ReactionButtons'
import { ReviewList } from './ReviewList'
import { StarRating } from './StarRating'

interface TeacherDetailProps {
  teacherId: number
  onBack: () => void
  onWrite: () => void
  onEdit: (review: Review) => void
}

/** Pravá část stránky: profil učitele, Like/Dislike a recenze. */
export function TeacherDetail({ teacherId, onBack, onWrite, onEdit }: TeacherDetailProps) {
  const { data: teacher, isPending, isError } = useReviewTeacher(teacherId)

  return (
    <Stack gap="md">
      <BackButton onClick={onBack} label="Zpět na seznam" />

      {isPending ? (
        <DetailSkeleton />
      ) : isError ? (
        <Alert color="red" title="Chyba">
          Profil učitele se nepodařilo načíst. Zkus to prosím znovu.
        </Alert>
      ) : (
        <>
          <ProfileCard teacher={teacher} />
          <WriteReviewAction
            hasOwnReview={teacher.reviews.some((review) => review.isMine)}
            onWrite={onWrite}
          />
          <ReviewList key={teacher.id} reviews={teacher.reviews} onEdit={onEdit} />
        </>
      )}
    </Stack>
  )
}

export function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className={classes.backButton} onClick={onClick} aria-label={label}>
      <IconArrowLeft size={20} />
      Zpět
    </button>
  )
}

function ProfileCard({ teacher }: { teacher: ReviewTeacherDetail }) {
  return (
    <section className={classes.panel} aria-label="Profil učitele">
      <Stack gap="lg">
        <Group gap="lg" wrap="nowrap" align="center">
          <Avatar
            src={teacher.photoUrl}
            name={teacher.name}
            size={112}
            radius={999}
            classNames={{ placeholder: classes.avatar }}
            visibleFrom="xs"
          />
          <Avatar
            src={teacher.photoUrl}
            name={teacher.name}
            size={72}
            radius={999}
            classNames={{ placeholder: classes.avatar }}
            hiddenFrom="xs"
          />
          <Stack gap={8} miw={0}>
            <h2 className={classes.profileName}>{teacher.name}</h2>
            {teacher.nickname ? <Text className={classes.muted}>„{teacher.nickname}“</Text> : null}
            {teacher.averageRating !== null ? (
              <Group gap="sm" align="center">
                <StarRating value={teacher.averageRating} size="lg" />
                <Text className={classes.bigRating}>{formatRating(teacher.averageRating)}</Text>
                <Text className={classes.muted}>({formatReviewCount(teacher.reviewCount)})</Text>
              </Group>
            ) : (
              <Text className={classes.muted}>Zatím bez hodnocení</Text>
            )}
          </Stack>
        </Group>

        {teacher.description ? <Text>{teacher.description}</Text> : null}

        <Group justify="flex-end">
          <ReactionButtons teacher={teacher} />
        </Group>
      </Stack>
    </section>
  )
}

interface WriteReviewActionProps {
  hasOwnReview: boolean
  onWrite: () => void
}

function WriteReviewAction({ hasOwnReview, onWrite }: WriteReviewActionProps) {
  const { hasRole } = useAuth()

  // Recenze píšou studenti — oprávnění podle role, ne podle jména.
  const isStudent = hasRole('student')
  // Backend povolí jednu textovou recenzi na učitele; další jde až po smazání.
  const canWrite = isStudent && !hasOwnReview

  return (
    <Stack gap={8}>
      <Button
        color={BRAND.primary}
        size="lg"
        radius="md"
        fullWidth
        leftSection={<IconPencil size={20} />}
        disabled={!canWrite}
        onClick={onWrite}
      >
        Napsat recenzi
      </Button>
      {!isStudent ? (
        <Text className={classes.muted} ta="center">
          Recenze můžou psát jen studenti. Ve vývoji si uživatele přepneš vpravo nahoře.
        </Text>
      ) : hasOwnReview ? (
        <Text className={classes.muted} ta="center">
          Tomuhle učiteli už jsi recenzi napsal(a). Můžeš ji upravit nebo smazat níže.
        </Text>
      ) : null}
    </Stack>
  )
}

function DetailSkeleton() {
  return (
    <Stack gap="md" aria-label="Načítám profil učitele">
      <Skeleton height={260} radius={12} />
      <Skeleton height={50} radius={8} />
      <Skeleton height={220} radius={12} />
    </Stack>
  )
}
