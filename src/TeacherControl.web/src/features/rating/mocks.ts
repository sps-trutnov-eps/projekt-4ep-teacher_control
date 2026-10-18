import { HttpResponse, http } from 'msw'
import type { TeacherListItem, TeacherProfile } from './types'

const teachers: TeacherListItem[] = [
  {
    id: 1,
    full_name: 'Jan Novák',
    image_url: null,
    review: 4.5,
  },
  {
    id: 2,
    full_name: 'Petr Svoboda',
    image_url: null,
    review: 5,
  },
  {
    id: 3,
    full_name: 'Marie Dvořáková',
    image_url: null,
    review: null,
  },
]

const profiles: Record<number, TeacherProfile> = {
  1: {
    id: 1,
    full_name: 'Jan Novák',
    image_url: null,
    bio: 'Informace o učitelovi. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    review: 4.5,
    abstention: 5,
    binginess: 3,
    awards: [
      {
        award: 'Pololetí jenž učitel vyhrál.',
        year: '2026',
      },
    ],
  },
  2: {
    id: 2,
    full_name: 'Petr Svoboda',
    image_url: null,
    bio: 'Informace o dalším učiteli...',
    review: 5,
    abstention: 4,
    binginess: 5,
    awards: [],
  },
  3: {
    id: 3,
    full_name: 'Marie Dvořáková',
    image_url: null,
    bio: 'Další popis učitelky...',
    review: 0,
    abstention: 3,
    binginess: 2,
    awards: [
      {
        award: 'Nejlepší učitel druhého pololetí.',
        year: '2024',
      },
    ],
  },
}

export const ratingHandlers = [
  // Jediný handler pro seznam učitelů pro rating (dokud backend nedodá endpoint v OpenAPI)
  http.get('*/api/rating/teachers', () => HttpResponse.json(teachers)),

  // Profil učitele podle backendového GET /api/rating/teacher/{teacherId}/profile
  http.get('*/api/rating/teacher/:teacherId/profile', ({ params }) => {
    const id = Number(params.teacherId)
    const profile = profiles[id]
    if (profile) {
      return HttpResponse.json(profile)
    }
    return new HttpResponse(null, { status: 404 })
  }),
]
