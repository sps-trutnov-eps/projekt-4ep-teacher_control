import { Alert, Loader, Table, Text } from '@mantine/core'
import { formatDateTime } from '@/shared/lib'
import { useRatings } from '../api'
import type { RatingFilters } from '../types'

export function RatingList({ filters }: { filters: RatingFilters }) {
  const { data, isPending, isError } = useRatings(filters)

  if (isPending) {
    return <Loader size="sm" />
  }

  if (isError) {
    return (
      <Alert color="red" title="Chyba">
        Hodnocení se nepodařilo načíst. Zkus to prosím znovu.
      </Alert>
    )
  }

  if (data.length === 0) {
    return <Text c="dimmed">Zatím tu není žádné hodnocení.</Text>
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Předmět</Table.Th>
          <Table.Th>Hodnocení</Table.Th>
          <Table.Th>Komentář</Table.Th>
          <Table.Th>Autor</Table.Th>
          <Table.Th>Vytvořeno</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((rating) => (
          <Table.Tr key={rating.id}>
            <Table.Td>{rating.subject}</Table.Td>
            <Table.Td>{rating.score} / 5</Table.Td>
            <Table.Td>{rating.comment ?? '—'}</Table.Td>
            <Table.Td>{rating.authorName}</Table.Td>
            <Table.Td>{formatDateTime(rating.createdAt)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
