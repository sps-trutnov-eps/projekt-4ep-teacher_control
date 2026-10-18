import { ratingHandlers } from '@/features/rating'
import { authHandlers } from '@/features/auth'

/** Skládá MSW handlery z featur. Svoje handlery si každá featura drží ve svém mocks.ts. */
export const handlers = [...ratingHandlers, ...authHandlers]
