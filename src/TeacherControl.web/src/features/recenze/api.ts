import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, fetchJson } from '@/shared/api'
import type { ReviewFormValues } from './schema'
import type {
  LegacyTeacher,
  LegacyTeacherProfile,
  Review,
  TeacherProfile,
  TeacherSummary,
} from './types'

const reviewKeys = {
  all: ['recenze'] as const,
  teachers: () => [...reviewKeys.all, 'teachers'] as const,
  profile: (id: number) => [...reviewKeys.all, 'profile', id] as const,
  reviews: (id: number) => [...reviewKeys.all, 'reviews', id] as const,
}

export function useTeachers() {
  return useQuery({
    queryKey: reviewKeys.teachers(),
    queryFn: async () => {
      const teachers = await fetchJson<LegacyTeacher[]>('/teachers')
      return teachers.map<TeacherSummary>((teacher) => ({
        id: Number(teacher.id.replace('t-', '')),
        name: `${teacher.firstName} ${teacher.lastName}`,
        photoUrl: teacher.photoUrl,
        averageRating: teacher.ratings.overall,
      }))
    },
  })
}

export function useTeacherProfile(teacherId: number | null) {
  return useQuery({
    queryKey: reviewKeys.profile(teacherId ?? 0),
    enabled: teacherId !== null,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/rating/teacher/{teacherId}/profile', {
        params: { path: { teacherId: teacherId ?? 0 } },
      })
      if (error) throw new Error('Nepodařilo se načíst profil učitele.')
      const teacher = data as unknown as LegacyTeacherProfile
      return {
        id: Number(teacher.id.replace('t-', '')),
        name: `${teacher.firstName} ${teacher.lastName}`,
        photoUrl: teacher.photoUrl,
        averageRating: teacher.ratings.overall,
        description: teacher.description,
        mood: teacher.ratings.absence,
        reviewCount: teacher.reviewCount,
      } satisfies TeacherProfile
    },
  })
}

export function useTeacherReviews(teacherId: number | null) {
  return useQuery({
    queryKey: reviewKeys.reviews(teacherId ?? 0),
    enabled: teacherId !== null,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/rating/teacher/{teacherId}', {
        params: { path: { teacherId: teacherId ?? 0 } },
      })
      if (error) throw new Error('Nepodařilo se načíst recenze.')
      return data as unknown as Review[]
    },
  })
}

export function useCreateReview(teacherId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const { data, error } = await api.POST('/api/rating', { body: { ...values, teacherId } })
      if (error) throw new Error('Recenzi se nepodařilo odeslat.')
      return data as unknown as Review
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reviewKeys.profile(teacherId) }),
        queryClient.invalidateQueries({ queryKey: reviewKeys.reviews(teacherId) }),
        queryClient.invalidateQueries({ queryKey: reviewKeys.teachers() }),
      ])
    },
  })
}
