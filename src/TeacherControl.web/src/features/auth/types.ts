import type { User } from '@/shared/auth'

export interface RegisterRequest {
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
  email: string
}

export interface ConfirmCodeRequest {
  email: string
  code: string
}

export interface ConfirmCodeResponse {
  message: string
  user: User
}

export interface ResendCodeRequest {
  email: string
}

export interface ResendCodeResponse {
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message?: string
  user: User
}

export interface ProblemDetails {
  title?: string
  status?: number
  detail?: string
}
