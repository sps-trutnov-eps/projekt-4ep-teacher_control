import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { LateArrivalBody, MoodBody, Teacher } from './types'

/**
 * Endpointy featury Abstence jsou ve vygenerovaném schématu (docs/api/TeacherControl.Api.json):
 * - GET  /api/abstence                           → seznam učitelů
 * - GET  /api/abstence/{teacherId}               → detail učitele
 * - POST /api/abstence/{teacherId}/late-arrival  { minutes }
 * - POST /api/abstence/{teacherId}/mood          { value: 1–5 }
 *
 * Schéma zatím dokumentuje jen 200, ale backend posílá i 400/401/404 a u zápisů 429
 * (sdílený 30minutový cooldown per učitel, hlavička Retry-After). Proto se kontroluje
 * `response.ok` místo `error` z klienta.
 */

/** Query key konvence: [featura, typ, ...parametry]. */
const abstenceKeys = {
  all: ['abstence'] as const,
  list: () => [...abstenceKeys.all, 'teachers'] as const,
  teacher: (teacherId: number) => ['abstence', 'teacher', teacherId] as const,
}

export class ApiError extends Error {
  readonly status: number
  readonly retryAfterSeconds: number | null

  constructor(status: number, retryAfterSeconds: number | null = null) {
    super(`API volání skončilo ${status}.`)
    this.name = 'ApiError'
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

/** Retry-After backend posílá ve vteřinách; chybí-li nebo je neplatný, vrátí null. */
function getRetryAfterSeconds(response: Response): number | null {
  const raw = response.headers.get('Retry-After')

  if (raw === null) {
    return null
  }

  const seconds = Number(raw)
  return Number.isFinite(seconds) ? seconds : null
}

/** Text pro uživatele, za jak dlouho si může zápis zopakovat. */
export function formatRetryAfter(retryAfterSeconds: number | null): string {
  if (retryAfterSeconds === null) {
    return 'za chvíli'
  }

  if (retryAfterSeconds < 60) {
    return `za ${retryAfterSeconds} s`
  }

  return `za ${Math.ceil(retryAfterSeconds / 60)} min`
}

export function useTeachers() {
  return useQuery({
    queryKey: abstenceKeys.list(),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/abstence', { signal })

      if (!response.ok || data === undefined) {
        throw new ApiError(response.status)
      }

      return data as Teacher[]
    },
  })
}

export function useTeacher(teacherId: number | null) {
  return useQuery({
    queryKey: abstenceKeys.teacher(teacherId ?? 0),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/abstence/{teacherId}', {
        params: { path: { teacherId: teacherId ?? 0 } },
        signal,
      })

      if (!response.ok || data === undefined) {
        throw new ApiError(response.status)
      }

      return data as Teacher
    },
    enabled: teacherId !== null,
  })
}

export function useSubmitLateArrival(teacherId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: LateArrivalBody) => {
      const { response } = await api.POST('/api/abstence/{teacherId}/late-arrival', {
        params: { path: { teacherId } },
        body: values,
      })

      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.status === 429 ? getRetryAfterSeconds(response) : null,
        )
      }
    },
    onSuccess: () => {
      // Odpovědí je přepočítaný učitel; invalidace celé featury zvládne seznam i detail najednou.
      queryClient.invalidateQueries({ queryKey: abstenceKeys.all })
    },
  })
}

export function useSubmitMood(teacherId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: MoodBody) => {
      const { response } = await api.POST('/api/abstence/{teacherId}/mood', {
        params: { path: { teacherId } },
        body: values,
      })

      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.status === 429 ? getRetryAfterSeconds(response) : null,
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: abstenceKeys.all })
    },
  })
}
