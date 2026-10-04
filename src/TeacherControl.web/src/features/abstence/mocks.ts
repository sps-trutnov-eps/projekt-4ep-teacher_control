import { HttpResponse, http } from 'msw'

/**
 * Mocky pro featuru Abstence — endpointy jsou už ve schématu (docs/api/TeacherControl.Api.json),
 * ale lokálně nemusí backend (ani jeho Postgres) běžet. MSW je defaultně zapnutý ve vývoji
 * (vypne se přes VITE_USE_MOCKS=false), takže featura funguje i bez backendu.
 *
 * Pokryté endpointy:
 * - GET  /api/abstence
 * - GET  /api/abstence/{teacherId}
 * - POST /api/abstence/{teacherId}/late-arrival  { minutes }
 * - POST /api/abstence/{teacherId}/mood          { value: 1–5 }
 */

/** Druhá osoba v datech slouží jako „odběhnutý“ učitel pro testování cooldownu (429). */
const teachers: Array<{
  teacherId: number
  name: string
  photoUrl: string | null
  rating: number | null
  mood: number
  lateArrivalMinutesToday: number
  lastSubmissionAt: Date | null
}> = [
  {
    teacherId: 1,
    name: 'Jana Nováková',
    photoUrl: null,
    rating: 4.5,
    mood: 2,
    lateArrivalMinutesToday: 0,
    lastSubmissionAt: null,
  },
  {
    teacherId: 2,
    name: 'Petr Svoboda',
    photoUrl: null,
    rating: 3,
    mood: 4,
    lateArrivalMinutesToday: 15,
    lastSubmissionAt: null,
  },
  {
    teacherId: 3,
    name: 'Eva Dvořáková',
    photoUrl: null,
    rating: null,
    mood: 3,
    lateArrivalMinutesToday: 0,
    lastSubmissionAt: null,
  },
  {
    teacherId: 4,
    name: 'Martin Černý',
    photoUrl: null,
    rating: 2,
    mood: 5,
    lateArrivalMinutesToday: 25,
    lastSubmissionAt: null,
  },
]

const COOLDOWN_MS = 30 * 60 * 1000
const jsonHeaders = { 'Content-Type': 'application/json' }

function toDto(teacher: (typeof teachers)[number]) {
  return {
    teacherId: teacher.teacherId,
    name: teacher.name,
    photoUrl: teacher.photoUrl,
    rating: teacher.rating,
    mood: teacher.mood,
    lateArrivalMinutesToday: teacher.lateArrivalMinutesToday,
  }
}

/** Chování odpovídá backendu: sdílený 30minutový cooldown per učitel (429 + Retry-After). */
function checkCooldown(teacher: (typeof teachers)[number]): HttpResponse<string> | null {
  if (
    teacher.lastSubmissionAt !== null &&
    Date.now() - teacher.lastSubmissionAt.getTime() < COOLDOWN_MS
  ) {
    const retryAfterSeconds = Math.ceil(
      (COOLDOWN_MS - (Date.now() - teacher.lastSubmissionAt.getTime())) / 1000,
    )
    return HttpResponse.json('A submission for this teacher was made less than 30 minutes ago.', {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    })
  }

  return null
}

export const abstenceHandlers = [
  http.get('*/api/abstence', () => HttpResponse.json(teachers.map(toDto))),

  http.get('*/api/abstence/:teacherId', ({ params }) => {
    const teacher = teachers.find((candidate) => candidate.teacherId === Number(params.teacherId))

    return teacher === undefined ? new HttpResponse(null, { status: 404 }) : HttpResponse.json(toDto(teacher))
  }),

  http.post('*/api/abstence/:teacherId/late-arrival', async ({ request, params }) => {
    const teacher = teachers.find((candidate) => candidate.teacherId === Number(params.teacherId))

    if (teacher === undefined) {
      return new HttpResponse(null, { status: 404 })
    }

    const cooldown = checkCooldown(teacher)
    if (cooldown !== null) {
      return cooldown
    }

    const body = (await request.json()) as { minutes?: unknown }
    if (typeof body.minutes !== 'number' || !Number.isInteger(body.minutes) || body.minutes <= 0) {
      return HttpResponse.json('Minutes must be greater than zero.', { status: 400 })
    }

    teacher.lateArrivalMinutesToday += body.minutes
    teacher.lastSubmissionAt = new Date()

    return HttpResponse.json(toDto(teacher), { headers: jsonHeaders })
  }),

  http.post('*/api/abstence/:teacherId/mood', async ({ request, params }) => {
    const teacher = teachers.find((candidate) => candidate.teacherId === Number(params.teacherId))

    if (teacher === undefined) {
      return new HttpResponse(null, { status: 404 })
    }

    const cooldown = checkCooldown(teacher)
    if (cooldown !== null) {
      return cooldown
    }

    const body = (await request.json()) as { value?: unknown }
    if (typeof body.value !== 'number' || body.value < 1 || body.value > 5) {
      return HttpResponse.json('Value must be between 1 and 5.', { status: 400 })
    }

    teacher.mood = body.value
    teacher.lastSubmissionAt = new Date()

    return HttpResponse.json(toDto(teacher), { headers: jsonHeaders })
  }),
]
