import { Button, Group, Menu, Select, Stack, Text, TextInput, UnstyledButton } from '@mantine/core'
import type { FormEvent } from 'react'
import classes from '../Recenze.module.css'
import { BRAND } from '../theme'
import type { TeacherSort } from '../types'
import { IconChevronDown, IconSearch } from './icons'

/** Kolik předmětů je vidět jako tlačítko, zbytek je v menu „Více“. */
const VISIBLE_SUBJECTS = 3

export const ALL_SUBJECTS = 'all'

const SORT_OPTIONS: { value: TeacherSort; label: string }[] = [
  { value: 'reviews', label: 'Nejvíce recenzí' },
  { value: 'rating', label: 'Nejlepší hodnocení' },
  { value: 'name', label: 'Abecedně' },
]

interface TeacherSearchProps {
  search: string
  onSearchChange: (value: string) => void
  /** Předměty seřazené podle počtu učitelů. */
  subjects: string[]
  subject: string
  onSubjectChange: (value: string) => void
  sort: TeacherSort
  onSortChange: (value: TeacherSort) => void
}

export function TeacherSearch({
  search,
  onSearchChange,
  subjects,
  subject,
  onSubjectChange,
  sort,
  onSortChange,
}: TeacherSearchProps) {
  const visible = subjects.slice(0, VISIBLE_SUBJECTS)
  const overflow = subjects.slice(VISIBLE_SUBJECTS)
  const overflowSelected = overflow.includes(subject)

  // Filtruje se už při psaní; tlačítko je tu pro Enter a pro zavření klávesnice na mobilu.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = event.currentTarget.querySelector('input')
    input?.blur()
  }

  return (
    <Stack gap="md">
      <form role="search" onSubmit={handleSubmit}>
        <Group gap={8} wrap="nowrap" className={classes.searchWrap}>
          <TextInput
            aria-label="Hledat učitele"
            placeholder="Hledat učitele (jméno, předmět)"
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            leftSection={<IconSearch className={classes.searchIcon} />}
            classNames={{ input: classes.searchInput }}
            style={{ flex: 1 }}
            miw={0}
            type="search"
          />
          <Button type="submit" color={BRAND.primary} radius="md" h={44} px="lg">
            Hledat
          </Button>
        </Group>
      </form>

      <Group gap={8} role="group" aria-label="Filtrovat podle předmětu">
        <UnstyledButton
          className={classes.pill}
          data-active={subject === ALL_SUBJECTS || undefined}
          aria-pressed={subject === ALL_SUBJECTS}
          onClick={() => onSubjectChange(ALL_SUBJECTS)}
        >
          Všichni
        </UnstyledButton>

        {visible.map((item) => (
          <UnstyledButton
            key={item}
            className={classes.pill}
            data-active={subject === item || undefined}
            aria-pressed={subject === item}
            onClick={() => onSubjectChange(item)}
          >
            {item}
          </UnstyledButton>
        ))}

        {overflow.length > 0 ? (
          <Menu position="bottom-start" shadow="md" radius="md" withinPortal>
            <Menu.Target>
              <UnstyledButton
                className={classes.pill}
                data-active={overflowSelected || undefined}
                aria-pressed={overflowSelected}
              >
                {overflowSelected ? subject : 'Více'}
                <IconChevronDown size={16} />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown mah={320} style={{ overflowY: 'auto' }}>
              {overflow.map((item) => (
                <Menu.Item
                  key={item}
                  onClick={() => onSubjectChange(item)}
                  fw={item === subject ? 600 : undefined}
                  c={item === subject ? BRAND.primary : undefined}
                >
                  {item}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        ) : null}
      </Group>

      <Group gap={8} justify="flex-end" wrap="nowrap">
        <Text component="label" htmlFor="recenze-sort" className={classes.sortLabel}>
          Řadit podle:
        </Text>
        <Select
          id="recenze-sort"
          data={SORT_OPTIONS}
          value={sort}
          onChange={(value) => {
            if (value) onSortChange(value as TeacherSort)
          }}
          allowDeselect={false}
          w={200}
          radius="md"
          comboboxProps={{ withinPortal: true }}
        />
      </Group>
    </Stack>
  )
}
