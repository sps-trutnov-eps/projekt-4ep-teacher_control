import { HttpResponse, http } from 'msw'

/** Verze aplikace v navigaci. Endpoint není featura, proto handler leží tady. */
export const versionHandlers = [
  http.get('*/api/version', () =>
    HttpResponse.json({
      sha: '0000000000000000000000000000000000000000',
      message: 'Mock verze',
      author: null,
      date: null,
      url: null,
    }),
  ),
]
