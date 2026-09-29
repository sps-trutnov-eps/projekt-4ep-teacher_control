import { UnstyledButton, Text, Group, Avatar, Stack, Rating } from '@mantine/core'

export function TeacherList() {
  return (
    <Stack gap={0} bd="1px solid var(--mantine-color-gray-3)">
      {Array.from({ length: 15 }).map((_, i) => (
        <UnstyledButton
          key={i}
          p="md"
          bg="white"
          style={{
            borderBottom: '1px solid var(--mantine-color-gray-3)',
          }}
        >
          <Group gap="sm" wrap="nowrap" align="center">
            <Avatar radius="xl" color="blue" />
            <Stack gap={4}>
              <Text fw={500} size="md" lh={1}>
                Jméno Příjmení
              </Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed" lh={1}>
                  Rating:
                </Text>
                <Rating value={0} readOnly size="xs" color="yellow" />
              </Group>
            </Stack>
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  )
}
