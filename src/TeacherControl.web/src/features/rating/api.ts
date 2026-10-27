import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'

/**
 * API klient pro rating:
 * - useTeachers(): volá /api/rating/teachers přes openapi-fetch
 * - useTeacher(id): volá /api/rating/teacher/{teacherId}/profile přes openapi-fetch
 */

const ratingKeys = {
  all: ['rating'] as const,
  teachers: () => [...ratingKeys.all, 'teachers'] as const,
  teacher: (id: number) => [...ratingKeys.all, 'teacher', id] as const,
}

export function useTeachers() {
  return useQuery({
    queryKey: ratingKeys.teachers(),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/rating/teachers', { signal })

      if (!response.ok || !data) {
        throw new Error(`Nepodařilo se načíst seznam učitelů (${response.status})`)
      }

      return data
    },
  })
}

export function useTeacher(id: number | null) {
  return useQuery({
    queryKey: ratingKeys.teacher(id ?? 0),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/rating/teacher/{teacherId}/profile', {
        params: {
          path: { teacherId: id! },
        },
        signal,
      })

      if (!response.ok || !data) {
        throw new Error(`Nepodařilo se načíst profil učitele (${response.status})`)
      }

      return data
    },
    enabled: Boolean(id) && (id ?? 0) > 0,
  })
}
