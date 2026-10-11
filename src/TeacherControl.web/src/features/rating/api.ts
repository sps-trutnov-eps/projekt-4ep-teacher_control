import { useQuery } from '@tanstack/react-query'
import { fetchJson, api } from '@/shared/api'
import type { TeacherProfile } from './types'

const ratingKeys = {
  all: ['rating'] as const,
  teachers: () => [...ratingKeys.all, 'teachers'] as const,
  teacher: (id: string | number) => [...ratingKeys.all, 'teacher', String(id)] as const,
}

export function useTeachers() {
  return useQuery({
    queryKey: ratingKeys.teachers(),
    queryFn: () => fetchJson<TeacherProfile[]>('/teachers'),
  })
}

export function useTeacher(id: string | number | null) {
  return useQuery({
    queryKey: ratingKeys.teacher(id!),
    queryFn: async () => {
      const numericId = Number(String(id).replace('t-', '')) || 0
      const { data, error } = await api.GET('/api/rating/teacher/{teacherId}/profile', {
        params: {
          path: { teacherId: numericId },
        },
      })
      if (error) {
        throw new Error('Nepodařilo se načíst profil učitele')
      }
      return data as unknown as TeacherProfile
    },
    enabled: Boolean(id),
  })
}
