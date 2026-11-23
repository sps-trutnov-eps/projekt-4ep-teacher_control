/** Adresa profilu učitele. Odkazy na profil skládej přes tuhle funkci, ne ručně. */
export function teacherProfilePath(teacherId: number): string {
  return `/ucitel/${teacherId}`
}
