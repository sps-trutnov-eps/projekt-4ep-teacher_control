import { HttpResponse, http } from 'msw'
import type { Teacher } from './types'

const teachers: Teacher[] = [
  {
    id: 't-1',
    firstName: 'Jan',
    lastName: 'Novák',
    photoUrl: null,
    description:
      'Informace o učitelovi Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    ratings: {
      overall: 4,
      absence: 5,
      bingo: 3,
    },
    awards: [
      {
        id: 'a-1',
        name: 'Pololetí jenž učitel vyhrál.',
        description: 'Nejlepší učitel prvního pololetí.',
      },
    ],
  },
  {
    id: 't-2',
    firstName: 'Petr',
    lastName: 'Svoboda',
    photoUrl: null,
    description: 'Informace o dalším učiteli...',
    ratings: {
      overall: 5,
      absence: 4,
      bingo: 5,
    },
    awards: [],
  },
  {
    id: 't-3',
    firstName: 'Marie',
    lastName: 'Dvořáková',
    photoUrl: null,
    description: 'Další popis učitelky...',
    ratings: {
      overall: 3,
      absence: 3,
      bingo: 2,
    },
    awards: [
      {
        id: 'a-2',
        name: 'Nejlepší učitel druhého pololetí.',
        description: 'Ocenění z roku 2024.',
      },
    ],
  },
]

export const ratingHandlers = [
  // List endpoint (not in OpenAPI yet)
  http.get('*/api/teachers', () => HttpResponse.json(teachers)),

  // Detail endpoint
  http.get('*/api/Rating/teacher/:teacherId', ({ params }) => {
    const teacher = teachers.find(
      (t) => t.id === params.teacherId || t.id === `t-${params.teacherId}`,
    )
    if (teacher) {
      return HttpResponse.json(teacher)
    }
    return new HttpResponse(null, { status: 404 })
  }),
]
