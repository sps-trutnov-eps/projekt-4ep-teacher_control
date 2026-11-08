import type { components } from '@/shared/api/generated/schema'

export type TeacherQuote = components['schemas']['TeacherQuoteDto']
export type BingoCell = components['schemas']['BingoCellDto']
export type BingoBoard = components['schemas']['BingoBoardDto']
export type UserBingoStats = components['schemas']['UserBingoStatsDto']
export type DailyBingoWinner = components['schemas']['DailyBingoWinnerDto']
export type ClaimDailyBingoWinnerRequest = components['schemas']['ClaimDailyBingoWinnerRequest']
export type CreateQuoteRequest = components['schemas']['CreateTeacherQuoteRequest']

export interface QuoteFilters {
  teacherId?: string
}

export type ToggleCellResponse = components['schemas']['ToggleBingoCellDto']
