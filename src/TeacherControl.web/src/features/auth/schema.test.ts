import { describe, expect, it } from 'vitest'
import {
  confirmCodeSchema,
  loginSchema,
  registerSchema,
  schoolEmailSchema,
} from './schema'

describe('auth schemas', () => {
  describe('schoolEmailSchema', () => {
    it('accepts valid @spstrutnov.cz school email', () => {
      const validEmails = [
        'jmeno.prijmeni@spstrutnov.cz',
        'jan.novak@spstrutnov.cz',
        'STUDENT@SPSTRUTNOV.CZ',
        ' ucitel.kral@spstrutnov.cz ',
      ]

      for (const email of validEmails) {
        const result = schoolEmailSchema.safeParse(email)
        expect(result.success).toBe(true)
      }
    })

    it('rejects non-@spstrutnov.cz domain emails', () => {
      const invalidEmails = [
        'jan.novak@gmail.com',
        'jan.novak@seznam.cz',
        'student@spstrutnov.com',
        'spstrutnov.cz',
        '@spstrutnov.cz',
        '',
      ]

      for (const email of invalidEmails) {
        const result = schoolEmailSchema.safeParse(email)
        expect(result.success).toBe(false)
      }
    })
  })

  describe('registerSchema', () => {
    it('accepts valid credentials with matching passwords', () => {
      const result = registerSchema.safeParse({
        email: 'novak.jan@spstrutnov.cz',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })

      expect(result.success).toBe(true)
    })

    it('fails when password is shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        email: 'novak.jan@spstrutnov.cz',
        password: 'short',
        confirmPassword: 'short',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('8')
      }
    })

    it('fails when password and confirmPassword do not match', () => {
      const result = registerSchema.safeParse({
        email: 'novak.jan@spstrutnov.cz',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Hesla se neshodují')
      }
    })
  })

  describe('confirmCodeSchema', () => {
    it('accepts valid 6-digit confirmation code', () => {
      const result = confirmCodeSchema.safeParse({ code: '123456' })
      expect(result.success).toBe(true)
    })

    it('fails when code is not 6 digits', () => {
      const invalidCodes = ['12345', '1234567', 'abcdef', '12a456', '']
      for (const code of invalidCodes) {
        const result = confirmCodeSchema.safeParse({ code })
        expect(result.success).toBe(false)
      }
    })
  })

  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'novak.jan@spstrutnov.cz',
        password: 'SecretPassword',
      })
      expect(result.success).toBe(true)
    })

    it('fails with missing password or invalid email', () => {
      const result1 = loginSchema.safeParse({
        email: 'novak.jan@spstrutnov.cz',
        password: '',
      })
      expect(result1.success).toBe(false)

      const result2 = loginSchema.safeParse({
        email: 'novak.jan@gmail.com',
        password: 'SecretPassword',
      })
      expect(result2.success).toBe(false)
    })
  })
})
