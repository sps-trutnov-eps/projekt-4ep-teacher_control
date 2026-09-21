/**
 * Dokud endpoint není v OpenAPI, popíše si featura tvar odpovědi sama.
 * Až tam bude, tenhle soubor zmizí a typ se bere z `components['schemas']['…']`.
 */
export interface VzorItem {
  id: string
  title: string
  note: string | null
  authorName: string
  createdAt: string
}
