import { Alert, Anchor, Card, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { Link, useParams } from 'react-router'
import { TeacherAvatar, useTeacher, type TeacherSection } from '@/shared/teachers'

interface TeacherProfilePageProps {
  sections: TeacherSection[]
}

/**
 * Kostra profilu učitele. Hlavičku kreslí sama, obsah sekcí dodávají featurové týmy
 * přes `src/routes/teacherSections.tsx`.
 */
export function TeacherProfilePage({ sections }: TeacherProfilePageProps) {
  const { id } = useParams()
  const teacherId = Number(id)
  const { data: teacher, isPending, isError } = useTeacher(teacherId)

  if (isPending) {
    return <Loader size="sm" />
  }

  if (isError) {
    return (
      <Alert color="red" title="Chyba">
        Profil učitele se nepodařilo načíst. Zkus to prosím znovu.
      </Alert>
    )
  }

  if (teacher === null) {
    return (
      <Alert color="yellow" title="Učitel nenalezen">
        Učitel s touhle adresou neexistuje.{' '}
        <Anchor component={Link} to="/" inherit>
          Zpět na seznam učitelů
        </Anchor>
      </Alert>
    )
  }

  return (
    <Stack gap="lg">
      <Group gap="md" wrap="nowrap">
        <TeacherAvatar name={teacher.name} photoUrl={teacher.photoUrl} size="xl" />
        <Title order={1}>{teacher.name}</Title>
      </Group>

      {sections.map(({ id: sectionId, title, Component }) => (
        <Card key={sectionId} component="section" id={sectionId} aria-label={title}>
          <Stack gap="md">
            <Title order={2}>{title}</Title>
            {Component ? (
              <Component teacherId={teacher.id} />
            ) : (
              <Text c="dimmed">Tuhle sekci zatím nikdo neudělal.</Text>
            )}
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
