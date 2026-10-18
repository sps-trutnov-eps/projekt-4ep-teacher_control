import { HttpResponse, http } from 'msw'
import type { User } from '@/shared/auth'
import type {
  ConfirmCodeRequest,
  LoginRequest,
  ProblemDetails,
  RegisterRequest,
  ResendCodeRequest,
} from './types'

interface PendingRegistration {
  password: string
  code: string
  createdAt: number
}

// Úložiště pro rozpracované registrace a vytvořené uživatele v MSW
const pendingRegistrations = new Map<string, PendingRegistration>()
const registeredUsers = new Map<string, User>()

// Výchozí demo kód pro testování ve vývoji
export const MOCK_CONFIRMATION_CODE = '123456'

export const authHandlers = [
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as RegisterRequest

    const email = body.email?.trim().toLowerCase()
    if (!email || !email.endsWith('@spstrutnov.cz')) {
      const error: ProblemDetails = {
        title: 'Neplatný e-mail',
        detail: 'Registrace je povolena pouze se školním e-mailem @spstrutnov.cz.',
        status: 400,
      }
      return HttpResponse.json(error, { status: 400 })
    }

    if (!body.password || body.password.length < 8) {
      const error: ProblemDetails = {
        title: 'Slabé heslo',
        detail: 'Heslo musí mít alespoň 8 znaků.',
        status: 400,
      }
      return HttpResponse.json(error, { status: 400 })
    }

    // Uložíme čekající registraci s výchozím kódem 123456
    pendingRegistrations.set(email, {
      password: body.password,
      code: MOCK_CONFIRMATION_CODE,
      createdAt: Date.now(),
    })

    console.info(`[MSW Auth] Potvrzovací kód pro ${email} je: ${MOCK_CONFIRMATION_CODE}`)

    return HttpResponse.json({
      message: 'Potvrzovací kód byl odeslán na váš školní e-mail.',
      email,
    })
  }),

  http.post('/api/auth/confirm-code', async ({ request }) => {
    const body = (await request.json()) as ConfirmCodeRequest
    const email = body.email?.trim().toLowerCase()
    const code = body.code?.trim()

    const pending = email ? pendingRegistrations.get(email) : null

    // Umožňujeme potvrdit buď existující čekající registraci s kódem, nebo univerzální demo kód 123456
    if (!pending && code !== MOCK_CONFIRMATION_CODE) {
      const error: ProblemDetails = {
        title: 'Registrace nenalezena',
        detail: 'Pro tento e-mail nebyla nalezena žádná čekající registrace.',
        status: 400,
      }
      return HttpResponse.json(error, { status: 400 })
    }

    if (code !== MOCK_CONFIRMATION_CODE && pending && pending.code !== code) {
      const error: ProblemDetails = {
        title: 'Neplatný kód',
        detail: 'Zadaný potvrzovací kód je nesprávný. Zkontrolujte e-mail nebo si nechte poslat nový.',
        status: 400,
      }
      return HttpResponse.json(error, { status: 400 })
    }

    const namePart = email ? email.split('@')[0] : 'student'
    const formattedName = namePart
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    const user: User = {
      id: `usr-${Date.now()}`,
      displayName: formattedName || 'Student',
      roles: ['student'],
    }

    if (email) {
      registeredUsers.set(email, user)
      pendingRegistrations.delete(email)
    }

    return HttpResponse.json({
      message: 'E-mail byl úspěšně ověřen a váš účet byl aktivován.',
      user,
    })
  }),

  http.post('/api/auth/resend-code', async ({ request }) => {
    const body = (await request.json()) as ResendCodeRequest
    const email = body.email?.trim().toLowerCase()

    if (!email || !email.endsWith('@spstrutnov.cz')) {
      const error: ProblemDetails = {
        title: 'Neplatný e-mail',
        detail: 'Zadejte platný školní e-mail @spstrutnov.cz.',
        status: 400,
      }
      return HttpResponse.json(error, { status: 400 })
    }

    const existing = pendingRegistrations.get(email)
    pendingRegistrations.set(email, {
      password: existing?.password ?? 'MockPassword123',
      code: MOCK_CONFIRMATION_CODE,
      createdAt: Date.now(),
    })

    console.info(`[MSW Auth] Nový potvrzovací kód pro ${email} je: ${MOCK_CONFIRMATION_CODE}`)

    return HttpResponse.json({
      message: 'Nový potvrzovací kód byl odeslán na váš školní e-mail.',
    })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest
    const email = body.email?.trim().toLowerCase()

    if (!email || !email.endsWith('@spstrutnov.cz') || !body.password) {
      const error: ProblemDetails = {
        title: 'Neplatné přihlašovací údaje',
        detail: 'Zadejte platný školní e-mail @spstrutnov.cz a heslo.',
        status: 401,
      }
      return HttpResponse.json(error, { status: 401 })
    }

    const existing = registeredUsers.get(email)
    const namePart = email.split('@')[0]
    const formattedName = namePart
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    const user: User = existing ?? {
      id: 'usr-demo',
      displayName: formattedName,
      roles: ['student'],
    }

    return HttpResponse.json({
      message: 'Přihlášení proběhlo úspěšně.',
      user,
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/auth/me', () => {
    const defaultUser: User = {
      id: 'usr-current',
      displayName: 'Jan Novák',
      roles: ['student'],
    }
    return HttpResponse.json(defaultUser)
  }),
]
