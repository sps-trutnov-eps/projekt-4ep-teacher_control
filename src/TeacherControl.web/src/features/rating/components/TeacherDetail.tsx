import { Box, Title, Text, Stack, Group, Rating, Center, Button, Image, Card } from '@mantine/core'
import type { TeacherProfile } from '../types'

interface TeacherDetailProps {
  teacher: TeacherProfile
  onBack: () => void
}

export function TeacherDetail({ teacher, onBack }: TeacherDetailProps) {
  return (
    <Card h="100%" p={0} style={{ overflow: 'hidden' }}>
      {/* Fotografie učitele nebo placeholder */}
      <Box h={{ base: 140, sm: 200 }} bg="gray.1" pos="relative" style={{ overflow: 'hidden' }}>
        <Button
          variant="outline"
          size="xs"
          pos="absolute"
          top={10}
          left={10}
          style={{ zIndex: 2 }}
          onClick={onBack}
          display={{ base: 'block', sm: 'none' }}
        >
          ← Zpět
        </Button>
        {teacher.image_url ? (
          <Image src={teacher.image_url} alt={teacher.full_name} h="100%" w="100%" fit="cover" />
        ) : (
          <Center h="100%">
            <Text c="dimmed" fw={700} size="xl">
              FOTO
            </Text>
          </Center>
        )}
      </Box>

      <Box p="lg">
        <Stack gap="lg">
          <Title order={2} ta="center">
            {teacher.full_name}
          </Title>

          <Text size="md" ta="justify" style={{ lineHeight: 1.6 }}>
            {teacher.bio}
          </Text>

          <Box maw={320}>
            <Title order={3} mb="sm">
              Hodnocení:
            </Title>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Recenze:
              </Text>
              <Rating value={teacher.review} readOnly fractions={2} />
            </Group>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Abstence:
              </Text>
              <Rating value={teacher.abstention} readOnly fractions={2} />
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Bingovost:
              </Text>
              <Rating value={teacher.binginess} readOnly fractions={2} />
            </Group>
          </Box>

          <Box maw={320}>
            <Title order={3} mb="sm">
              Ocenění:
            </Title>
            {teacher.awards.length > 0 ? (
              teacher.awards.map((item, idx) => {
                const displayYear =
                  typeof item.year === 'number'
                    ? item.year < 1000
                      ? 2026 + item.year
                      : item.year
                    : null
                return (
                  <Text key={idx} size="md" mb="xs">
                    {item.award}
                    {displayYear !== null ? ` (${displayYear})` : ''}
                  </Text>
                )
              })
            ) : (
              <Text size="sm" c="dimmed">
                Žádná ocenění
              </Text>
            )}
          </Box>
        </Stack>
      </Box>
    </Card>
  )
}
