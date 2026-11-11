import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useAuth } from '@/shared/auth'
import { ApiError, useCastVote, usePololetiTeacher } from '../api'
import type { TitleVotes } from '../types'

interface TeacherCardProps {
  teacherId: number | null
}

function getVoteErrorMessage(error: Error): string {
  if (error instanceof ApiError && error.status === 401) {
    return 'Pro hlasování se musíš přihlásit.'
  }

  if (error instanceof ApiError && error.status === 409) {
    return 'Hlas se nepodařilo uložit, protože se zároveň ukládal jiný. Zkus to prosím znovu.'
  }

  return 'Hlas se nepodařilo uložit. Zkus to prosím znovu.'
}

function getVoteButtonLabel(title: TitleVotes, teacherId: number): string {
  if (title.myVoteTeacherId === teacherId) {
    return 'Tvůj hlas'
  }

  return title.myVoteTeacherId === null ? 'Hlasovat' : 'Přesunout hlas sem'
}

function TeacherCardContent({ teacherId }: { teacherId: number }) {
  const { isAuthenticated } = useAuth()
  const { data, isPending, isError } = usePololetiTeacher(teacherId)
  const vote = useCastVote(teacherId)

  if (isPending) {
    return <Loader size="sm" />
  }

  if (isError) {
    return (
      <Alert color="red" title="Chyba">
        Kartu učitele se nepodařilo načíst. Zkus to prosím znovu.
      </Alert>
    )
  }

  return (
    <Card withBorder padding="lg">
      <Stack>
        <Group wrap="nowrap">
          <Avatar src={data.photoUrl} name={data.name} alt={data.name} size="lg" radius="xl" />
          <Stack gap={2}>
            <Title order={3}>{data.name}</Title>
            <Text size="sm" c="dimmed">
              {data.pololetiText}
            </Text>
          </Stack>
        </Group>

        {data.description !== '' ? <Text>{data.description}</Text> : null}

        {!isAuthenticated ? (
          <Alert color="blue" title="Hlasovat můžou jen přihlášení">
            Pro hlasování se přihlas. Počty hlasů vidíš i bez přihlášení.
          </Alert>
        ) : null}

        {vote.isError ? (
          <Alert color="red" title="Chyba">
            {getVoteErrorMessage(vote.error)}
          </Alert>
        ) : null}

        <Stack gap="xs">
          {data.titles.map((title) => (
            <Group key={title.teacherTitleId} justify="space-between" wrap="nowrap">
              <Stack gap={2}>
                <Text fw={500}>{title.title}</Text>
                <Badge variant="light" w="fit-content">
                  Hlasů: {title.votes}
                </Badge>
              </Stack>
              <Button
                variant={title.myVoteTeacherId === data.teacherId ? 'light' : 'filled'}
                disabled={!isAuthenticated || title.myVoteTeacherId === data.teacherId}
                loading={vote.isPending && vote.variables === title.teacherTitleId}
                onClick={() => vote.mutate(title.teacherTitleId)}
              >
                {getVoteButtonLabel(title, data.teacherId)}
              </Button>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

export function TeacherCard({ teacherId }: TeacherCardProps) {
  if (teacherId === null) {
    return <Text c="dimmed">Vyber učitele ze seznamu.</Text>
  }

  return <TeacherCardContent teacherId={teacherId} />
}
