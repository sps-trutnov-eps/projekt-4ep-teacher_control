export type Role = 'student' | 'teacher' | 'admin'

export interface User {
  id: string
  displayName: string
  roles: Role[]
}

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  roles: Role[]
  hasRole: (role: Role) => boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}
