import { ActionIcon, Menu } from '@mantine/core'

export type DetailTab = 'view' | 'rate'

const ITEMS: Array<{ value: DetailTab; label: string }> = [
  { value: 'view', label: 'Zobrazit' },
  { value: 'rate', label: 'Hodnotit' },
]

interface ModeMenuProps {
  value: DetailTab
  onChange: (value: DetailTab) => void
}

/**
 * Kulaté tlačítko v pravém horním rohu profilu (design: hamburger). Po kliknutí nabídne
 * přepnutí mezi Zobrazit a Hodnotit; aktivní položka je zvýrazněná barvou z design_rules.
 */
export function ModeMenu({ value, onChange }: ModeMenuProps) {
  return (
    <Menu position="bottom-end" width={180} shadow="md" radius="md">
      <Menu.Target>
        <ActionIcon
          aria-label="Menu profilu učitele"
          radius="xl"
          size={44}
          variant="filled"
          style={{ backgroundColor: '#173B70', color: '#FFFFFF', flexShrink: 0 }}
        >
          <HamburgerIcon />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {ITEMS.map((item) => {
          const isActive = item.value === value

          return (
            <Menu.Item
              key={item.value}
              onClick={() => onChange(item.value)}
              fw={isActive ? 700 : 400}
              c={isActive ? '#173B70' : undefined}
              bg={isActive ? '#EAF2FF' : undefined}
              rightSection={isActive ? <CheckIcon /> : undefined}
            >
              {item.label}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}

/** Ikony jsou jen dekorace; jméno položky čte čtečka z textu. */
function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 12 5 5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
