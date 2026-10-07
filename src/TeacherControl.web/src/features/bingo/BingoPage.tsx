import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  Image,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useState } from 'react'
import { PageHeader } from '@/shared/ui'
import { useBingoBoard, useNewBingoBoard, useTeacherQuotes, useToggleBingoCell } from './api'
import coconutImage from './assets/coconut.jpg'

const GRID_SIZES = [3, 4, 5, 6].map((size) => ({ value: String(size), label: `${size} × ${size}` }))

export function BingoPage() {
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[] | null>(null)
  const [teacherSearch, setTeacherSearch] = useState('')
  const [gridSize, setGridSize] = useState('4')
  const quotesQuery = useTeacherQuotes()
  const boardQuery = useBingoBoard()
  const createBoard = useNewBingoBoard()
  const toggleCell = useToggleBingoCell()

  const teachers = Array.from(
    new Map((quotesQuery.data ?? []).map((quote) => [quote.teacherId, quote.teacherName] as const)).entries()
  ).map(([id, name]) => ({ id, name }))
  const activeTeacherIds = selectedTeacherIds ?? teachers.map((teacher) => teacher.id)
  const normalizedSearch = teacherSearch.trim().toLocaleLowerCase('cs')
  const visibleTeachers = teachers.filter((teacher) =>
    teacher.name.toLocaleLowerCase('cs').includes(normalizedSearch)
  )
  const board = boardQuery.data

  function generateBoard() {
    createBoard.mutate({ size: Number(gridSize), teacherIds: activeTeacherIds })
  }

  function toggleTeacher(teacherId: string) {
    const currentSelection = selectedTeacherIds ?? teachers.map((teacher) => teacher.id)
    setSelectedTeacherIds(
      currentSelection.includes(teacherId)
        ? currentSelection.filter((id) => id !== teacherId)
        : [...currentSelection, teacherId]
    )
  }

  return (
    <Stack gap="xl">
      <PageHeader title="Učitelské bingo" description="Vyberte učitele a zahrajte si bingo z jejich hlášek." />

      {quotesQuery.isError || boardQuery.isError ? (
        <Alert color="red" title="Bingo se nepodařilo načíst">
          Obnovte stránku a zkuste to znovu.
        </Alert>
      ) : null}

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" verticalSpacing="xl" style={{ alignItems: 'start' }}>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>Vaše deska</Title>
            {board ? (
              <Badge color={board.bingoCount > 0 ? 'teal' : 'gray'} size="lg">
                {board.bingoCount} {board.bingoCount === 1 ? 'bingo' : 'bing'}
              </Badge>
            ) : null}
          </Group>
          <Group align="center" justify="space-between" wrap="wrap">
            <SegmentedControl
              aria-label="Velikost bingo desky"
              data={GRID_SIZES}
              value={gridSize}
              onChange={setGridSize}
            />
            <Button
              onClick={generateBoard}
              loading={createBoard.isPending}
              disabled={activeTeacherIds.length === 0 || quotesQuery.isLoading}
            >
              Nová deska
            </Button>
          </Group>
          {createBoard.isError ? (
            <Alert color="red" title="Desku se nepodařilo vytvořit">
              Zkuste změnit výběr učitelů a generování opakujte.
            </Alert>
          ) : null}
          {board ? (
            <>
              <SimpleGrid
                cols={board.gridSize}
                spacing={0}
                w="100%"
                maw={760}
                style={{
                  borderTop: '2px solid var(--mantine-color-dark-7)',
                  borderLeft: '2px solid var(--mantine-color-dark-7)',
                }}
              >
                {board.cells.map((cell) => (
                  <Button
                    key={cell.id}
                    variant="default"
                    radius={0}
                    onClick={() => toggleCell.mutate(cell.id)}
                    loading={toggleCell.isPending && toggleCell.variables === cell.id}
                    aria-pressed={cell.isMarked}
                    aria-label={`${cell.quote.teacherName}: ${cell.quote.quote}${cell.isMarked ? ', označeno' : ''}`}
                    style={{
                      minWidth: 0,
                      width: '100%',
                      minHeight: 'clamp(100px, 16vw, 150px)',
                      height: 'auto',
                      padding: 'var(--mantine-spacing-xs)',
                      whiteSpace: 'normal',
                      textAlign: 'center',
                      borderRight: '2px solid var(--mantine-color-dark-7)',
                      borderBottom: '2px solid var(--mantine-color-dark-7)',
                      background: cell.isMarked ? 'var(--mantine-color-teal-0)' : undefined,
                      color: cell.isMarked ? 'var(--mantine-color-teal-9)' : undefined,
                    }}
                  >
                    <Stack gap={4} align="center" justify="center" w="100%">
                      <Text
                        size="xs"
                        fw={700}
                        c={cell.isMarked ? 'teal.8' : 'dimmed'}
                        style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                      >
                        {cell.quote.teacherName}
                      </Text>
                      <Text
                        size="sm"
                        fw={cell.isMarked ? 600 : 400}
                        style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                      >
                        {cell.quote.quote}
                      </Text>
                      {cell.isMarked ? <Text size="xs">✓ Označeno</Text> : null}
                    </Stack>
                  </Button>
                ))}
              </SimpleGrid>
              {toggleCell.isError ? (
                <Alert color="red" title="Políčko se nepodařilo změnit" w="100%" maw={760}>
                  Zkuste na políčko kliknout znovu.
                </Alert>
              ) : null}
            </>
          ) : boardQuery.isLoading ? (
            <Text ta="center" c="dimmed">Načítám bingo desku…</Text>
          ) : null}
        </Stack>

        <Paper withBorder p="md" radius="sm">
          <Stack gap="md">
            <Group justify="space-between" align="baseline">
              <Title order={2}>Učitelé</Title>
              <Text size="sm" c="dimmed">
                {activeTeacherIds.length} z {teachers.length} vybráno
              </Text>
            </Group>
            <TextInput
              label="Vyhledat učitele"
              placeholder="Začněte psát jméno"
              value={teacherSearch}
              onChange={(event) => setTeacherSearch(event.currentTarget.value)}
            />
            {visibleTeachers.length > 0 ? (
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs" verticalSpacing="xs">
                {visibleTeachers.map((teacher) => (
                  <Paper key={teacher.id} withBorder p="xs" radius="sm">
                    <Checkbox
                      checked={activeTeacherIds.includes(teacher.id)}
                      onChange={() => toggleTeacher(teacher.id)}
                      label={
                        <Group gap="xs" wrap="nowrap" ml="xs">
                          <Image
                            src={coconutImage}
                            alt=""
                            w={32}
                            h={32}
                            fit="cover"
                            radius="xl"
                            flex="0 0 auto"
                          />
                          <Text size="sm" style={{ overflowWrap: 'anywhere' }}>
                            {teacher.name}
                          </Text>
                        </Group>
                      }
                      style={{ width: '100%' }}
                    />
                  </Paper>
                ))}
              </SimpleGrid>
            ) : (
              <Text size="sm" c="dimmed">
                {teachers.length === 0 ? 'Seznam učitelů je prázdný.' : 'Žádný učitel nenalezen.'}
              </Text>
            )}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  )
}