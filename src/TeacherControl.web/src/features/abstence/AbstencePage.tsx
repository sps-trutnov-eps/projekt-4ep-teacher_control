import { Box, Group, Stack, TextInput } from '@mantine/core'
import { useState } from 'react'
import { PageHeader } from '@/shared/ui'
import { useTeacher } from './api'
import { TeacherDetail } from './components/TeacherDetail'
import { TeacherList } from './components/TeacherList'

/**
 * F4 Abstence. Desktop: seznam vlevo, detail vpravo (design 1).
 * Mobil: rozbalovací řádky v seznamu (design 2) — řeší TeacherList přes expandedId.
 */
export function AbstencePage() {
  const [nameFilter, setNameFilter] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)

  return (
    <Stack gap="md">
      <PageHeader
        title="Abstence"
        description="Zpoždění učitelů po zvonění a jejich nálada."
      />

      <TextInput
        label="Vyhledat učitele"
        placeholder="Jméno Příjmení"
        maw={320}
        value={nameFilter}
        onChange={(event) => setNameFilter(event.currentTarget.value)}
      />

      <Group align="flex-start" gap="xl">
        <Box maw={480} style={{ flex: 1 }}>
          <TeacherList filters={{ name: nameFilter || undefined }} onSelect={setSelectedTeacherId} />
        </Box>

        <Box visibleFrom="md" maw={560} style={{ flex: 1 }}>
          <SideDetail teacherId={selectedTeacherId} />
        </Box>
      </Group>
    </Stack>
  )
}

/** Detail vedle seznamu se zobrazuje jen na desktopu — na mobilu jede rozklik v seznamu. */
function SideDetail({ teacherId }: { teacherId: string | null }) {
  const { data: teacher, isPending, isError } = useTeacher(teacherId ?? '')

  if (teacherId === null) {
    return null
  }

  if (isPending || isError || !teacher) {
    return null
  }

  return <TeacherDetail teacher={teacher} />
}
