import { Box, Title, Text, Stack, Group, Rating, Center, Button, Image } from '@mantine/core'
import type { TeacherProfile } from '../types'

interface TeacherDetailProps {
  teacher: TeacherProfile
  onBack: () => void
}

export function TeacherDetail({ teacher, onBack }: TeacherDetailProps) {
  return (
    <Box
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #D9E3F0',
        flex: 1,
        minHeight: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Fotografie učitele nebo placeholder */}
      <Box h={{ base: 140, sm: 200 }} bg="#F4F7FB" pos="relative" style={{ overflow: 'hidden' }}>
        <Button
          variant="outline"
          size="xs"
          pos="absolute"
          top={10}
          left={10}
          style={{
            zIndex: 2,
            borderRadius: '8px',
            borderColor: '#1655A3',
            color: '#1655A3',
            backgroundColor: '#FFFFFF',
          }}
          onClick={onBack}
          display={{ base: 'block', sm: 'none' }}
        >
          ← Zpět
        </Button>
        {teacher.image_url ? (
          <Image src={teacher.image_url} alt={teacher.full_name} h="100%" w="100%" fit="cover" />
        ) : (
          <Center h="100%">
            <Text c="#64748B" fw={700} size="xl">
              FOTO
            </Text>
          </Center>
        )}
      </Box>

      <Box p={{ base: 16, sm: 24 }}>
        <Stack gap={24}>
          <Title order={2} ta="center" fw={700} c="#173B70" style={{ fontSize: '24px' }}>
            {teacher.full_name}
          </Title>

          <Text c="#64748B" size="sm" ta="justify" style={{ fontSize: '14px', lineHeight: 1.6 }}>
            {teacher.bio}
          </Text>

          <Box maw={320}>
            <Title order={3} fw={600} mb={16} c="#173B70" style={{ fontSize: '20px' }}>
              Hodnocení:
            </Title>
            <Group justify="space-between" mb={8}>
              <Text size="sm" c="#000000" style={{ fontSize: '14px' }}>
                Recenze:
              </Text>
              <Rating value={teacher.review} readOnly fractions={2} color="#D99A17" />
            </Group>
            <Group justify="space-between" mb={8}>
              <Text size="sm" c="#000000" style={{ fontSize: '14px' }}>
                Abstence:
              </Text>
              <Rating value={teacher.abstention} readOnly fractions={2} color="#D99A17" />
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="#000000" style={{ fontSize: '14px' }}>
                Bingovost:
              </Text>
              <Rating value={teacher.binginess} readOnly fractions={2} color="#D99A17" />
            </Group>
          </Box>

          <Box maw={320}>
            <Title order={3} fw={600} mb={16} c="#173B70" style={{ fontSize: '20px' }}>
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
                  <Text key={idx} size="sm" mb={8} c="#000000" style={{ fontSize: '14px' }}>
                    {item.award}
                    {displayYear !== null ? ` (${displayYear})` : ''}
                  </Text>
                )
              })
            ) : (
              <Text size="sm" c="#64748B" style={{ fontSize: '14px' }}>
                Žádná ocenění
              </Text>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
