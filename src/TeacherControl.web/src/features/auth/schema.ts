import { z } from 'zod'

/** Validace školního e-mailu s doménou @spstrutnov.cz */
export const schoolEmailSchema = z
  .string()
  .trim()
  .min(1, 'E-mail je povinný')
  .email('Zadej platnou e-mailovou adresu')
  .refine((email) => email.toLowerCase().endsWith('@spstrutnov.cz'), {
    message: 'E-mail musí mít školní doménu @spstrutnov.cz (např. jmeno.prijmeni@spstrutnov.cz)',
  })

/** Krok 1 registrace: zadání údajů */
export const registerSchema = z
  .object({
    email: schoolEmailSchema,
    password: z
      .string()
      .min(8, 'Heslo musí mít alespoň 8 znaků')
      .regex(/[a-z]/, 'Heslo musí obsahovat alespoň jedno malé písmeno')
      .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno')
      .regex(/[0-9]/, 'Heslo musí obsahovat alespoň jednu číslici')
      .regex(/[^a-zA-Z0-9]/, 'Heslo musí obsahovat alespoň jeden speciální znak'),
    confirmPassword: z.string().min(1, 'Zadej potvrzení hesla'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hesla se neshodují',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

/** Krok 2 registrace: ověření potvrzovacího kódu */
export const confirmCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Potvrzovací kód je povinný')
    .regex(/^\d{6}$/, 'Potvrzovací kód se skládá ze 6 číslic'),
})

export type ConfirmCodeFormValues = z.infer<typeof confirmCodeSchema>

/** Přihlašovací formulář */
export const loginSchema = z.object({
  email: schoolEmailSchema,
  password: z.string().min(1, 'Heslo je povinné'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
