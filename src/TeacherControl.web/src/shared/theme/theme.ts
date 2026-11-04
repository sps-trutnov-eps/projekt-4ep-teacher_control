import {
  AppShell,
  Button,
  Card,
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
  Modal,
  Rating,
  Title,
} from '@mantine/core'

/** Hodnoty z docs/design/design_rules.md. Odstín 6 je hlavní barva, takže `color="red"` je červená z designu. */
const brand: MantineColorsTuple = [
  '#EAF2FF',
  '#D3E3FA',
  '#A9C6F1',
  '#7CA7E6',
  '#528ADB',
  '#3170C4',
  '#1655A3',
  '#144A8F',
  '#173B70',
  '#0F2A52',
]

const red: MantineColorsTuple = [
  '#FEF2F2',
  '#FEE2E2',
  '#FECACA',
  '#FCA5A5',
  '#F87171',
  '#EF4444',
  '#DC2626',
  '#B91C1C',
  '#991B1B',
  '#7F1D1D',
]

const green: MantineColorsTuple = [
  '#F0FDF4',
  '#DCFCE7',
  '#BBF7D0',
  '#86EFAC',
  '#4ADE80',
  '#16A34A',
  '#15803D',
  '#166534',
  '#14532D',
  '#052E16',
]

export const theme = createTheme({
  fontFamily: "'Inter Variable', Inter, Arial, sans-serif",
  primaryColor: 'brand',
  primaryShade: 6,
  colors: { brand, red, green },
  defaultRadius: 'md',
  radius: { xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px' },
  spacing: { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' },
  headings: {
    fontFamily: "'Inter Variable', Inter, Arial, sans-serif",
    sizes: {
      h1: { fontSize: '1.75rem', fontWeight: '700' },
      h2: { fontSize: '1.5rem', fontWeight: '700' },
      h3: { fontSize: '1.25rem', fontWeight: '600' },
    },
  },
  components: {
    AppShell: AppShell.extend({ styles: { main: { backgroundColor: '#F4F7FB' } } }),
    Button: Button.extend({ defaultProps: { size: 'md' } }),
    Card: Card.extend({ defaultProps: { radius: 'lg', padding: 20, withBorder: true } }),
    Modal: Modal.extend({ defaultProps: { radius: 'lg', centered: true } }),
    Rating: Rating.extend({ defaultProps: { color: '#D99A17' } }),
    Title: Title.extend({ defaultProps: { c: 'brand.8' } }),
  },
})

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-text': '#000000',
    '--mantine-color-dimmed': '#64748B',
    '--mantine-color-default-border': '#D9E3F0',
  },
  dark: {},
})
