import { Anchor, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'

/** Commit, ze kterého běží nasazené API. Šenkýř podle něj pozná, že se staging nasadil. */
export function AppVersion() {
  const { data } = useQuery({
    queryKey: ['app', 'version'],
    queryFn: async () => (await api.GET('/api/version')).data ?? null,
    staleTime: Infinity,
  })

  if (!data?.sha) {
    return null
  }

  const shortSha = data.sha.slice(0, 7)

  return (
    <Text size="xs" c="dimmed" title={data.message ?? undefined}>
      Verze{' '}
      {data.url ? (
        <Anchor href={data.url} target="_blank" rel="noreferrer" inherit>
          {shortSha}
        </Anchor>
      ) : (
        shortSha
      )}
    </Text>
  )
}
