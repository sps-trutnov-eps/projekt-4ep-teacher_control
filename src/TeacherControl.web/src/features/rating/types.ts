import type { components } from '@/shared/api'

export const DEFAULT_TEACHER_IMAGE = 'https://images.unsplash.com/photo-1591880765528-4f5630af786c'

export type TeacherAward = components['schemas']['TeacherAwardDto']
export type TeacherListItem = components['schemas']['TeacherListItemDto']

/**
 * Doplňující údaje učitele z GET /api/rating/teacher/{id}.
 * Neobsahuje id, full_name, image_url ani review, protože ty jsou již v paměti ze seznamu učitelů (/api/rating/teachers).
 */
export interface TeacherDetails {
  bio: string
  abstention: number
  binginess: number
  awards: TeacherAward[]
}

export interface TeacherProfile extends TeacherListItem, TeacherDetails {}
