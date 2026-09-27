import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { DelayFormValues } from './schema'
import type { DelayEntry, Teacher, TeacherFilters } from './types'

/**
 * Endpointy abstence zatím nejsou v OpenAPI schématu (to obsahuje jen `/ratings`, protože
 * `docs/api/TeacherControl.Api.json` je stále placeholder). Situace:
 *
 * - vlastní fetch() je ve featuře zakázaný (eslint: no-restricted-globals)
 * - generovaný soubor editovat nesmíme (přepíše ho `pnpm gen:api`)
 *
 * Proto se volá generovaný klient s explicitním suppression. **Jakmile backend endpointy do
 * schématu přidá, tady se změní jen cesty a suppression se smaže.** Do té doby jedou odpovědi
 * přes MSW handlery v `mocks.ts`.
 *
 * Pozor: cesty jsou BEZ prefixu `/api` — ten přidává klient přes baseUrl (stejně jako `/ratings`).
 */
const request = async <T>(
  path: string,
  init?: { method?: 'GET' | 'POST'; body?: unknown },
): Promise<T> => {
  // @ts-expect-error endpoint ještě není ve vygenerovaném schématu, viz komentář výše
  const { data, error } = await api.request(init?.method ?? 'GET', path, { body: init?.body })

  if (error !== undefined) {
    throw new Error(`Request na ${path} selhal.`)
  }

  return data as T
}

/** Query key konvence: [featura, typ, ...parametry]. */
const abstenceKeys = {
  all: ['abstence'] as const,
  teachers: (filters: TeacherFilters) => ['abstence', 'teachers', filters] as const,
  teacher: (teacherId: string) => ['abstence', 'teacher', teacherId] as const,
  delays: (teacherId: string) => ['abstence', 'delays', teacherId] as const,
}

export function useTeachers(filters: TeacherFilters = {}) {
  return useQuery({
    queryKey: abstenceKeys.teachers(filters),
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (filters.name) {
        searchParams.set('name', filters.name)
      }
      const query = searchParams.toString()
      return request<Teacher[]>(`/abstence/teachers${query ? `?${query}` : ''}`)
    },
  })
}

export function useTeacher(teacherId: string) {
  return useQuery({
    queryKey: abstenceKeys.teacher(teacherId),
    queryFn: () => request<Teacher>(`/abstence/teachers/${teacherId}`),
    enabled: teacherId.length > 0,
  })
}

export function useTeacherDelays(teacherId: string) {
  return useQuery({
    queryKey: abstenceKeys.delays(teacherId),
    queryFn: () => request<DelayEntry[]>(`/abstence/teachers/${teacherId}/delays`),
    enabled: teacherId.length > 0,
  })
}

export function useCreateDelay(teacherId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: DelayFormValues) =>
      request<DelayEntry>(`/abstence/teachers/${teacherId}/delays`, {
        method: 'POST',
        body: values,
      }),
    onSuccess: () => {
      // Po mutaci se invaliduje celá featura: změna nálady ovlivní seznam i profil.
      queryClient.invalidateQueries({ queryKey: abstenceKeys.all })
    },
  })
}
