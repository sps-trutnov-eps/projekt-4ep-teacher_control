import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { TeacherDetails, TeacherListItem } from './types'

/**
 * API klient pro rating:
 * - useTeachers(): volá /api/rating/teachers přes openapi-fetch (vrací TeacherListItem[])
 * - useTeacherDetails(id): volá /api/rating/teacher/{teacherId} pro doplňující údaje (bio, abstention, binginess, awards)
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

      return data as TeacherListItem[]
    },
  })
}

export function useTeacherDetails(id: number | null) {
  return useQuery({
    queryKey: ratingKeys.teacher(id ?? 0),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/rating/teacher/{teacherId}', {
        params: {
          path: { teacherId: id! },
        },
        signal,
      })

      if (!response.ok || !data) {
        throw new Error(`Nepodařilo se načíst detail učitele (${response.status})`)
      }

      return data as TeacherDetails
    },
    enabled: Boolean(id) && (id ?? 0) > 0,
  })
}

/** Alias pro useTeacherDetails pro zpětnou kompatibilitu */
export const useTeacher = useTeacherDetails
