import {
  Alert,
  Badge,
  Button,
  Group,
  MultiSelect,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useState } from 'react'
import { PageHeader } from '@/shared/ui'
import { useBingoBoard, useNewBingoBoard, useTeacherQuotes, useToggleBingoCell } from './api'

const GRID_SIZES = [3, 4, 5, 6].map((size) => ({ value: String(size), label: `${size} × ${size}` }))

export function BingoPage() {
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[] | null>(null)
  const [gridSize, setGridSize] = useState('4')
  const quotesQuery = useTeacherQuotes()
  const boardQuery = useBingoBoard()
  const createBoard = useNewBingoBoard()
  const toggleCell = useToggleBingoCell()

  const teachers = Array.from(
    new Map((quotesQuery.data ?? []).map((quote) => [quote.teacherId, quote.teacherName] as const)).entries()
  ).map(([value, label]) => ({ value, label }))
  const activeTeacherIds = selectedTeacherIds ?? teachers.map((teacher) => teacher.value)
  const board = boardQuery.data

  function generateBoard() {
    createBoard.mutate({ size: Number(gridSize), teacherIds: activeTeacherIds })
  }

  return (
    <Stack gap="xl">
      <PageHeader title="Učitelské bingo" description="Vyberte učitele a zahrajte si bingo z jejich hlášek." />

      <Paper withBorder p="md" radius="sm">
        <Stack gap="md">
          <Group align="end" justify="space-between">
            <MultiSelect
              label="Učitelé"
              placeholder="Vyberte učitele"
              data={teachers}
              value={activeTeacherIds}
              onChange={setSelectedTeacherIds}
              searchable
              clearable
              hidePickedOptions
              nothingFoundMessage="Žádný učitel nenalezen"
              style={{ flex: 1 }}
            />
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
        </Stack>
      </Paper>

      {quotesQuery.isError || boardQuery.isError ? (
        <Alert color="red" title="Bingo se nepodařilo načíst">
          Obnovte stránku a zkuste to znovu.
        </Alert>
      ) : null}

      {board ? (
        <Stack gap="md" align="center">
          <Group justify="space-between" w="100%">
            <Title order={2}>Vaše deska</Title>
            <Badge color={board.bingoCount > 0 ? 'teal' : 'gray'} size="lg">
              {board.bingoCount} {board.bingoCount === 1 ? 'bingo' : 'bing'}
            </Badge>
          </Group>
          <SimpleGrid
            cols={board.gridSize}
            spacing={0}
            w="100%"
            maw={760}
            style={{ borderTop: '2px solid var(--mantine-color-dark-7)', borderLeft: '2px solid var(--mantine-color-dark-7)' }}
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
                  height: 'clamp(100px, 16vw, 150px)',
                  padding: 'var(--mantine-spacing-xs)',
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  borderRight: '2px solid var(--mantine-color-dark-7)',
                  borderBottom: '2px solid var(--mantine-color-dark-7)',
                  background: cell.isMarked ? 'var(--mantine-color-teal-0)' : undefined,
                  color: cell.isMarked ? 'var(--mantine-color-teal-9)' : undefined,
                }}
              >
                <Stack gap={4} align="center" justify="center">
                  <Text size="xs" fw={700} c={cell.isMarked ? 'teal.8' : 'dimmed'} lineClamp={1}>
                    {cell.quote.teacherName}
                  </Text>
                  <Text size="sm" fw={cell.isMarked ? 600 : 400} lineClamp={4}>
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
        </Stack>
      ) : boardQuery.isLoading ? (
        <Text ta="center" c="dimmed">Načítám bingo desku…</Text>
      ) : null}
    </Stack>
  )
}