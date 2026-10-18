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

// Rozšíření paths pro openapi-fetch, dokud backend nevygeneruje své OpenAPI schéma do schema.d.ts
declare module '@/shared/api/generated/schema' {
  interface paths {
    '/auth/register': {
      post: {
        requestBody: {
          content: {
            'application/json': RegisterRequest
          }
        }
        responses: {
          200: {
            content: {
              'application/json': RegisterResponse
            }
          }
          400: {
            content: {
              'application/json': ProblemDetails
            }
          }
        }
      }
    }
    '/auth/confirm-code': {
      post: {
        requestBody: {
          content: {
            'application/json': ConfirmCodeRequest
          }
        }
        responses: {
          200: {
            content: {
              'application/json': ConfirmCodeResponse
            }
          }
          400: {
            content: {
              'application/json': ProblemDetails
            }
          }
        }
      }
    }
    '/auth/resend-code': {
      post: {
        requestBody: {
          content: {
            'application/json': ResendCodeRequest
          }
        }
        responses: {
          200: {
            content: {
              'application/json': ResendCodeResponse
            }
          }
          400: {
            content: {
              'application/json': ProblemDetails
            }
          }
        }
      }
    }
    '/auth/login': {
      post: {
        requestBody: {
          content: {
            'application/json': LoginRequest
          }
        }
        responses: {
          200: {
            content: {
              'application/json': LoginResponse
            }
          }
          401: {
            content: {
              'application/json': ProblemDetails
            }
          }
        }
      }
    }
    '/auth/me': {
      get: {
        responses: {
          200: {
            content: {
              'application/json': User
            }
          }
        }
      }
    }
    '/auth/logout': {
      post: {
        responses: {
          200: {
            content: {
              'application/json': { success: boolean }
            }
          }
        }
      }
    }
  }
}
