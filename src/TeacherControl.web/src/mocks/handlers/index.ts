import { ratingHandlers } from '@/features/rating'
import { bingoHandlers } from '@/features/bingo'

/** Skládá MSW handlery z featur. Svoje handlery si každá featura drží ve svém mocks.ts. */
export const handlers = [...ratingHandlers, ...bingoHandlers]

