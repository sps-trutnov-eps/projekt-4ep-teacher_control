// Handlery se importují přímo z mocks.ts featury, ne z jejího index.ts.
// Přes barrel by se MSW protáhl do produkčního bundlu.
import { vzorHandlers } from '@/features/vzor/mocks'
import { bingoHandlers } from '@/features/bingo/mocks'
import { abstenceHandlers } from '@/features/abstence/mocks'
import { pololetiHandlers } from '@/features/pololeti/mocks'
import { ratingHandlers } from '@/features/rating/mocks'
import { authHandlers } from '@/features/auth/mocks'
import { recenzeHandlers } from '@/features/recenze/mocks'
import { versionHandlers } from './version'

/** Skládá MSW handlery z featur. Svoje handlery si každá featura drží ve svém mocks.ts. */
export const handlers = [
  ...versionHandlers,
  ...vzorHandlers,
  ...bingoHandlers,
  ...abstenceHandlers,
  ...ratingHandlers,
  ...authHandlers,
  ...pololetiHandlers,
  ...recenzeHandlers,
]
