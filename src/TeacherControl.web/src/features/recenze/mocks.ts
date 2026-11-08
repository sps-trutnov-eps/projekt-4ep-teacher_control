import { HttpResponse, http } from 'msw'
import type { Review, ReviewTeacher, ReviewTeacherDetail, TeacherReaction } from './types'

type TeacherSeed = [name: string, description: string]

const TEACHER_SEEDS: TeacherSeed[] = [
  ['Jan Novák', 'Vyučuje matematiku a připravuje studenty na maturitu.'],
  ['Eva Svobodová', 'Vyučuje český jazyk a literaturu.'],
  ['Petr Král', 'Vede praktickou výuku programování.'],
  ['Lucie Malá', 'Vyučuje anglický jazyk.'],
  ['Tomáš Dvořák', 'Vede výuku počítačových sítí.'],
  ['Hana Veselá', 'Vyučuje elektroniku.'],
  ['Karel Černý', 'Vyučuje fyziku.'],
  ['Martin Hola', 'Vede výuku tělesné výchovy.'],
  ['Jana Procházková', 'Vyučuje informatiku.'],
  ['David Marek', 'Vede výuku hardwaru.'],
  ['Kateřina Vávrová', 'Vyučuje biologii.'],
  ['Filip Novotný', 'Vyučuje dějepis.'],
  ['Petra Zajícová', 'Vyučuje chemii.'],
  ['Marek Vorlíček', 'Vede praktickou výuku databází.'],
  ['Veronika Pospíšilová', 'Vyučuje základy společenských věd.'],
  ['Ondřej Bárta', 'Vede praktickou výuku programování.'],
]

const REVIEW_CONTENTS = [
  'Výklad je srozumitelný a otázky dostávají dost prostoru.',
  'Hodiny jsou dobře připravené a látka navazuje na praxi.',
  'Oceňuji ochotu látku znovu vysvětlit, když něčemu nerozumíme.',
  'Tempo výuky je někdy rychlé, ale zadání jsou jasná.',
  'Přístup je férový a hodnocení odpovídá tomu, co se probíralo.',
  'Pomohly by konkrétnější pokyny k samostatným úkolům.',
]

function hashOf(value: string) {
  return [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 997, 7)
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10
}

function buildReviews(teacherId: number, count: number): Review[] {
  const seed = hashOf(String(teacherId))

  return Array.from({ length: count }, (_, index) => {
    const day = new Date(Date.UTC(2026, 9, 15) - (index * 4 + (seed % 3)) * 86_400_000)

    return {
      id: teacherId * 100 + index + 1,
      teacherId,
      content: REVIEW_CONTENTS[(seed + index) % REVIEW_CONTENTS.length],
      createdAt: day.toISOString(),
      updatedAt: null,
      isMine: false,
    }
  })
}

const teachers: ReviewTeacherDetail[] = TEACHER_SEEDS.map(([name, description], index) => {
  const id = index + 1
  const seed = hashOf(String(id))

  return {
    id,
    name,
    photoUrl: null,
    description,
    averageRating: roundToTenth(3 + (seed % 20) / 10),
    reviewCount: 0,
    likes: 0,
    dislikes: 0,
    myReaction: null,
    nickname: null,
    mood: roundToTenth(3.2 + (seed % 18) / 10),
    reviews: [],
  }
})

// Poslední učitel nemá žádnou recenzi, ať je vidět i prázdný stav.
let reviews: Review[] = teachers.flatMap((teacher, index) =>
  index === teachers.length - 1 ? [] : buildReviews(teacher.id, Math.max(3, 14 - index)),
)

function withStats(teacher: ReviewTeacherDetail): ReviewTeacherDetail {
  const own = reviews.filter((review) => review.teacherId === teacher.id)

  return { ...teacher, reviewCount: own.length, reviews: own }
}

function toSummary(teacher: ReviewTeacherDetail): ReviewTeacher {
  const summary = withStats(teacher)
  return {
    id: summary.id,
    name: summary.name,
    photoUrl: summary.photoUrl,
    description: summary.description,
    averageRating: summary.averageRating,
    reviewCount: summary.reviewCount,
    likes: summary.likes,
    dislikes: summary.dislikes,
    myReaction: summary.myReaction,
  }
}

interface CreateReviewBody {
  content: string
}

/**
 * MSW handlers for the reviews feature, matching the backend response shapes.
 * Hvězdička na začátku cesty je potřeba kvůli testům v Node.
 */
export const recenzeHandlers = [
  http.get('*/api/reviews/teachers', () => HttpResponse.json(teachers.map(toSummary))),

  http.get('*/api/reviews/teachers/:teacherId', ({ params }) => {
    const teacherId = Number(params.teacherId)
    const teacher = teachers.find((item) => item.id === teacherId)
    return teacher
      ? HttpResponse.json(withStats(teacher))
      : HttpResponse.json({ message: 'Učitel neexistuje.' }, { status: 404 })
  }),

  http.get('*/api/reviews/teachers/:teacherId/reviews', ({ params }) => {
    const teacherId = Number(params.teacherId)
    return HttpResponse.json(
      reviews
        .filter((review) => review.teacherId === teacherId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    )
  }),

  http.post('*/api/reviews/teachers/:teacherId/reviews', async ({ params, request }) => {
    const body = (await request.json()) as CreateReviewBody
    const teacherId = Number(params.teacherId)

    const created: Review = {
      id: Math.max(0, ...reviews.map((review) => review.id)) + 1,
      teacherId,
      content: body.content,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isMine: true,
    }

    reviews = [created, ...reviews]

    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/api/reviews/teachers/:teacherId/reaction', async ({ params, request }) => {
    const { value } = (await request.json()) as { value: 1 | -1 }
    const teacherId = Number(params.teacherId)
    const teacher = teachers.find((item) => item.id === teacherId)

    if (!teacher) {
      return HttpResponse.json({ message: 'Učitel neexistuje.' }, { status: 404 })
    }

    teacher.likes = teacher.likes - (teacher.myReaction === 1 ? 1 : 0) + (value === 1 ? 1 : 0)
    teacher.dislikes =
      teacher.dislikes - (teacher.myReaction === -1 ? 1 : 0) + (value === -1 ? 1 : 0)
    teacher.myReaction = value

    const reaction: TeacherReaction = {
      likes: teacher.likes,
      dislikes: teacher.dislikes,
      myReaction: teacher.myReaction,
    }

    return HttpResponse.json(reaction)
  }),
]
