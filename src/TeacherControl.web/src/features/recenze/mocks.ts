import { HttpResponse, http } from 'msw'
import type { Review, ReviewSort, ReviewTeacher, ReviewTeacherDetail, ReviewVote } from './types'

type TeacherSeed = [degree: string, firstName: string, lastName: string, subject: string]

const TEACHER_SEEDS: TeacherSeed[] = [
  ['Mgr.', 'Jan', 'Novák', 'Matematika'],
  ['Bc.', 'Eva', 'Svobodová', 'Čeština'],
  ['Ing.', 'Petr', 'Král', 'Programování'],
  ['Mgr.', 'Lucie', 'Malá', 'Angličtina'],
  ['Mgr.', 'Tomáš', 'Dvořák', 'Počítačové sítě'],
  ['Ing.', 'Hana', 'Veselá', 'Elektronika'],
  ['Mgr.', 'Karel', 'Černý', 'Fyzika'],
  ['Bc.', 'Martin', 'Hola', 'Tělesná výchova'],
  ['Mgr.', 'Jana', 'Procházková', 'Informatika'],
  ['Ing.', 'David', 'Marek', 'Hardware'],
  ['Mgr.', 'Kateřina', 'Vávrová', 'Biologie'],
  ['Bc.', 'Filip', 'Novotný', 'Dějepis'],
  ['Mgr.', 'Petra', 'Zajícová', 'Chemie'],
  ['Ing.', 'Marek', 'Vorlíček', 'Databáze'],
  ['Mgr.', 'Veronika', 'Pospíšilová', 'ZSV'],
  ['Ing.', 'Ondřej', 'Bárta', 'Programování'],
]

const CATEGORY_LABELS: [key: string, label: string][] = [
  ['explanation', 'Výklad'],
  ['fairness', 'Spravedlnost'],
  ['approach', 'Přístup k žákům'],
  ['difficulty', 'Náročnost'],
  ['atmosphere', 'Atmosféra'],
]

const CLASSES = ['1.EP', '2.EP', '3.EP', '4.EP', '2.IT', '3.IT']

const REVIEW_TEXTS: [rating: number, title: string | null, text: string][] = [
  [
    4,
    'Skvělý výklad',
    'Super výklad, všechno dobře vysvětlí a dává smysl. Někdy je náročnější na domácí úkoly, ale jinak férový a ochotný pomoct.',
  ],
  [
    5,
    null,
    'Nejlepší hodiny za celý týden. Když něco nechápu, vysvětlí to klidně třikrát a nikdy se nenaštve.',
  ],
  [
    3,
    'Průměr',
    'Látku umí, ale hodiny jsou dost jednotvárné. Písemky bývají těžší, než co se probíralo.',
  ],
  [
    5,
    'Doporučuji',
    'Má přehled o praxi a dává příklady ze skutečných projektů. Známkuje spravedlivě.',
  ],
  [4, null, 'Přísnější, ale když se člověk snaží, ocení to. Dobře připravené materiály v Teams.'],
  [
    2,
    'Chaos v termínech',
    'Termíny odevzdání se často mění na poslední chvíli a není jasné, co přesně bude v testu.',
  ],
]

function hashOf(value: string) {
  return [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 997, 7)
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10
}

function buildReviews(teacherId: string, count: number): Review[] {
  const seed = hashOf(teacherId)

  return Array.from({ length: count }, (_, index) => {
    const [rating, title, text] = REVIEW_TEXTS[(seed + index) % REVIEW_TEXTS.length]
    const day = new Date(Date.UTC(2026, 9, 15) - (index * 4 + (seed % 3)) * 86_400_000)

    return {
      id: `${teacherId}-r${index + 1}`,
      teacherId,
      authorName: index % 4 === 3 ? 'Student Novák' : null,
      className: index % 3 === 2 ? null : CLASSES[(seed + index) % CLASSES.length],
      rating,
      title,
      text,
      createdAt: day.toISOString(),
      likes: (seed + index * 7) % 14,
      dislikes: (seed + index * 3) % 4,
      myVote: null,
    }
  })
}

const teachers: ReviewTeacherDetail[] = TEACHER_SEEDS.map(
  ([degree, firstName, lastName, subject], index) => {
    const id = `t-${index + 1}`
    const seed = hashOf(id)

    return {
      id,
      degree,
      firstName,
      lastName,
      subject,
      photoUrl: null,
      averageRating: null,
      reviewCount: 0,
      school: 'SPŠ Trutnov',
      classes: [CLASSES[seed % 3], CLASSES[(seed % 3) + 1], CLASSES[(seed % 3) + 2]],
      categories: CATEGORY_LABELS.map(([key, label], categoryIndex) => ({
        key,
        label,
        value: roundToTenth(3.2 + ((seed + categoryIndex * 13) % 18) / 10),
      })),
    }
  },
)

// Poslední učitel nemá žádnou recenzi, ať je vidět i prázdný stav.
let reviews: Review[] = teachers.flatMap((teacher, index) =>
  index === teachers.length - 1 ? [] : buildReviews(teacher.id, Math.max(3, 14 - index)),
)

function withStats(teacher: ReviewTeacherDetail): ReviewTeacherDetail {
  const own = reviews.filter((review) => review.teacherId === teacher.id)
  const average = own.length
    ? roundToTenth(own.reduce((sum, review) => sum + review.rating, 0) / own.length)
    : null

  return { ...teacher, averageRating: average, reviewCount: own.length }
}

function toSummary(teacher: ReviewTeacherDetail): ReviewTeacher {
  const { id, degree, firstName, lastName, subject, photoUrl, averageRating, reviewCount } =
    withStats(teacher)
  return { id, degree, firstName, lastName, subject, photoUrl, averageRating, reviewCount }
}

const REVIEW_SORTERS: Record<ReviewSort, (a: Review, b: Review) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  best: (a, b) => b.rating - a.rating,
  helpful: (a, b) => b.likes - b.dislikes - (a.likes - a.dislikes),
}

interface CreateReviewBody {
  rating: number
  title: string | null
  text: string
  anonymous: boolean
  showClass: boolean
}

/**
 * MSW handlery featury Recenze — backend recenze zatím nemá.
 * Hvězdička na začátku cesty je potřeba kvůli testům v Node.
 */
export const recenzeHandlers = [
  http.get('*/api/recenze/teachers', () => HttpResponse.json(teachers.map(toSummary))),

  http.get('*/api/recenze/teachers/:teacherId', ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId)
    return teacher
      ? HttpResponse.json(withStats(teacher))
      : HttpResponse.json({ message: 'Učitel neexistuje.' }, { status: 404 })
  }),

  http.get('*/api/recenze/teachers/:teacherId/reviews', ({ params, request }) => {
    const sortParam = new URL(request.url).searchParams.get('sort')
    const sort: ReviewSort =
      sortParam && sortParam in REVIEW_SORTERS ? (sortParam as ReviewSort) : 'newest'

    return HttpResponse.json(
      reviews.filter((review) => review.teacherId === params.teacherId).sort(REVIEW_SORTERS[sort]),
    )
  }),

  http.post('*/api/recenze/teachers/:teacherId/reviews', async ({ params, request }) => {
    const body = (await request.json()) as CreateReviewBody

    const created: Review = {
      id: crypto.randomUUID(),
      teacherId: String(params.teacherId),
      authorName: body.anonymous ? null : 'Přihlášený uživatel',
      className: body.showClass ? '2.EP' : null,
      rating: body.rating,
      title: body.title,
      text: body.text,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      myVote: null,
    }

    reviews = [created, ...reviews]

    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/api/recenze/reviews/:reviewId/vote', async ({ params, request }) => {
    const { vote } = (await request.json()) as { vote: ReviewVote | null }
    const review = reviews.find((item) => item.id === params.reviewId)

    if (!review) {
      return HttpResponse.json({ message: 'Recenze neexistuje.' }, { status: 404 })
    }

    const updated: Review = {
      ...review,
      likes: review.likes - (review.myVote === 'like' ? 1 : 0) + (vote === 'like' ? 1 : 0),
      dislikes:
        review.dislikes - (review.myVote === 'dislike' ? 1 : 0) + (vote === 'dislike' ? 1 : 0),
      myVote: vote,
    }

    reviews = reviews.map((item) => (item.id === updated.id ? updated : item))

    return HttpResponse.json(updated)
  }),
]
