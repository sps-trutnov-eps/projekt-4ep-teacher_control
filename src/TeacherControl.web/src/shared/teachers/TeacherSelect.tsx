import { Group, Select, Text, type SelectProps } from '@mantine/core'
import { useTeachers } from './api'
import { TeacherAvatar } from './TeacherAvatar'

interface TeacherSelectProps extends Omit<
  SelectProps,
  'data' | 'value' | 'onChange' | 'renderOption'
> {
  value: number | null
  onChange: (teacherId: number | null) => void
}

/**
 * Výběr učitele s hledáním podle jména. Seznam si načítá sám, hodnota je id učitele.
 * Ostatní props (`label`, `error`, `required`…) bere od Mantine `Select`, takže jde i do formuláře.
 */
export function TeacherSelect({ value, onChange, error, disabled, ...props }: TeacherSelectProps) {
  const { data: teachers = [], isPending, isError } = useTeachers()
  const teachersById = new Map(teachers.map((teacher) => [String(teacher.id), teacher]))

  return (
    <Select
      label="Učitel"
      placeholder={isPending ? 'Načítám učitele…' : 'Vyber učitele'}
      nothingFoundMessage="Nikoho jsem nenašel"
      searchable
      {...props}
      data={teachers.map((teacher) => ({ value: String(teacher.id), label: teacher.name }))}
      value={value === null ? null : String(value)}
      onChange={(next) => onChange(next === null ? null : Number(next))}
      disabled={disabled || isPending || isError}
      error={error ?? (isError ? 'Seznam učitelů se nepodařilo načíst.' : undefined)}
      renderOption={({ option }) => (
        <Group gap="sm" wrap="nowrap">
          <TeacherAvatar
            name={option.label}
            photoUrl={teachersById.get(option.value)?.photoUrl}
            size="sm"
          />
          <Text size="sm">{option.label}</Text>
        </Group>
      )}
    />
  )
}
