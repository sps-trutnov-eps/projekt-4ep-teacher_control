// Handlery se importují přímo z mocks.ts featury, ne z jejího index.ts.
// Přes barrel by se MSW protáhl do produkčního bundlu.
import { vzorHandlers } from '@/features/vzor/mocks'
import { abstenceHandlers } from '@/features/abstence/mocks'
import { ratingHandlers } from '@/features/rating/mocks'

/** Skládá MSW handlery z featur. Svoje handlery si každá featura drží ve svém mocks.ts. */
export const handlers = [...vzorHandlers, ...abstenceHandlers, ...ratingHandlers]
