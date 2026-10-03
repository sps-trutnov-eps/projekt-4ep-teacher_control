import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/shared/api'
import type {
  BingoBoard,
  CreateQuoteRequest,
  QuoteFilters,
  TeacherQuote,
  ToggleCellResponse,
  UserBingoStats,
} from './types'

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
    queryFn: () => fetchJson<BingoBoard>('/bingo/board'),
  })
}

/**
 * Vygeneruje novou náhodnou bingo desku.
 */
export function useNewBingoBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options?: { size?: number; teacherIds?: string[] }) => {
      const targetSize = options?.size ?? 3
      return fetchJson<BingoBoard>('/bingo/board/new', {
        method: 'POST',
        body: JSON.stringify({ size: targetSize, teacherIds: options?.teacherIds }),
      })
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
    mutationFn: (cellId: string) =>
      fetchJson<ToggleCellResponse>(`/bingo/cells/${encodeURIComponent(cellId)}/toggle`, { method: 'POST' }),
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
    queryFn: () =>
      fetchJson<TeacherQuote[]>(
        filters.teacherId ? `/bingo/quotes?teacherId=${encodeURIComponent(filters.teacherId)}` : '/bingo/quotes'
      ),
  })
}

/**
 * Přidá novou hlášku k danému učiteli.
 */
export function useCreateTeacherQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CreateQuoteRequest) =>
      fetchJson<TeacherQuote>('/bingo/quotes', { method: 'POST', body: JSON.stringify(values) }),
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
    queryFn: () => fetchJson<UserBingoStats>('/bingo/stats'),
  })
}
