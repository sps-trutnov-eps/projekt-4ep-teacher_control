import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import type {
  BingoBoard,
  CreateQuoteRequest,
  TeacherQuote,
  ToggleCellResponse,
  UserBingoStats,
} from './types'

/** Query key konvence: [featura, typ, ...parametry]. */
export const bingoKeys = {
  all: ['bingo'] as const,
  board: () => ['bingo', 'board'] as const,
  stats: () => ['bingo', 'stats'] as const,
  quotes: (teacherId?: string) => ['bingo', 'quotes', teacherId] as const,
}

/**
 * Načte aktuální aktivní bingo desku přihlášeného uživatele.
 */
export function useBingoBoard() {
  return useQuery({
    queryKey: bingoKeys.board(),
    queryFn: async (): Promise<BingoBoard> => {
      // @ts-expect-error Endpoint zatím není v generovaném OpenAPI schématu, ve vývoji ho obsluhuje MSW
      const { data, error } = await api.GET('/bingo/board')

      if (error || !data) {
        throw new Error('Bingo desku se nepodařilo načíst.')
      }

      return data as unknown as BingoBoard
    },
  })
}

/**
 * Vygeneruje novou náhodnou bingo desku.
 */
export function useNewBingoBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (size = 3): Promise<BingoBoard> => {
      // @ts-expect-error Endpoint zatím není v generovaném OpenAPI schématu, ve vývoji ho obsluhuje MSW
      const { data, error } = await api.POST('/bingo/board/new', {
        params: { query: { size } },
      })

      if (error || !data) {
        throw new Error('Nepodařilo se vygenerovat novou bingo desku.')
      }

      return data as unknown as BingoBoard
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
      // @ts-expect-error Endpoint zatím není v generovaném OpenAPI schématu, ve vývoji ho obsluhuje MSW
      const { data, error } = await api.POST(`/bingo/cells/${cellId}/toggle`)

      if (error || !data) {
        throw new Error('Nepodařilo se aktualizovat stav políčka.')
      }

      return data as unknown as ToggleCellResponse
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
export function useTeacherQuotes(teacherId?: string) {
  return useQuery({
    queryKey: bingoKeys.quotes(teacherId),
    queryFn: async (): Promise<TeacherQuote[]> => {
      // @ts-expect-error Endpoint zatím není v generovaném OpenAPI schématu, ve vývoji ho obsluhuje MSW
      const { data, error } = await api.GET('/bingo/quotes', {
        params: { query: { teacherId } },
      })

      if (error || !data) {
        throw new Error('Učitelské hlášky se nepodařilo načíst.')
      }

      return data as unknown as TeacherQuote[]
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
      // @ts-expect-error Endpoint zatím není v generovaném OpenAPI schématu, ve vývoji ho obsluhuje MSW
      const { data, error } = await api.POST('/bingo/quotes', { body: values })

      if (error || !data) {
        throw new Error('Učitelskou hlášku se nepodařilo uložit.')
      }

      return data as unknown as TeacherQuote
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bingoKeys.quotes(variables.teacherId) })
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
      // @ts-expect-error Endpoint zatím není v generovaném OpenAPI schématu, ve vývoji ho obsluhuje MSW
      const { data, error } = await api.GET('/bingo/stats')

      if (error || !data) {
        throw new Error('Bingo statistiky se nepodařilo načíst.')
      }

      return data as unknown as UserBingoStats
    },
  })
}
