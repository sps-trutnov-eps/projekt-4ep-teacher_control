import type { User } from './types'

/** Předpřipravení uživatelé pro vývoj, než bude hotová featura F6 Login. */
export const MOCK_USERS: User[] = [
  {
    id: 'u-student',
    displayName: 'Student Novák',
    email: 'novak.student@spstrutnov.cz',
    roles: ['student'],
  },
  {
    id: 'u-teacher',
    displayName: 'Učitel Svoboda',
    email: 'svoboda.ucitel@spstrutnov.cz',
    roles: ['teacher'],
  },
  {
    id: 'u-admin',
    displayName: 'Admin Dvořák',
    email: 'dvorak.admin@spstrutnov.cz',
    roles: ['teacher', 'admin'],
  },
]

export const DEFAULT_MOCK_USER_ID = 'u-teacher'
