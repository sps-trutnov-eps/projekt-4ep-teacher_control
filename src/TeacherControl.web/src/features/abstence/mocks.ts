import { HttpResponse, http } from 'msw'
import type { DelayEntry, Teacher } from './types'

const teachers: Teacher[] = [
  {
    id: 't-1',
    firstName: 'Jana',
    lastName: 'Nováková',
    averageDelayMinutes: 1,
    rating: 4.5,
    photoUrl: null,
  },
  {
    id: 't-2',
    firstName: 'Petr',
    lastName: 'Svoboda',
    averageDelayMinutes: 14,
    rating: 3,
    photoUrl: null,
  },
  {
    id: 't-3',
    firstName: 'Eva',
    lastName: 'Dvořáková',
    averageDelayMinutes: 6,
    rating: 4,
    photoUrl: null,
  },
  {
    id: 't-4',
    firstName: 'Martin',
    lastName: 'Černý',
    averageDelayMinutes: 22,
    rating: 2,
    photoUrl: null,
  },
  {
    id: 't-5',
    firstName: 'Lucie',
    lastName: 'Horáková',
    averageDelayMinutes: 0,
    rating: 5,
    photoUrl: null,
  },
]

let delays: DelayEntry[] = [
  {
    id: 'd-1',
    teacherId: 't-2',
    teacherName: 'Petr Svoboda',
    minutes: 15,
    authorName: 'Student Novák',
    createdAt: '2026-09-15T08:05:00.000Z',
  },
  {
    id: 'd-2',
    teacherId: 't-4',
    teacherName: 'Martin Černý',
    minutes: 25,
    authorName: 'Student Veselá',
    createdAt: '2026-09-16T10:20:00.000Z',
  },
]

/** MSW handlery featury. Přidávej sem endpointy, které backend ještě nemá hotové. */
export const abstenceHandlers = [
  http.get('/api/abstence/teachers', ({ request }) => {
    const name = new URL(request.url).searchParams.get('name')
    const result = name
      ? teachers.filter((teacher) =>
          `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(name.toLowerCase()),
        )
      : teachers

    return HttpResponse.json(result)
  }),

  http.get('/api/abstence/teachers/:id', ({ params }) => {
    const teacher = teachers.find((candidate) => candidate.id === params.id)

    if (!teacher) {
      return HttpResponse.json({ title: 'Učitel nenalezen', status: 404 }, { status: 404 })
    }

    return HttpResponse.json(teacher)
  }),

  http.get('/api/abstence/teachers/:id/delays', ({ params }) => {
    const teacherDelays = delays.filter((delay) => delay.teacherId === params.id)

    return HttpResponse.json(teacherDelays)
  }),

  http.post('/api/abstence/teachers/:id/delays', async ({ params, request }) => {
    const teacher = teachers.find((candidate) => candidate.id === params.id)

    if (!teacher) {
      return HttpResponse.json({ title: 'Učitel nenalezen', status: 404 }, { status: 404 })
    }

    const body = (await request.json()) as { minutes: number; note?: string }
    const teacherDelays = delays.filter((delay) => delay.teacherId === teacher.id)
    const totalCount = teacherDelays.length + 1
    const newAverage = (teacher.averageDelayMinutes * teacherDelays.length + body.minutes) / totalCount

    teacher.averageDelayMinutes = newAverage

    const created: DelayEntry = {
      id: `d-${delays.length + 1}`,
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      minutes: body.minutes,
      authorName: 'Přihlášený uživatel',
      createdAt: new Date().toISOString(),
    }

    delays = [...delays, created]

    return HttpResponse.json(created, { status: 201 })
  }),
]
