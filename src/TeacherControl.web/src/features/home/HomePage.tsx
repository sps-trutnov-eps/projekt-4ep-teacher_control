import { Alert, Card, Group, Loader, SimpleGrid, Stack, Text } from '@mantine/core'
import { Link, useNavigate } from 'react-router'
import { TeacherAvatar, TeacherSelect, teacherProfilePath, useTeachers } from '@/shared/teachers'
import { PageHeader } from '@/shared/ui'

/** Domovská stránka: všichni učitelé, každý vede na svůj profil. */
export function HomePage() {
  const navigate = useNavigate()
  const { data: teachers, isPending, isError } = useTeachers()

  return (
    <Stack>
      <PageHeader title="Učitelé" />

      <TeacherSelect
        label="Najít učitele"
        placeholder="Jméno učitele"
        maw={360}
        value={null}
        onChange={(teacherId) => {
          if (teacherId !== null) {
            navigate(teacherProfilePath(teacherId))
          }
        }}
      />

      {isPending ? <Loader size="sm" /> : null}

      {isError ? (
        <Alert color="red" title="Chyba">
          Seznam učitelů se nepodařilo načíst. Zkus to prosím znovu.
        </Alert>
      ) : null}

      {teachers ? (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 4 }}>
          {teachers.map((teacher) => (
            <Card key={teacher.id} component={Link} to={teacherProfilePath(teacher.id)}>
              <Group gap="md" wrap="nowrap">
                <TeacherAvatar name={teacher.name} photoUrl={teacher.photoUrl} />
                <Text fw={600} c="brand.8">
                  {teacher.name}
                </Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      ) : null}
    </Stack>
  )
}
