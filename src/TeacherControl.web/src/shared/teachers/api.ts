import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { Teacher } from './types'

const teacherKeys = {
  all: ['teachers'] as const,
  list: () => [...teacherKeys.all, 'list'] as const,
}

/**
 * Společný endpoint /api/teachers backend zatím nemá, proto se seznam bere z Pololetí,
 * které vrací přesně id, jméno a fotku. Až společný endpoint přibude, změní se jen tahle funkce.
 */
async function fetchTeachers(signal: AbortSignal): Promise<Teacher[]> {
  const { data, response } = await api.GET('/api/pololeti/teachers', { signal })

  if (!response.ok || data === undefined) {
    throw new Error(`Seznam učitelů skončil ${response.status}.`)
  }

  return data
    .map((teacher) => ({
      id: Number(teacher.teacherId),
      name: teacher.name,
      photoUrl: teacher.photoUrl,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'cs'))
}

/** Všichni učitelé podle abecedy. */
export function useTeachers() {
  return useQuery({
    queryKey: teacherKeys.list(),
    queryFn: ({ signal }) => fetchTeachers(signal),
  })
}

/** Jeden učitel ze stejného seznamu. `data` je `null`, když učitel s tímhle id není. */
export function useTeacher(teacherId: number) {
  return useQuery({
    queryKey: teacherKeys.list(),
    queryFn: ({ signal }) => fetchTeachers(signal),
    select: (teachers) => teachers.find((teacher) => teacher.id === teacherId) ?? null,
  })
}
