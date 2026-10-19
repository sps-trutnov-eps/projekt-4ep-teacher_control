import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/shared/api'
import type { ReviewFormValues } from './schema'
import type { Review, ReviewSort, ReviewTeacher, ReviewTeacherDetail, ReviewVote } from './types'

const recenzeKeys = {
  all: ['recenze'] as const,
  teachers: () => [...recenzeKeys.all, 'teachers'] as const,
  teacher: (teacherId: string) => [...recenzeKeys.all, 'teacher', teacherId] as const,
  reviews: (teacherId: string, sort: ReviewSort) =>
    [...recenzeKeys.all, 'reviews', teacherId, sort] as const,
}

export function useReviewTeachers() {
  return useQuery({
    queryKey: recenzeKeys.teachers(),
    queryFn: () => fetchJson<ReviewTeacher[]>('/recenze/teachers'),
  })
}

export function useReviewTeacher(teacherId: string | null) {
  return useQuery({
    queryKey: recenzeKeys.teacher(teacherId ?? ''),
    queryFn:
      teacherId === null
        ? skipToken
        : () => fetchJson<ReviewTeacherDetail>(`/recenze/teachers/${teacherId}`),
  })
}

export function useTeacherReviews(teacherId: string, sort: ReviewSort) {
  return useQuery({
    queryKey: recenzeKeys.reviews(teacherId, sort),
    queryFn: () => fetchJson<Review[]>(`/recenze/teachers/${teacherId}/reviews?sort=${sort}`),
  })
}

export function useCreateReview(teacherId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ReviewFormValues) =>
      fetchJson<Review>(`/recenze/teachers/${teacherId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ ...values, title: values.title || null }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recenzeKeys.all }),
  })
}

interface VoteInput {
  reviewId: string
  /** null = zrušit hlas. */
  vote: ReviewVote | null
}

export function useVoteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, vote }: VoteInput) =>
      fetchJson<Review>(`/recenze/reviews/${reviewId}/vote`, {
        method: 'PUT',
        body: JSON.stringify({ vote }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recenzeKeys.all }),
  })
}
