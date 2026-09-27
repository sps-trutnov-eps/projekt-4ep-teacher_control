// Handlery se importují přímo z mocks.ts featury, ne z jejího index.ts.
// Přes barrel by se MSW protáhl do produkčního bundlu.
import { vzorHandlers } from '@/features/vzor/mocks'

/** Skládá MSW handlery z featur. Svoje handlery si každá featura drží ve svém mocks.ts. */
export const handlers = [...vzorHandlers]
