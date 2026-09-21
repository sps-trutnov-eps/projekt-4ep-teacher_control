import { Alert, Loader, Table, Text } from '@mantine/core'
import { formatDateTime } from '@/shared/lib'
import { useVzorItems } from '../api'

export function VzorList() {
  const { data, isPending, isError } = useVzorItems()

  if (isPending) {
    return <Loader size="sm" />
  }

  if (isError) {
    return (
      <Alert color="red" title="Chyba">
        Položky se nepodařilo načíst. Zkus to prosím znovu.
      </Alert>
    )
  }

  if (data.length === 0) {
    return <Text c="dimmed">Zatím tu nic není.</Text>
  }

  return (
    <Table striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Název</Table.Th>
          <Table.Th>Poznámka</Table.Th>
          <Table.Th>Autor</Table.Th>
          <Table.Th>Vytvořeno</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((item) => (
          <Table.Tr key={item.id}>
            <Table.Td>{item.title}</Table.Td>
            <Table.Td>{item.note ?? '—'}</Table.Td>
            <Table.Td>{item.authorName}</Table.Td>
            <Table.Td>{formatDateTime(item.createdAt)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
