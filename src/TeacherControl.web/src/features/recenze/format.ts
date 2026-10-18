import type { ReviewTeacher } from './types'

const ratingFormatter = new Intl.NumberFormat('cs-CZ', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})

export function formatTeacherName(
  teacher: Pick<ReviewTeacher, 'degree' | 'firstName' | 'lastName'>,
) {
  return [teacher.degree, teacher.firstName, teacher.lastName].filter(Boolean).join(' ')
}

/** 4.2 → „4,2“ */
export function formatRating(value: number) {
  return ratingFormatter.format(value)
}

export function formatReviewDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

/** 1 recenze, 2–4 recenze, 0 a 5+ recenzí. */
export function formatReviewCount(count: number) {
  if (count === 1) return '1 recenze'
  if (count >= 2 && count <= 4) return `${count} recenze`
  return `${count} recenzí`
}
