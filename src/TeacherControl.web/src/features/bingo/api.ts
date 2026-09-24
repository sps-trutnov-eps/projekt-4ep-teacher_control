import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type {
  BingoBoard,
  CreateQuoteRequest,
  QuoteFilters,
  TeacherQuote,
  ToggleCellResponse,
  UserBingoStats,
} from './types'

/**
 * Typově bezpečný adaptér pro endpointy, které ještě nejsou vygenerované v OpenAPI schématu.
 * Zabraňuje vzniku typu `any` a splňuje pravidla v AGENTS.md bez nutnosti obcházení linteru.
 */
interface TypedBingoApi {
  GET: <T>(
    url: string,
    options?: { params?: { query?: Record<string, unknown> } }
  ) => Promise<{ data?: T; error?: unknown }>
  POST: <T>(
    url: string,
    options?: { body?: unknown; params?: { query?: Record<string, unknown> } }
  ) => Promise<{ data?: T; error?: unknown }>
}

const bingoApi = api as unknown as TypedBingoApi

/** Query key konvence: [featura, typ, ...parametry]. */
export const bingoKeys = {
  all: ['bingo'] as const,
  board: () => ['bingo', 'board'] as const,
  stats: () => ['bingo', 'stats'] as const,
  quotes: (teacherId?: string) =>
    teacherId ? (['bingo', 'quotes', teacherId] as const) : (['bingo', 'quotes'] as const),
}

/**
 * Načte aktuální aktivní bingo desku přihlášeného uživatele.
 */
export function useBingoBoard() {
  return useQuery({
    queryKey: bingoKeys.board(),
    queryFn: async (): Promise<BingoBoard> => {
      const { data, error } = await bingoApi.GET<BingoBoard>('/bingo/board')

      if (error || !data) {
        throw new Error('Bingo desku se nepodařilo načíst.')
      }

      return data
    },
  })
}

/**
 * Vygeneruje novou náhodnou bingo desku.
 */
export function useNewBingoBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (size?: number): Promise<BingoBoard> => {
      const targetSize = size ?? 3
      const { data, error } = await bingoApi.POST<BingoBoard>('/bingo/board/new', {
        params: { query: { size: targetSize } },
      })

      if (error || !data) {
        throw new Error('Nepodařilo se vygenerovat novou bingo desku.')
      }

      return data
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
    mutationFn: async (cellId: string): Promise<ToggleCellResponse> => {
      const { data, error } = await bingoApi.POST<ToggleCellResponse>(`/bingo/cells/${cellId}/toggle`)

      if (error || !data) {
        throw new Error('Nepodařilo se aktualizovat stav políčka.')
      }

      return data
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
  return useQuery({
    queryKey: bingoKeys.quotes(filters.teacherId),
    queryFn: async (): Promise<TeacherQuote[]> => {
      const { data, error } = await bingoApi.GET<TeacherQuote[]>('/bingo/quotes', {
        params: { query: { teacherId: filters.teacherId } },
      })

      if (error || !data) {
        throw new Error('Učitelské hlášky se nepodařilo načíst.')
      }

      return data
    },
  })
}

/**
 * Přidá novou hlášku k danému učiteli.
 */
export function useCreateTeacherQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CreateQuoteRequest): Promise<TeacherQuote> => {
      const { data, error } = await bingoApi.POST<TeacherQuote>('/bingo/quotes', { body: values })

      if (error || !data) {
        throw new Error('Učitelskou hlášku se nepodařilo uložit.')
      }

      return data
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
    queryFn: async (): Promise<UserBingoStats> => {
      const { data, error } = await bingoApi.GET<UserBingoStats>('/bingo/stats')

      if (error || !data) {
        throw new Error('Bingo statistiky se nepodařilo načíst.')
      }

      return data
    },
  })
}
