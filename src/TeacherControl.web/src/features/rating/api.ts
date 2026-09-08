import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { RatingFilters } from './types'
import type { RatingFormValues } from './schema'

/** Query key konvence: [featura, typ, ...parametry]. */
const ratingKeys = {
  all: ['rating'] as const,
  list: (filters: RatingFilters) => ['rating', 'list', filters] as const,
}

export function useRatings(filters: RatingFilters = {}) {
  return useQuery({
    queryKey: ratingKeys.list(filters),
    queryFn: async () => {
      const { data, error } = await api.GET('/ratings', {
        params: { query: { subject: filters.subject } },
      })

      if (error) {
        throw new Error('Hodnocení se nepodařilo načíst.')
      }

      return data
    },
  })
}

export function useCreateRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: RatingFormValues) => {
      const { data, error } = await api.POST('/ratings', { body: values })

      if (error) {
        throw new Error('Hodnocení se nepodařilo uložit.')
      }

      return data
    },
    onSuccess: () => {
      // Po mutaci se seznam invaliduje, ať se překreslí čerstvá data.
      queryClient.invalidateQueries({ queryKey: ratingKeys.all })
    },
  })
}
