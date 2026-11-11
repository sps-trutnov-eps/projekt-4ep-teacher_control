import { HttpResponse, http } from 'msw'
import type { ReactionValue, Review, ReviewTeacher, ReviewTeacherDetail } from './types'

type TeacherSeed = [name: string, nickname: string | null, description: string]

const TEACHER_SEEDS: TeacherSeed[] = [
  ['Mgr. Jan Novák', 'Novi', 'Matematika. Vysvětluje na příkladech z praxe.'],
  ['Bc. Eva Svobodová', null, 'Čeština a literatura.'],
  ['Ing. Petr Král', 'Kráťa', 'Programování, webové aplikace.'],
  ['Mgr. Lucie Malá', null, 'Angličtina, příprava na maturitu.'],
  ['Mgr. Tomáš Dvořák', null, 'Počítačové sítě.'],
  ['Ing. Hana Veselá', null, 'Elektronika a měření.'],
  ['Mgr. Karel Černý', null, 'Fyzika.'],
  ['Bc. Martin Hola', null, 'Tělesná výchova.'],
  ['Mgr. Jana Procházková', null, 'Informatika.'],
  ['Ing. David Marek', null, 'Hardware a servis počítačů.'],
  ['Mgr. Kateřina Vávrová', null, 'Biologie.'],
  ['Bc. Filip Novotný', null, 'Dějepis.'],
  ['Mgr. Petra Zajícová', null, 'Chemie.'],
  ['Ing. Marek Vorlíček', null, 'Databáze.'],
  ['Mgr. Veronika Pospíšilová', null, 'Základy společenských věd.'],
  ['Ing. Ondřej Bárta', null, 'Programování.'],
]

const REVIEW_TEXTS = [
  'Super výklad, všechno dobře vysvětlí a dává smysl. Někdy je náročnější na domácí úkoly, ale jinak férový a ochotný pomoct.',
  'Nejlepší hodiny za celý týden. Když něco nechápu, vysvětlí to klidně třikrát a nikdy se nenaštve.',
  'Látku umí, ale hodiny jsou dost jednotvárné. Písemky bývají těžší, než co se probíralo.',
  'Má přehled o praxi a dává příklady ze skutečných projektů. Známkuje spravedlivě.',
  'Přísnější, ale když se člověk snaží, ocení to. Dobře připravené materiály v Teams.',
  'Termíny odevzdání se často mění na poslední chvíli a není jasné, co přesně bude v testu.',
]

function hashOf(value: number) {
  return [...String(value)].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 997, 7)
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10
}

function buildReviews(teacherId: number, count: number): Review[] {
  const seed = hashOf(teacherId)

  return Array.from({ length: count }, (_, index) => ({
    id: teacherId * 100 + index + 1,
    teacherId,
    content: REVIEW_TEXTS[(seed + index) % REVIEW_TEXTS.length],
    createdAt: new Date(
      Date.UTC(2026, 9, 15) - (index * 4 + (seed % 3)) * 86_400_000,
    ).toISOString(),
    updatedAt: null,
    isMine: false,
  }))
}

interface MockTeacher {
  id: number
  name: string
  nickname: string | null
  description: string
  /** Hvězdičkové hodnocení z featury Rating, tady jen pro čtení. */
  averageRating: number | null
}

const teachers: MockTeacher[] = TEACHER_SEEDS.map(([name, nickname, description], index) => {
  const id = index + 1
  // Poslední učitel nemá žádné hodnocení ani recenzi, ať je vidět prázdný stav.
  const isLast = index === TEACHER_SEEDS.length - 1

  return {
    id,
    name,
    nickname,
    description,
    averageRating: isLast ? null : roundToTenth(3.2 + (hashOf(id) % 18) / 10),
  }
})

let reviews: Review[] = teachers.flatMap((teacher, index) =>
  index === teachers.length - 1 ? [] : buildReviews(teacher.id, Math.max(3, 14 - index)),
)

/** Hlasy ostatních uživatelů (pevné) a hlas přihlášeného (mění se přes PUT .../reaction). */
const otherReactions = new Map<number, { likes: number; dislikes: number }>(
  teachers.map((teacher) => [
    teacher.id,
    { likes: (hashOf(teacher.id) * 3) % 40, dislikes: hashOf(teacher.id) % 9 },
  ]),
)
const myReactions = new Map<number, ReactionValue>()

function reactionStats(teacherId: number) {
  const others = otherReactions.get(teacherId) ?? { likes: 0, dislikes: 0 }
  const mine = myReactions.get(teacherId) ?? null

  return {
    likes: others.likes + (mine === 1 ? 1 : 0),
    dislikes: others.dislikes + (mine === -1 ? 1 : 0),
    myReaction: mine,
  }
}

function toSummary(teacher: MockTeacher): ReviewTeacher {
  return {
    id: teacher.id,
    name: teacher.name,
    photoUrl: null,
    description: teacher.description,
    averageRating: teacher.averageRating,
    reviewCount: reviews.filter((review) => review.teacherId === teacher.id).length,
    ...reactionStats(teacher.id),
  }
}

function reviewsOf(teacherId: number) {
  return reviews
    .filter((review) => review.teacherId === teacherId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function toDetail(teacher: MockTeacher): ReviewTeacherDetail {
  return { ...toSummary(teacher), nickname: teacher.nickname, reviews: reviewsOf(teacher.id) }
}

const notFound = () => HttpResponse.json({ message: 'Nenalezeno.' }, { status: 404 })

/**
 * MSW handlery featury Recenze — kopírují chování backendu (`/api/reviews`, docs/features/recenze.md):
 * jedna recenze na učitele (409), cizí recenzi nejde upravit (403), hlas 1 / -1.
 * Hvězdička na začátku cesty je potřeba kvůli testům v Node.
 */
export const recenzeHandlers = [
  http.get('*/api/reviews/teachers', ({ request }) => {
    const search = new URL(request.url).searchParams.get('search')?.trim().toLowerCase()

    return HttpResponse.json(
      teachers
        .filter((teacher) => !search || teacher.name.toLowerCase().includes(search))
        .map(toSummary),
    )
  }),

  http.get('*/api/reviews/teachers/:teacherId', ({ params }) => {
    const teacher = teachers.find((item) => item.id === Number(params.teacherId))
    return teacher ? HttpResponse.json(toDetail(teacher)) : notFound()
  }),

  http.get('*/api/reviews/teachers/:teacherId/reviews', ({ params }) => {
    const teacher = teachers.find((item) => item.id === Number(params.teacherId))
    return teacher ? HttpResponse.json(reviewsOf(teacher.id)) : notFound()
  }),

  http.post('*/api/reviews/teachers/:teacherId/reviews', async ({ params, request }) => {
    const teacherId = Number(params.teacherId)
    const { content } = (await request.json()) as { content: string }
    const text = content.trim()

    if (!teachers.some((item) => item.id === teacherId)) return notFound()
    if (!text || text.length > 5000) return HttpResponse.json('Neplatný text.', { status: 400 })
    if (reviews.some((review) => review.teacherId === teacherId && review.isMine)) {
      return HttpResponse.json('Tomuto učiteli už jste recenzi napsali.', { status: 409 })
    }

    const created: Review = {
      id: Math.max(0, ...reviews.map((review) => review.id)) + 1,
      teacherId,
      content: text,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isMine: true,
    }

    reviews = [created, ...reviews]

    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/api/reviews/:reviewId', async ({ params, request }) => {
    const review = reviews.find((item) => item.id === Number(params.reviewId))
    const { content } = (await request.json()) as { content: string }
    const text = content.trim()

    if (!review) return notFound()
    if (!review.isMine) return new HttpResponse(null, { status: 403 })
    if (!text || text.length > 5000) return HttpResponse.json('Neplatný text.', { status: 400 })

    const updated: Review = { ...review, content: text, updatedAt: new Date().toISOString() }
    reviews = reviews.map((item) => (item.id === updated.id ? updated : item))

    return HttpResponse.json(updated)
  }),

  http.delete('*/api/reviews/:reviewId', ({ params }) => {
    const review = reviews.find((item) => item.id === Number(params.reviewId))

    if (!review) return notFound()
    if (!review.isMine) return new HttpResponse(null, { status: 403 })

    reviews = reviews.filter((item) => item.id !== review.id)

    return new HttpResponse(null, { status: 204 })
  }),

  http.put('*/api/reviews/teachers/:teacherId/reaction', async ({ params, request }) => {
    const teacherId = Number(params.teacherId)
    const { value } = (await request.json()) as { value: number }

    if (!teachers.some((item) => item.id === teacherId)) return notFound()
    if (value !== 1 && value !== -1) {
      return HttpResponse.json('Neplatná hodnota.', { status: 400 })
    }

    myReactions.set(teacherId, value)

    return HttpResponse.json(reactionStats(teacherId))
  }),
]
