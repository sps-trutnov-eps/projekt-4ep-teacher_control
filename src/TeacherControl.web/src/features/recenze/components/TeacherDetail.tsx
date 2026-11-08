import { Alert, Avatar, Button, Group, Skeleton, Stack, Text } from '@mantine/core'
import { useAuth } from '@/shared/auth'
import { useReviewTeacher } from '../api'
import classes from '../Recenze.module.css'
import { formatRating, formatReviewCount, formatTeacherName } from '../format'
import { BRAND } from '../theme'
import type { ReviewTeacherDetail } from '../types'
import { IconArrowLeft, IconPencil } from './icons'
import { ReviewList } from './ReviewList'
import { TeacherReactionButtons } from './TeacherReactionButtons'
import { StarRating } from './StarRating'

interface TeacherDetailProps {
  teacherId: number
  onBack: () => void
  onWrite: () => void
}

/** Teacher profile, reactions, and reviews. */
export function TeacherDetail({ teacherId, onBack, onWrite }: TeacherDetailProps) {
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
          <section className={classes.panel} aria-label="Popis učitele">
            <h2 className={classes.sectionTitle}>O učiteli</h2>
            {teacher.nickname ? (
              <Text fw={600} mt="sm">
                {teacher.nickname}
              </Text>
            ) : null}
            <Text className={classes.reviewText} mt="sm">
              {teacher.description}
            </Text>
            <Text className={classes.muted} mt="sm">
              Nálada: {formatRating(teacher.mood)}
            </Text>
            <TeacherReactionButtons teacher={teacher} />
          </section>
          <WriteReviewAction onWrite={onWrite} />
          <ReviewList key={teacher.id} teacherId={teacher.id} total={teacher.reviewCount} />
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
  const name = formatTeacherName(teacher)

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
            <h2 className={classes.profileName}>{name}</h2>
            {teacher.averageRating !== null ? (
              <Group gap="sm" align="center">
                <StarRating value={teacher.averageRating} size="lg" />
                <Text className={classes.bigRating}>{formatRating(teacher.averageRating)}</Text>
                <Text className={classes.muted}>({formatReviewCount(teacher.reviewCount)})</Text>
              </Group>
            ) : (
              <Text className={classes.muted}>Zatím bez recenzí</Text>
            )}
          </Stack>
        </Group>
      </Stack>
    </section>
  )
}

function WriteReviewAction({ onWrite }: { onWrite: () => void }) {
  const { hasRole } = useAuth()

  // Recenze píšou studenti — oprávnění podle role, ne podle jména.
  const canWrite = hasRole('student')

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
      {canWrite ? null : (
        <Text className={classes.muted} ta="center">
          Recenze můžou psát jen studenti. Ve vývoji si uživatele přepneš vpravo nahoře.
        </Text>
      )}
    </Stack>
  )
}

function DetailSkeleton() {
  return (
    <Stack gap="md" aria-label="Načítám profil učitele">
      <Skeleton height={260} radius={12} />
      <Skeleton height={220} radius={12} />
      <Skeleton height={50} radius={8} />
    </Stack>
  )
}
