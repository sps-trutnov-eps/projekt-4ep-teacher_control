import { useQuery } from '@tanstack/react-query'
import { api, fetchJson } from '@/shared/api'
import type { TeacherListItem, TeacherProfile } from './types'

/**
 * API klient pro rating:
 * - useTeachers(): volá /rating/teachers (dokud backend nedodá endpoint do OpenAPI, jede přes fetchJson + MSW)
 * - useTeacher(id): volá přímo vygenerovaný endpoint /api/rating/teacher/{teacherId}/profile z OpenAPI přes api.GET()
 */

const ratingKeys = {
  all: ['rating'] as const,
  teachers: () => [...ratingKeys.all, 'teachers'] as const,
  teacher: (id: number) => [...ratingKeys.all, 'teacher', id] as const,
}

export function useTeachers() {
  return useQuery({
    queryKey: ratingKeys.teachers(),
    queryFn: () => fetchJson<TeacherListItem[]>('/rating/teachers'),
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

      return data as unknown as TeacherProfile
    },
    enabled: Boolean(id) && (id ?? 0) > 0,
  })
}
