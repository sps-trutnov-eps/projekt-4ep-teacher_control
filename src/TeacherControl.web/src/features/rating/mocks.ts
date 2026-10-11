import { HttpResponse, http } from 'msw'
import type { TeacherProfile } from './types'

const teachers: TeacherProfile[] = [
  {
    id: 1,
    fullName: 'Jan Novák',
    full_name: 'Jan Novák',
    imageUrl: null,
    image_url: null,
    photoUrl: null,
    bio: 'Informace o učitelovi Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    description:
      'Informace o učitelovi Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    review: 4.5,
    averageRating: 4.5,
    abstention: 5,
    absence: 5,
    binginess: 3,
    bingo: 3,
    award: 'Pololetí jenž učitel vyhrál.',
    year: '2026',
    awards: [
      {
        id: 'a-1',
        name: 'Pololetí jenž učitel vyhrál.',
        year: '2026',
        description: 'Nejlepší učitel prvního pololetí.',
      },
    ],
  },
  {
    id: 2,
    fullName: 'Petr Svoboda',
    full_name: 'Petr Svoboda',
    imageUrl: null,
    image_url: null,
    photoUrl: null,
    bio: 'Informace o dalším učiteli...',
    description: 'Informace o dalším učiteli...',
    review: 5,
    averageRating: 5,
    abstention: 4,
    absence: 4,
    binginess: 5,
    bingo: 5,
    award: null,
    year: null,
    awards: [],
  },
  {
    id: 3,
    fullName: 'Marie Dvořáková',
    full_name: 'Marie Dvořáková',
    imageUrl: null,
    image_url: null,
    photoUrl: null,
    bio: 'Další popis učitelky...',
    description: 'Další popis učitelky...',
    review: 3.5,
    averageRating: 3.5,
    abstention: 3,
    absence: 3,
    binginess: 2,
    bingo: 2,
    award: 'Nejlepší učitel druhého pololetí.',
    year: '2024',
    awards: [
      {
        id: 'a-2',
        name: 'Nejlepší učitel druhého pololetí.',
        year: '2024',
        description: 'Ocenění z roku 2024.',
      },
    ],
  },
]

export const ratingHandlers = [
  // List endpoint
  http.get('*/api/teachers', () => HttpResponse.json(teachers)),
  http.get('*/api/rating/teachers', () => HttpResponse.json(teachers)),

  // Detail endpoint podle RatingController.cs a specifikace
  http.get('*/api/rating/teacher/:teacherId/profile', ({ params }) => {
    const rawId = String(params.teacherId).replace('t-', '')
    const teacher = teachers.find(
      (t) => String(t.id) === rawId || String(t.id) === String(params.teacherId),
    )
    if (teacher) {
      return HttpResponse.json(teacher)
    }
    return new HttpResponse(null, { status: 404 })
  }),
]
