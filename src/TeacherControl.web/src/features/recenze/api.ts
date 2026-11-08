import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { ReviewFormValues } from './schema'
import type { ReactionValue, ReviewTeacher, ReviewTeacherDetail } from './types'

/**
 * Endpointy featury Recenze jsou ve vygenerovaném schématu (docs/api/TeacherControl.Api.json):
 * - GET    /api/reviews/teachers                       → seznam učitelů (`?search=` backend umí, hledá se ale lokálně)
 * - GET    /api/reviews/teachers/{teacherId}           → profil učitele včetně recenzí
 * - POST   /api/reviews/teachers/{teacherId}/reviews   { content } → 201, 409 když už recenzi mám
 * - PUT    /api/reviews/{reviewId}                     { content } → úprava vlastní recenze (403 cizí)
 * - DELETE /api/reviews/{reviewId}                     → smazání vlastní recenze (403 cizí)
 * - PUT    /api/reviews/teachers/{teacherId}/reaction  { value: 1 | -1 | 0 } like / dislike / zrušení
 *
 * Schéma dokumentuje jen úspěšné odpovědi, proto se kontroluje `response.ok` místo `error`.
 */

/** Query key konvence: [featura, typ, ...parametry]. */
const recenzeKeys = {
  all: ['recenze'] as const,
  teachers: () => [...recenzeKeys.all, 'teachers'] as const,
  teacher: (teacherId: number) => [...recenzeKeys.all, 'teacher', teacherId] as const,
}

export class RecenzeApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`API volání skončilo ${status}.`)
    this.name = 'RecenzeApiError'
    this.status = status
  }
}

export function useReviewTeachers() {
  return useQuery({
    queryKey: recenzeKeys.teachers(),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/reviews/teachers', { signal })

      if (!response.ok || data === undefined) {
        throw new RecenzeApiError(response.status)
      }

      return data as ReviewTeacher[]
    },
  })
}

export function useReviewTeacher(teacherId: number | null) {
  return useQuery({
    queryKey: recenzeKeys.teacher(teacherId ?? 0),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/reviews/teachers/{teacherId}', {
        params: { path: { teacherId: teacherId ?? 0 } },
        signal,
      })

      if (!response.ok || data === undefined) {
        throw new RecenzeApiError(response.status)
      }

      return data as ReviewTeacherDetail
    },
    enabled: teacherId !== null,
  })
}

export function useCreateReview(teacherId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const { response } = await api.POST('/api/reviews/teachers/{teacherId}/reviews', {
        params: { path: { teacherId } },
        body: { content: values.content },
      })

      if (!response.ok) {
        throw new RecenzeApiError(response.status)
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recenzeKeys.all }),
  })
}

export function useUpdateReview(reviewId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const { response } = await api.PUT('/api/reviews/{reviewId}', {
        params: { path: { reviewId } },
        body: { content: values.content },
      })

      if (!response.ok) {
        throw new RecenzeApiError(response.status)
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recenzeKeys.all }),
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: number) => {
      const { response } = await api.DELETE('/api/reviews/{reviewId}', {
        params: { path: { reviewId } },
      })

      if (!response.ok) {
        throw new RecenzeApiError(response.status)
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recenzeKeys.all }),
  })
}

interface ReactionInput {
  teacherId: number
  /** 0 = zrušit hlas. */
  value: ReactionValue | 0
}

export function useSetReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ teacherId, value }: ReactionInput) => {
      const { response } = await api.PUT('/api/reviews/teachers/{teacherId}/reaction', {
        params: { path: { teacherId } },
        body: { value },
      })

      if (!response.ok) {
        throw new RecenzeApiError(response.status)
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recenzeKeys.all }),
  })
}
