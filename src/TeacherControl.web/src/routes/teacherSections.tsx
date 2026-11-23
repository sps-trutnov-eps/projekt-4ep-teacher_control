import type { TeacherSection } from '@/shared/teachers'

/**
 * Sekce profilu učitele (`/ucitel/<id>`), každá featura má jednu.
 * Až budeš mít sekci hotovou, doplň u své featury `Component`. Dostane `teacherId`,
 * nadpis a kartu kolem kreslí profil. Návod je v `src/shared/teachers/README.md`.
 */
export const TEACHER_SECTIONS: TeacherSection[] = [
  { id: 'rating', title: 'Hodnocení' },
  { id: 'recenze', title: 'Recenze' },
  { id: 'abstence', title: 'Nálada a pozdní příchody' },
  { id: 'pololeti', title: 'Pololetní hlasování' },
  { id: 'bingo', title: 'Hlášky' },
]
