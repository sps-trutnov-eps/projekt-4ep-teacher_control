import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** MSW pro testy. Používá stejné handlery jako prohlížeč, žádné zvláštní mocky pro testy. */
export const server = setupServer(...handlers)
