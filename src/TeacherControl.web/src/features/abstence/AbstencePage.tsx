import { Box, Group, Stack, TextInput, Title } from '@mantine/core'
import { useState } from 'react'
import { useTeacher } from './api'
import { TeacherDetail } from './components/TeacherDetail'
import { TeacherList } from './components/TeacherList'

/**
 * F4 Abstence. Desktop: seznam vlevo, detail vpravo (design 1).
 * Mobil: rozbalovací řádky v seznamu (design 2) — řeší TeacherList přes expandedId.
 */
export function AbstencePage() {
  const [nameFilter, setNameFilter] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)

  return (
    <Stack gap="md">
      <Box bg="#173B70" px="md" py="lg" style={{ borderRadius: 8 }}>
        <Title
          order={1}
          c="#FFFFFF"
          ta="center"
          fz={28}
          fw={700}
          style={{ fontFamily: 'Inter, Arial, sans-serif' }}
        >
          Abstence
        </Title>
      </Box>

      <TextInput
        label="Vyhledat učitele"
        placeholder="Jméno Příjmení"
        maw={320}
        value={nameFilter}
        onChange={(event) => setNameFilter(event.currentTarget.value)}
      />

      <Group align="flex-start" gap="xl">
        <Box maw={480} style={{ flex: 1 }}>
          <TeacherList nameFilter={nameFilter} onSelect={setSelectedTeacherId} />
        </Box>

        <Box visibleFrom="md" maw={560} style={{ flex: 1 }}>
          <SideDetail teacherId={selectedTeacherId} />
        </Box>
      </Group>
    </Stack>
  )
}

/**
 * Detail vedle seznamu se zobrazuje jen na desktopu — na mobilu jede rozklik v seznamu.
 * Dokud není nic vybrané, posílá se `null` (ne 0) — jinak by se ptalo na učitele s ID 0,
 * který v databázi neexistuje (ID začínají na 1).
 */
function SideDetail({ teacherId }: { teacherId: number | null }) {
  const { data: teacher, isPending, isError } = useTeacher(teacherId)

  if (teacherId === null) {
    return null
  }

  if (isPending || isError || !teacher) {
    return null
  }

  // key přepne stav detailu (výběr nálady, rozepsané zpoždění) při změně učitele.
  return <TeacherDetail key={teacher.teacherId} teacher={teacher} />
}
