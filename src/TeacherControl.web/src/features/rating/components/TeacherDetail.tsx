import { Box, Title, Text, Stack, Group, Rating, Center, Button, Image } from '@mantine/core'
import type { TeacherProfile } from '../types'

interface TeacherDetailProps {
  teacher: TeacherProfile
  onBack: () => void
}

export function TeacherDetail({ teacher, onBack }: TeacherDetailProps) {
  return (
    <Box bg="white" style={{ flex: 1, minHeight: '100%' }}>
      {/* Fotografie učitele nebo placeholder */}
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
        {teacher.image_url ? (
          <Image src={teacher.image_url} alt={teacher.full_name} h="100%" w="100%" fit="cover" />
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
            {teacher.full_name}
          </Title>

          <Text c="dimmed" size="sm" ta="justify">
            {teacher.bio}
          </Text>

          <Box maw={300}>
            <Title order={3} size="h4" fw={500} mb="sm">
              Hodnocení:
            </Title>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Recenze:</Text>
              <Rating value={teacher.review} readOnly fractions={2} color="yellow" />
            </Group>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Abstence:</Text>
              <Rating value={teacher.abstention} readOnly fractions={2} color="yellow" />
            </Group>
            <Group justify="space-between">
              <Text size="sm">Bingovost:</Text>
              <Rating value={teacher.binginess} readOnly fractions={2} color="yellow" />
            </Group>
          </Box>

          <Box maw={300}>
            <Title order={3} size="h4" fw={500} mb="sm">
              Ocenění:
            </Title>
            {teacher.awards.length > 0 ? (
              teacher.awards.map((item, idx) => (
                <Text key={idx} size="sm" mb="xs">
                  {item.award}
                  {item.year ? ` (${item.year})` : ''}
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
