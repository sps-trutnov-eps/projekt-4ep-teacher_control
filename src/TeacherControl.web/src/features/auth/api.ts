import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type {
  ConfirmCodeRequest,
  ConfirmCodeResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendCodeRequest,
  ResendCodeResponse,
} from './types'

export const authKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
}

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: async (values) => {
      const { data, error } = await api.POST('/auth/register', { body: values })

      if (error) {
        throw new Error(error.detail ?? error.title ?? 'Registrace se nezdařila.')
      }

      return data
    },
  })
}

export function useConfirmCode() {
  const queryClient = useQueryClient()

  return useMutation<ConfirmCodeResponse, Error, ConfirmCodeRequest>({
    mutationFn: async (values) => {
      const { data, error } = await api.POST('/auth/confirm-code', { body: values })

      if (error) {
        throw new Error(error.detail ?? error.title ?? 'Ověření kódu se nezdařilo.')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
  })
}

export function useResendCode() {
  return useMutation<ResendCodeResponse, Error, ResendCodeRequest>({
    mutationFn: async (values) => {
      const { data, error } = await api.POST('/auth/resend-code', { body: values })

      if (error) {
        throw new Error(error.detail ?? error.title ?? 'Opětovné odeslání kódu se nezdařilo.')
      }

      return data
    },
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (values) => {
      const { data, error } = await api.POST('/auth/login', { body: values })

      if (error) {
        throw new Error(error.detail ?? error.title ?? 'Přihlášení se nezdařilo.')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const { data, error } = await api.GET('/auth/me')

      if (error) {
        throw new Error('Nepodařilo se načíst profil uživatele.')
      }

      return data
    },
  })
}
