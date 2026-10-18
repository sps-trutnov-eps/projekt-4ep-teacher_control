import { Alert, Avatar, Badge, Button, Group, Progress, Skeleton, Stack, Text } from '@mantine/core'
import { useAuth } from '@/shared/auth'
import { useReviewTeacher } from '../api'
import classes from '../Recenze.module.css'
import { formatRating, formatReviewCount, formatTeacherName } from '../format'
import { BRAND } from '../theme'
import type { ReviewTeacherDetail } from '../types'
import { IconArrowLeft, IconBook, IconPencil, IconSchool, IconUsers } from './icons'
import { ReviewList } from './ReviewList'
import { StarRating } from './StarRating'

interface TeacherDetailProps {
  teacherId: string
  onBack: () => void
  onWrite: () => void
}

/** Pravá část stránky: profil učitele, hodnocení v kategoriích a recenze. */
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
          <CategoryBars teacher={teacher} />
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
            name={`${teacher.firstName} ${teacher.lastName}`}
            size={112}
            radius={999}
            classNames={{ placeholder: classes.avatar }}
            visibleFrom="xs"
          />
          <Avatar
            src={teacher.photoUrl}
            name={`${teacher.firstName} ${teacher.lastName}`}
            size={72}
            radius={999}
            classNames={{ placeholder: classes.avatar }}
            hiddenFrom="xs"
          />
          <Stack gap={8} miw={0}>
            <h2 className={classes.profileName}>{name}</h2>
            <Badge className={classes.subjectBadge} radius="sm" size="lg" w="fit-content">
              {teacher.subject}
            </Badge>
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

        <dl className={classes.infoList}>
          <InfoRow icon={<IconBook />} label="Předmět" value={teacher.subject} />
          <InfoRow icon={<IconUsers />} label="Třídy" value={teacher.classes.join(', ')} />
          <InfoRow icon={<IconSchool />} label="Škola" value={teacher.school} />
        </dl>
      </Stack>
    </section>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <>
      <span className={classes.infoIcon}>{icon}</span>
      <dt className={classes.infoLabel}>{label}</dt>
      <dd className={classes.infoValue}>{value}</dd>
    </>
  )
}

function CategoryBars({ teacher }: { teacher: ReviewTeacherDetail }) {
  return (
    <section className={classes.panel} aria-labelledby="recenze-categories-title">
      <h2 id="recenze-categories-title" className={classes.sectionTitle}>
        Hodnocení v kategoriích
      </h2>
      <Stack gap={12} mt="md">
        {teacher.categories.map((category) => (
          <div key={category.key} className={classes.categoryRow}>
            <Text size="md">{category.label}</Text>
            <Progress
              value={(category.value / 5) * 100}
              size={12}
              radius="xl"
              classNames={{ root: classes.progressRoot, section: classes.progressSection }}
              aria-label={`${category.label}: ${formatRating(category.value)} z 5`}
            />
            <Text className={classes.categoryValue}>{formatRating(category.value)}</Text>
          </div>
        ))}
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
