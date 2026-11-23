import type { ComponentType } from 'react'

/** Učitel tak, jak ho potřebuje celá aplikace. `id` je id učitele v databázi, stejné ve všech featurách. */
export interface Teacher {
  id: number
  name: string
  photoUrl: string | null
}

/** Props, které dostane sekce featury v profilu učitele. */
export interface TeacherSectionProps {
  teacherId: number
}

/** Jedna sekce profilu učitele, zapisuje se v `src/routes/teacherSections.tsx`. */
export interface TeacherSection {
  /** Slouží i jako kotva v adrese, třeba `/ucitel/3#recenze`. */
  id: string
  title: string
  /** Dokud chybí, je v profilu jen prázdné místo s nadpisem. */
  Component?: ComponentType<TeacherSectionProps>
}
