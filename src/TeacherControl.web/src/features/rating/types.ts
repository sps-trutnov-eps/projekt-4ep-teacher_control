import type { components } from '@/shared/api'

export const DEFAULT_TEACHER_IMAGE = 'https://images.unsplash.com/photo-1591880765528-4f5630af786c'

export type TeacherAward = components['schemas']['TeacherAwardResponse']
export type TeacherListItem = components['schemas']['TeacherListItemResponse']
export type TeacherDetails = components['schemas']['TeacherProfileResponse']

export interface TeacherProfile extends TeacherListItem, TeacherDetails {}
