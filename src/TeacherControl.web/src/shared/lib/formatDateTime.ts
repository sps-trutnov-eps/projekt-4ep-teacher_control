import dayjs from 'dayjs'

/** Jednotný formát data a času pro celou aplikaci. */
export function formatDateTime(value: string): string {
  return dayjs(value).format('D. M. YYYY H:mm')
}
