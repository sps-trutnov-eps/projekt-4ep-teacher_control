import { Box, Group, Stack, TextInput, UnstyledButton } from '@mantine/core'
import { useState } from 'react'
import { Menu } from '@mantine/core'
import { useTeacher } from './api'
import { TeacherDetail } from './components/TeacherDetail'
import { TeacherList } from './components/TeacherList'

/**
 * F4 Abstence. Desktop: seznam vlevo, detail vpravo.
 * Mobil: rozbalovací řádky v seznamu.
 */
export function AbstencePage() {
  const [nameFilter, setNameFilter] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)
  const [appMode, setAppMode] = useState<'preview' | 'rate'>('preview')

  return (
    <Stack gap="md">
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: '#FFFFFF',
          borderBottom: '1px solid #D9E3F0',
        }}
      >
        <Box
          component="h1"
          style={{
            color: '#173B70',
            fontWeight: 700,
            fontSize: '28px',
            lineHeight: 1.2,
            fontFamily: 'Inter, Arial, sans-serif',
            margin: 0,
          }}
        >
          ABSTENCE
        </Box>

        <Menu shadow="md" width={160} position="bottom-end" withArrow>
          <Menu.Target>
            <UnstyledButton
              aria-label="Změnit režim zobrazení"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                border: '1px solid #D9E3F0',
                color: '#173B70',
                fontSize: '20px',
                lineHeight: 1,
              }}
            >
              ⋮
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              value="preview"
              aria-pressed={appMode === 'preview'}
              color={appMode === 'preview' ? '#173B70' : undefined}
              onClick={() => setAppMode('preview')}
              styles={{
                item: {
                  fontWeight: appMode === 'preview' ? 600 : 400,
                  fontFamily: 'Inter, Arial, sans-serif',
                },
              }}
            >
              Zobrazit
            </Menu.Item>
            <Menu.Item
              value="rate"
              aria-pressed={appMode === 'rate'}
              color={appMode === 'rate' ? '#173B70' : undefined}
              onClick={() => setAppMode('rate')}
              styles={{
                item: {
                  fontWeight: appMode === 'rate' ? 600 : 400,
                  fontFamily: 'Inter, Arial, sans-serif',
                },
              }}
            >
              Hodnotit
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>

      <TextInput
        label="Vyhledat učitele"
        placeholder="Jméno Příjmení"
        maw={320}
        value={nameFilter}
        onChange={(event) => setNameFilter(event.currentTarget.value)}
        style={{ marginBottom: 48 }}
      />

      <Group align="flex-start" gap="xl">
        <Box maw={480} style={{ flex: 1 }}>
          <TeacherList nameFilter={nameFilter} onSelect={setSelectedTeacherId} />
        </Box>

        <Box visibleFrom="md" maw={560} style={{ flex: 1 }}>
          <SideDetail
            teacherId={selectedTeacherId}
            appMode={appMode}
            onDetailsModeChange={setAppMode}
          />
        </Box>
      </Group>
    </Stack>
  )
}

/** Detail vedle seznamu se zobrazuje jen na desktopu — na mobilu jede rozklik v seznamu. */
function SideDetail({
  teacherId,
  appMode,
  onDetailsModeChange,
}: {
  teacherId: number | null
  appMode: 'preview' | 'rate'
  onDetailsModeChange: (next: 'preview' | 'rate') => void
}) {
  const { data: teacher, isPending, isError } = useTeacher(teacherId ?? 0)

  if (teacherId === null) {
    return null
  }

  if (isPending || isError || !teacher) {
    return null
  }

  return (
    <TeacherDetail
      key={teacher.teacherId}
      teacher={teacher}
      appMode={appMode}
      onTabChange={(next) => onDetailsModeChange(next)}
    />
  )
}
