import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/shared/api'
import type { VzorFormValues } from './schema'
import type { VzorItem } from './types'

/** Query key konvence: [featura, typ, ...parametry]. */
const vzorKeys = {
  all: ['vzor'] as const,
  list: () => [...vzorKeys.all, 'list'] as const,
}

export function useVzorItems() {
  return useQuery({
    queryKey: vzorKeys.list(),
    queryFn: () => fetchJson<VzorItem[]>('/vzor-items'),
  })
}

export function useCreateVzorItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: VzorFormValues) =>
      fetchJson<VzorItem>('/vzor-items', { method: 'POST', body: JSON.stringify(values) }),
    // Po mutaci se seznam invaliduje, ať se překreslí čerstvá data.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vzorKeys.all }),
  })
}
