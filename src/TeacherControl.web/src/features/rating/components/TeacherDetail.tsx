import { Box, Title, Text, Stack, Group, Rating, Center, Alert } from '@mantine/core'
import type { Teacher } from '../types'

interface TeacherDetailProps {
  teacher: Teacher
}

export function TeacherDetail({ teacher }: TeacherDetailProps) {
  return (
    <Box bg="white" style={{ flex: 1, minHeight: '100%' }}>
      {/* Top photo placeholder */}
      <Box h={200} bg="gray.3">
        <Center h="100%">
          <Text c="gray.6" fw={700} size="xl">
            FOTO
          </Text>
        </Center>
      </Box>

      <Box p="xl">
        <Stack gap="xl">
          <Title order={2} ta="center" fw={400}>
            {teacher.firstName} {teacher.lastName}
          </Title>

          <Text c="dimmed" size="sm" ta="justify">
            {teacher.description}
          </Text>

          <Stack gap="md">
            <Group align="flex-start" wrap="nowrap">
              <Box miw={250}>
                <Title order={3} size="h4" fw={500} mb="sm">
                  Hodnocení:
                </Title>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Celkové:</Text>
                  <Rating value={teacher.ratings.overall} readOnly color="yellow" />
                </Group>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Abstence:</Text>
                  <Rating value={teacher.ratings.absence} readOnly color="yellow" />
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Bingovanost:</Text>
                  <Rating value={teacher.ratings.bingo} readOnly color="yellow" />
                </Group>
              </Box>

              <Alert color="blue" variant="filled" style={{ flex: 1, borderRadius: 0 }}>
                Kliknutí na hodnocení Vás pošle na informace o učitely v dané funkci.
              </Alert>
            </Group>
          </Stack>

          <Stack gap="md">
            <Group align="flex-start" wrap="nowrap">
              <Box miw={250}>
                <Title order={3} size="h4" fw={500} mb="sm">
                  Ocenění:
                </Title>
                {teacher.awards.length > 0 ? (
                  teacher.awards.map((award) => (
                    <Text key={award.id} size="sm" mb="xs">
                      {award.name}
                    </Text>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">Žádná ocenění</Text>
                )}
              </Box>

              <Alert color="blue" variant="filled" style={{ flex: 1, borderRadius: 0 }}>
                Kliknutí na dané ocenění Vás pošle na informace o daném ocenění.
              </Alert>
            </Group>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
