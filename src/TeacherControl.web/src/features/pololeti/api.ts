import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { PololetiTeacher, TeacherCard } from './types'

/**
 * Endpointy featury Pololetí jsou ve vygenerovaném schématu (docs/api/TeacherControl.Api.json):
 * - GET  /api/pololeti/teachers                    → seznam učitelů
 * - GET  /api/pololeti/teachers/{teacherId}        → karta učitele (veřejná, přihlášenému přidá jeho hlasy)
 * - POST /api/pololeti/teachers/{teacherId}/votes  { teacherTitleId } → hlas o titul (jen přihlášený)
 *
 * Schéma dokumentuje jen 200, ale backend posílá i 401/404/409. Proto se kontroluje
 * `response.ok` místo `error` z klienta.
 */

/** Query key konvence: [featura, typ, ...parametry]. */
const pololetiKeys = {
  all: ['pololeti'] as const,
  teachers: () => [...pololetiKeys.all, 'teachers'] as const,
  teacher: (teacherId: number) => [...pololetiKeys.all, 'teacher', teacherId] as const,
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`API volání skončilo ${status}.`)
    this.name = 'ApiError'
    this.status = status
  }
}

export function usePololetiTeachers() {
  return useQuery({
    queryKey: pololetiKeys.teachers(),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/pololeti/teachers', { signal })

      if (!response.ok || data === undefined) {
        throw new ApiError(response.status)
      }

      return data as PololetiTeacher[]
    },
  })
}

/** `teacherId` je vždy platné číslo: komponenta ho volá až po výběru učitele, null se do API nikdy nedostane. */
export function usePololetiTeacher(teacherId: number) {
  return useQuery({
    queryKey: pololetiKeys.teacher(teacherId),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/pololeti/teachers/{teacherId}', {
        params: { path: { teacherId } },
        signal,
      })

      if (!response.ok || data === undefined) {
        throw new ApiError(response.status)
      }

      return data as TeacherCard
    },
  })
}

export function useCastVote(teacherId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (teacherTitleId: number) => {
      const { response } = await api.POST('/api/pololeti/teachers/{teacherId}/votes', {
        params: { path: { teacherId } },
        body: { teacherTitleId },
      })

      if (!response.ok) {
        throw new ApiError(response.status)
      }
    },
    // Hlas se může přesunout z jiného učitele, proto se invaliduje celá featura (seznam i všechny karty).
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pololetiKeys.all }),
  })
}
