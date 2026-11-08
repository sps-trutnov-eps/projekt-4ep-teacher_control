export type Role = 'student' | 'teacher' | 'admin'

export interface User {
  id: string
  displayName: string
  email?: string
  roles: Role[]
}

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  roles: Role[]
  hasRole: (role: Role) => boolean
  login: (user: User) => Promise<void>
  logout: () => Promise<void>
}
