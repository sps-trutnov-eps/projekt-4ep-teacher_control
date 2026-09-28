/**
 * Featura Abstence už nepotřebuje MSW mocky — endpointy jsou ve schématu
 * (docs/api/TeacherControl.Api.json) a hooky z api.ts jedou proti reálnému API:
 *
 * - GET  /api/abstence
 * - GET  /api/abstence/{teacherId}
 * - POST /api/abstence/{teacherId}/late-arrival  { minutes }
 * - POST /api/abstence/{teacherId}/mood          { value: 1–5 }
 *
 * Kdyby backend vypadal jinak, mocky se vrátí sem a zaregistrují v src/mocks/handlers/index.ts.
 */
export const abstenceHandlers = []
