import { Box, Title, Text, Stack, Group, Rating, Button, Image, Card } from '@mantine/core'
import { DEFAULT_TEACHER_IMAGE, type TeacherDetails, type TeacherListItem } from '../types'

interface TeacherDetailProps {
  teacher: TeacherListItem
  details: TeacherDetails
  onBack: () => void
}

export function TeacherDetail({ teacher, details, onBack }: TeacherDetailProps) {
  const imageUrl = teacher.image_url || DEFAULT_TEACHER_IMAGE

  return (
    <Card h="100%" p={0} style={{ overflow: 'hidden' }}>
      {/* Fotografie učitele nebo náhradní obrázek při null */}
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
        <Image
          src={imageUrl}
          fallbackSrc={DEFAULT_TEACHER_IMAGE}
          alt={teacher.full_name}
          h="100%"
          w="100%"
          fit="cover"
        />
      </Box>

      <Box p="lg">
        <Stack gap="lg">
          <Title order={2} ta="center">
            {teacher.full_name}
          </Title>

          <Text size="md" ta="justify" style={{ lineHeight: 1.6 }}>
            {details.bio}
          </Text>

          <Box maw={320}>
            <Title order={3} mb="sm">
              Hodnocení:
            </Title>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Recenze:
              </Text>
              <Rating value={teacher.review ?? 0} readOnly fractions={2} />
            </Group>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Abstence:
              </Text>
              <Rating value={details.abstention} readOnly fractions={2} />
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Bingovost:
              </Text>
              <Rating value={details.binginess} readOnly fractions={2} />
            </Group>
          </Box>

          <Box maw={320}>
            <Title order={3} mb="sm">
              Ocenění:
            </Title>
            {details.awards.length > 0 ? (
              details.awards.map((item, idx) => {
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
