import { HttpResponse, http } from 'msw'

/**
 * Mocky pro featuru Pololetí — endpointy jsou už ve schématu (docs/api/TeacherControl.Api.json),
 * ale lokálně nemusí backend (ani jeho Postgres) běžet. MSW je defaultně zapnutý ve vývoji
 * (vypne se přes VITE_USE_MOCKS=false), takže featura funguje i bez backendu.
 *
 * Pokryté endpointy:
 * - GET  /api/pololeti/teachers
 * - GET  /api/pololeti/teachers/{teacherId}
 * - POST /api/pololeti/teachers/{teacherId}/votes  { teacherTitleId }
 *
 * Chování odpovídá backendu: jeden hlas na titul v pololetí, opakované hlasování o stejný titul
 * hlas přesune na nově vybraného učitele. Mock uživatel je jen jeden.
 */

const teachers = [
  { teacherId: 1, name: 'Jana Nováková', photoUrl: null, description: 'Učí matematiku.' },
  { teacherId: 2, name: 'Petr Svoboda', photoUrl: null, description: 'Učí informatiku.' },
  { teacherId: 3, name: 'Eva Dvořáková', photoUrl: null, description: '' },
  { teacherId: 4, name: 'Martin Černý', photoUrl: null, description: 'Učí fyziku.' },
]

const titles = [
  { teacherTitleId: 1, title: 'Nejlepší učitel' },
  { teacherTitleId: 2, title: 'Nejvtipnější učitel' },
  { teacherTitleId: 3, title: 'Nejspravedlivější učitel' },
  { teacherTitleId: 4, title: 'Nejlepší vysvětlování' },
]

/** Hlasy ostatních studentů, ať nejsou počty na začátku prázdné. */
const otherVotes: Array<{ teacherId: number; teacherTitleId: number; count: number }> = [
  { teacherId: 1, teacherTitleId: 1, count: 12 },
  { teacherId: 2, teacherTitleId: 1, count: 9 },
  { teacherId: 2, teacherTitleId: 2, count: 15 },
  { teacherId: 4, teacherTitleId: 3, count: 4 },
]

/** Hlasy přihlášeného mock uživatele: teacherTitleId → teacherId. */
const myVotes = new Map<number, number>()

const POLOLETI_TEXT = '2026/2027 – 1. pololetí'

function toCard(teacher: (typeof teachers)[number]) {
  return {
    teacherId: teacher.teacherId,
    name: teacher.name,
    photoUrl: teacher.photoUrl,
    description: teacher.description,
    pololeti: 0,
    pololetiText: POLOLETI_TEXT,
    titles: titles.map((title) => {
      const others = otherVotes
        .filter(
          (vote) =>
            vote.teacherId === teacher.teacherId && vote.teacherTitleId === title.teacherTitleId,
        )
        .reduce((sum, vote) => sum + vote.count, 0)
      const mine = myVotes.get(title.teacherTitleId) === teacher.teacherId ? 1 : 0

      return {
        teacherTitleId: title.teacherTitleId,
        title: title.title,
        votes: others + mine,
        myVoteTeacherId: myVotes.get(title.teacherTitleId) ?? null,
      }
    }),
  }
}

export const pololetiHandlers = [
  http.get('*/api/pololeti/teachers', () =>
    HttpResponse.json(
      teachers.map(({ teacherId, name, photoUrl }) => ({ teacherId, name, photoUrl })),
    ),
  ),

  http.get('*/api/pololeti/teachers/:teacherId', ({ params }) => {
    const teacher = teachers.find((candidate) => candidate.teacherId === Number(params.teacherId))

    return teacher === undefined
      ? new HttpResponse(null, { status: 404 })
      : HttpResponse.json(toCard(teacher))
  }),

  http.post('*/api/pololeti/teachers/:teacherId/votes', async ({ request, params }) => {
    const teacher = teachers.find((candidate) => candidate.teacherId === Number(params.teacherId))

    if (teacher === undefined) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = (await request.json()) as { teacherTitleId?: unknown }
    const title = titles.find((candidate) => candidate.teacherTitleId === body.teacherTitleId)

    if (title === undefined) {
      return new HttpResponse(null, { status: 404 })
    }

    myVotes.set(title.teacherTitleId, teacher.teacherId)

    return HttpResponse.json(toCard(teacher))
  }),
]
