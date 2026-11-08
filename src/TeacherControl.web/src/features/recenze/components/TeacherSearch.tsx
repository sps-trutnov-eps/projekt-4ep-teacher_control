import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core'
import type { FormEvent } from 'react'
import classes from '../Recenze.module.css'
import { BRAND } from '../theme'
import type { TeacherSort } from '../types'
import { IconSearch } from './icons'

const SORT_OPTIONS: { value: TeacherSort; label: string }[] = [
  { value: 'reviews', label: 'Nejvíce recenzí' },
  { value: 'rating', label: 'Nejlepší hodnocení' },
  { value: 'name', label: 'Abecedně' },
]

interface TeacherSearchProps {
  search: string
  onSearchChange: (value: string) => void
  sort: TeacherSort
  onSortChange: (value: TeacherSort) => void
}

export function TeacherSearch({ search, onSearchChange, sort, onSortChange }: TeacherSearchProps) {
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
            placeholder="Hledat učitele"
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
