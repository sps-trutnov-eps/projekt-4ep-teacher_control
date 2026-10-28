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
      <Title
        order={1}
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#173B70',
          fontFamily: "'Inter', Arial, sans-serif",
        }}
      >
        {title}
      </Title>
      {description ? (
        <Text
          style={{
            fontSize: '0.875rem',
            color: '#64748B',
            fontFamily: "'Inter', Arial, sans-serif",
          }}
        >
          {description}
        </Text>
      ) : null}
      {actions}
    </Stack>
  )
}
