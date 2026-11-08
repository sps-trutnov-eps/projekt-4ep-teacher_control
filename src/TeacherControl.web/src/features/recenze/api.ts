import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/shared/api'
import type { ReviewFormValues } from './schema'
import type { Review, ReviewTeacher, ReviewTeacherDetail, TeacherReaction } from './types'

const recenzeKeys = {
  all: ['recenze'] as const,
  teachers: () => [...recenzeKeys.all, 'teachers'] as const,
  teacher: (teacherId: number) => [...recenzeKeys.all, 'teacher', teacherId] as const,
  reviews: (teacherId: number) => [...recenzeKeys.all, 'reviews', teacherId] as const,
}

export function useReviewTeachers() {
  return useQuery({
    queryKey: recenzeKeys.teachers(),
    queryFn: () => fetchJson<ReviewTeacher[]>('/reviews/teachers'),
  })
}

export function useReviewTeacher(teacherId: number | null) {
  return useQuery({
    queryKey: recenzeKeys.teacher(teacherId ?? 0),
    queryFn:
      teacherId === null
        ? skipToken
        : () => fetchJson<ReviewTeacherDetail>(`/reviews/teachers/${teacherId}`),
  })
}

export function useTeacherReviews(teacherId: number) {
  return useQuery({
    queryKey: recenzeKeys.reviews(teacherId),
    queryFn: () => fetchJson<Review[]>(`/reviews/teachers/${teacherId}/reviews`),
  })
}

export function useCreateReview(teacherId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ReviewFormValues) =>
      fetchJson<Review>(`/reviews/teachers/${teacherId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recenzeKeys.all }),
  })
}

interface ReactionInput {
  teacherId: number
  value: 1 | -1
}

export function useTeacherReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teacherId, value }: ReactionInput) =>
      fetchJson<TeacherReaction>(`/reviews/teachers/${teacherId}/reaction`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recenzeKeys.all }),
  })
}
