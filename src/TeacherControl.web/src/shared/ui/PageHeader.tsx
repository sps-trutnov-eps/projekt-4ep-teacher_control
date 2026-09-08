import { Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

/** Jednotná hlavička stránky featury. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack gap={4} mb="md">
      <Title order={2}>{title}</Title>
      {description ? (
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      ) : null}
      {actions}
    </Stack>
  )
}
