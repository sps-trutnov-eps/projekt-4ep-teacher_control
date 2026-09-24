export interface TeacherQuote {
  id: string
  teacherId: string
  teacherName: string
  quote: string
  createdAt: string
}

export interface BingoCell {
  id: string
  row: number
  col: number
  quote: TeacherQuote
  isMarked: boolean
}

export interface BingoBoard {
  id: string
  userId: string
  gridSize: number
  cells: BingoCell[]
  /** Počet bing (dokončených řad, sloupců a diagonál) na této desce */
  bingoCount: number
  isCompleted: boolean
  createdAt: string
}

export interface UserBingoStats {
  userId: string
  /** Celkový kumulativní bingo counter uživatele */
  totalBingos: number
  /** Počet odehraných/vyplněných desek */
  completedBoards: number
}

export interface CreateQuoteRequest {
  teacherId: string
  teacherName: string
  quote: string
}

export interface ToggleCellResponse {
  board: BingoBoard
  newBingoAchieved: boolean
  totalBingos: number
}
