import { createTheme } from '@mantine/core'

export const theme = createTheme({
  fontFamily: 'Inter, Arial, sans-serif',
  headings: {
    fontFamily: 'Inter, Arial, sans-serif',
    sizes: {
      h1: { fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.2' },
      h2: { fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.25' },
      h3: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.3' },
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem', // Pomocný text: 14 px = 0.875 rem
    md: '1rem', // Běžný text: 16 px = 1 rem
    lg: '1.125rem',
    xl: '1.25rem',
  },
})
