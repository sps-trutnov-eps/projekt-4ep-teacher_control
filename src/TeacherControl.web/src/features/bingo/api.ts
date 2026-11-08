import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type { ClaimDailyBingoWinnerRequest, CreateQuoteRequest, QuoteFilters } from './types'

/** Query key konvence: [featura, typ, ...parametry]. */
export const bingoKeys = {
  all: ['bingo'] as const,
  teachers: () => ['bingo', 'teachers'] as const,
  board: () => ['bingo', 'board'] as const,
  stats: () => ['bingo', 'stats'] as const,
  dailyWinner: () => ['bingo', 'daily-winner'] as const,
  quotes: (teacherId?: string) =>
    teacherId ? (['bingo', 'quotes', teacherId] as const) : (['bingo', 'quotes'] as const),
}

function requireApiData<T>(data: T | undefined, response: Response, operation: string): T {
  if (!response.ok || data === undefined) {
    throw new Error(`${operation} skončilo ${response.status}.`)
  }

  return data
}

/**
 * Načte učitele dostupné pro bingo.
 */
export function useBingoTeachers() {
  return useQuery({
    queryKey: bingoKeys.teachers(),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/bingo/teachers', { signal })
      return requireApiData(data, response, 'GET /api/bingo/teachers')
    },
  })
}

/**
 * Načte aktuální aktivní bingo desku přihlášeného uživatele.
 */
export function useBingoBoard() {
  return useQuery({
    queryKey: bingoKeys.board(),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/bingo/board', { signal })
      return requireApiData(data, response, 'GET /api/bingo/board')
    },
  })
}

/**
 * Vygeneruje novou náhodnou bingo desku.
 */
export function useNewBingoBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (options?: { size?: number; teacherIds?: string[] }) => {
      const targetSize = options?.size ?? 3
      const { data, response } = await api.POST('/api/bingo/board/new', {
        body: { size: targetSize, teacherIds: options?.teacherIds },
      })
      return requireApiData(data, response, 'POST /api/bingo/board/new')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bingoKeys.board() })
    },
  })
}

/**
 * Označí nebo odznačí políčko v bingo desce a přepočítá bingo counter.
 */
export function useToggleBingoCell() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cellId: string) => {
      const { data, response } = await api.POST('/api/bingo/cells/{cellId}/toggle', {
        params: { path: { cellId } },
      })
      return requireApiData(data, response, 'POST /api/bingo/cells/{cellId}/toggle')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bingoKeys.board() })
      queryClient.invalidateQueries({ queryKey: bingoKeys.stats() })
    },
  })
}

/**
 * Načte seznam všech učitelských hlášek, případně filtrovaných podle teacherId.
 */
export function useTeacherQuotes(filters: QuoteFilters = {}) {
  const teacherId = filters.teacherId

  return useQuery({
    queryKey: bingoKeys.quotes(teacherId),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/bingo/quotes', {
        params: { query: teacherId ? { teacherId } : {} },
        signal,
      })
      return requireApiData(data, response, 'GET /api/bingo/quotes')
    },
  })
}

/**
 * Přidá novou hlášku k danému učiteli.
 */
export function useCreateTeacherQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CreateQuoteRequest) => {
      const { data, response } = await api.POST('/api/bingo/quotes', { body: values })
      return requireApiData(data, response, 'POST /api/bingo/quotes')
    },
    onSuccess: () => {
      // Invaliduje všechny dotazy na hlášky (filtrované i celkové)
      queryClient.invalidateQueries({ queryKey: bingoKeys.quotes() })
    },
  })
}

/**
 * Načte statistiky a bingo counter uživatele.
 */
export function useBingoStats() {
  return useQuery({
    queryKey: bingoKeys.stats(),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/bingo/stats', { signal })
      return requireApiData(data, response, 'GET /api/bingo/stats')
    },
  })
}

/**
 * Načte vítěze dne. O tom, kdo byl první, rozhoduje server.
 */
export function useDailyBingoWinner() {
  return useQuery({
    queryKey: bingoKeys.dailyWinner(),
    queryFn: async ({ signal }) => {
      const { data, response } = await api.GET('/api/bingo/daily-winner', { signal })
      return requireApiData(data, response, 'GET /api/bingo/daily-winner')
    },
  })
}

/**
 * Pošle serveru žádost o zapsání prvního dnešního binga.
 */
export function useClaimDailyBingoWinner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ClaimDailyBingoWinnerRequest) => {
      const { data, response } = await api.POST('/api/bingo/daily-winner/claim', {
        body: request,
      })
      return requireApiData(data, response, 'POST /api/bingo/daily-winner/claim')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bingoKeys.dailyWinner() })
    },
  })
}
