import { useQuery } from '@tanstack/react-query'
import { fetchJson, api } from '@/shared/api'
import type { Teacher } from './types'

const ratingKeys = {
  all: ['rating'] as const,
  teachers: () => [...ratingKeys.all, 'teachers'] as const,
  teacher: (id: string) => [...ratingKeys.all, 'teacher', id] as const,
}

export function useTeachers() {
  return useQuery({
    queryKey: ratingKeys.teachers(),
    queryFn: () => fetchJson<Teacher[]>('/teachers'),
  })
}

export function useTeacher(id: string | null) {
  return useQuery({
    queryKey: ratingKeys.teacher(id!),
    queryFn: async () => {
      // Použito openapi-fetch `api.GET` pro endpoint v OpenAPI
      // (typ vrací neznámé hodnoty (zatím), backend nedefinoval 200 response schéma)
      const { data, error } = await api.GET('/api/Rating/teacher/{teacherId}', {
        params: {
          path: { teacherId: Number(id?.replace('t-', '')) || 0 },
        },
      })
      if (error) {
        throw new Error('Nepodařilo se načíst detail učitele')
      }
      return data as unknown as Teacher
    },
    enabled: !!id,
  })
}
