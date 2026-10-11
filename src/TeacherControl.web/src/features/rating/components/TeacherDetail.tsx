import { Box, Title, Text, Stack, Group, Rating, Center, Button, Image } from '@mantine/core'
import type { TeacherProfile } from '../types'

interface TeacherDetailProps {
  teacher: TeacherProfile
  onBack: () => void
}

export function TeacherDetail({ teacher, onBack }: TeacherDetailProps) {
  const fullName = teacher.full_name || teacher.fullName || 'Jméno Příjmení'
  const photo = teacher.image_url || teacher.imageUrl || teacher.photoUrl || null
  const bio = teacher.bio || teacher.description || 'Bez popisu.'
  const reviewScore = teacher.review ?? teacher.averageRating ?? teacher.ratings?.overall ?? 0
  const abstentionScore = teacher.abstention ?? teacher.absence ?? teacher.ratings?.absence ?? 0
  const binginessScore = teacher.binginess ?? teacher.bingo ?? teacher.ratings?.bingo ?? 0

  const awardsList: string[] = []
  if (teacher.award) {
    awardsList.push(`${teacher.award}${teacher.year ? ` (${teacher.year})` : ''}`)
  } else if (teacher.awards && teacher.awards.length > 0) {
    teacher.awards.forEach((a) => {
      awardsList.push(`${a.name}${a.year ? ` (${a.year})` : ''}`)
    })
  }

  return (
    <Box bg="white" style={{ flex: 1, minHeight: '100%' }}>
      {/* Horní část - fotografie učitele nebo placeholder FOTO */}
      <Box h={{ base: 140, sm: 200 }} bg="gray.3" pos="relative" style={{ overflow: 'hidden' }}>
        <Button
          variant="default"
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
        {photo ? (
          <Image src={photo} alt={fullName} h="100%" w="100%" fit="cover" />
        ) : (
          <Center h="100%">
            <Text c="gray.6" fw={700} size="xl">
              FOTO
            </Text>
          </Center>
        )}
      </Box>

      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="xl">
          <Title order={2} ta="center" fw={400}>
            {fullName}
          </Title>

          <Text c="dimmed" size="sm" ta="justify">
            {bio}
          </Text>

          <Box maw={300}>
            <Title order={3} size="h4" fw={500} mb="sm">
              Hodnocení:
            </Title>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Recenze:</Text>
              <Rating value={reviewScore} readOnly fractions={2} color="yellow" />
            </Group>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Abstence:</Text>
              <Rating value={abstentionScore} readOnly fractions={2} color="yellow" />
            </Group>
            <Group justify="space-between">
              <Text size="sm">Bingovost:</Text>
              <Rating value={binginessScore} readOnly fractions={2} color="yellow" />
            </Group>
          </Box>

          <Box maw={300}>
            <Title order={3} size="h4" fw={500} mb="sm">
              Ocenění:
            </Title>
            {awardsList.length > 0 ? (
              awardsList.map((item, idx) => (
                <Text key={idx} size="sm" mb="xs">
                  {item}
                </Text>
              ))
            ) : (
              <Text size="sm" c="dimmed">
                Žádná ocenění
              </Text>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
