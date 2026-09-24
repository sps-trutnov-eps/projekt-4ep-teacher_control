import { HttpResponse, http } from 'msw'
import type {
  BingoBoard,
  BingoCell,
  CreateQuoteRequest,
  TeacherQuote,
  ToggleCellResponse,
  UserBingoStats,
} from './types'

const DEFAULT_GRID_SIZE = 3

/**
 * Databáze hlášek učitelů s jejich ID a jmény.
 */
let teacherQuotes: TeacherQuote[] = [
  {
    id: 'q-1',
    teacherId: 't-novak',
    teacherName: 'Mgr. Jan Novák',
    quote: 'Zvoní pro učitele, ne pro vás!',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'q-2',
    teacherId: 't-dvorak',
    teacherName: 'Ing. Petr Dvořák',
    quote: 'Tohle byste měli znát už ze základní školy.',
    createdAt: '2026-09-01T08:05:00.000Z',
  },
  {
    id: 'q-3',
    teacherId: 't-svoboda',
    teacherName: 'RNDr. Pavel Svoboda',
    quote: 'Vyndejte si papíry, dáme si rychlou pětiminutovku.',
    createdAt: '2026-09-01T08:10:00.000Z',
  },
  {
    id: 'q-4',
    teacherId: 't-cerna',
    teacherName: 'Mgr. Eva Černá',
    quote: 'Tady se někdo baví a já to nejsem.',
    createdAt: '2026-09-01T08:15:00.000Z',
  },
  {
    id: 'q-5',
    teacherId: 't-vesely',
    teacherName: 'Ing. Martin Veselý',
    quote: 'Kdo to nemá odevzdané včas, má automaticky za 5.',
    createdAt: '2026-09-01T08:20:00.000Z',
  },
  {
    id: 'q-6',
    teacherId: 't-kral',
    teacherName: 'Mgr. Tomáš Král',
    quote: 'Ticho vzadu!',
    createdAt: '2026-09-01T08:25:00.000Z',
  },
  {
    id: 'q-7',
    teacherId: 't-prochazka',
    teacherName: 'Ing. Aleš Procházka',
    quote: 'Příště už zkouším u tabule bez nápovědy.',
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'q-8',
    teacherId: 't-kucera',
    teacherName: 'Mgr. Jiří Kučera',
    quote: 'Já mám času dost, my to v klidu doženeme o prázdninách.',
    createdAt: '2026-09-01T08:35:00.000Z',
  },
  {
    id: 'q-9',
    teacherId: 't-moravec',
    teacherName: 'Ing. Roman Moravec',
    quote: 'Tohle je přesně ta otázka, která bude u maturity.',
    createdAt: '2026-09-01T08:40:00.000Z',
  },
  {
    id: 'q-10',
    teacherId: 't-horak',
    teacherName: 'Mgr. Libor Horák',
    quote: 'Nezajímá mě, že vám nefunguje počítač.',
    createdAt: '2026-09-01T08:45:00.000Z',
  },
  {
    id: 'q-11',
    teacherId: 't-sedlacek',
    teacherName: 'Ing. David Sedláček',
    quote: 'Smažte někdo tu tabuli, ať můžeme psát.',
    createdAt: '2026-09-01T08:50:00.000Z',
  },
  {
    id: 'q-12',
    teacherId: 't-urban',
    teacherName: 'Mgr. Ondřej Urban',
    quote: 'Dneska jste nějak podezřele potichu, co se děje?',
    createdAt: '2026-09-01T08:55:00.000Z',
  },
  {
    id: 'q-13',
    teacherId: 't-pokorny',
    teacherName: 'Ing. Milan Pokorný',
    quote: 'Kdo nedává pozor, ten to teď vysvětlí celé třídě.',
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'q-14',
    teacherId: 't-kovar',
    teacherName: 'Mgr. Michal Kovář',
    quote: 'Mě nezajímá, co bylo včera, zajímá mě dnešek.',
    createdAt: '2026-09-01T09:05:00.000Z',
  },
  {
    id: 'q-15',
    teacherId: 't-blaha',
    teacherName: 'Ing. Stanislav Bláha',
    quote: 'Tohle je naprosto triviální úloha na dvě minuty.',
    createdAt: '2026-09-01T09:10:00.000Z',
  },
  {
    id: 'q-16',
    teacherId: 't-valenta',
    teacherName: 'Mgr. Václav Valenta',
    quote: 'Mobil schovej do batohu, nebo ti ho do konce hodiny zabavím.',
    createdAt: '2026-09-01T09:15:00.000Z',
  },
]

/**
 * Ukládání bingo desek jednotlivých uživatelů (klíčem je userId).
 */
const userBoards = new Map<string, BingoBoard>()

/**
 * Ukládání statistik a bingo counteru pro uživatele.
 */
const userStats = new Map<string, UserBingoStats>()

function getActiveUserId(): string {
  try {
    return localStorage.getItem('teacher-control.mock-user-id') || 'u-student'
  } catch {
    return 'u-student'
  }
}

function getOrCreateUserStats(userId: string): UserBingoStats {
  let stats = userStats.get(userId)
  if (!stats) {
    stats = {
      userId,
      totalBingos: 0,
      completedBoards: 0,
    }
    userStats.set(userId, stats)
  }
  return stats
}

/**
 * Spočítá počet dokončených řad, sloupců a diagonál na bingo desce.
 */
function calculateBingoCount(cells: BingoCell[], size: number): number {
  let bingos = 0

  // Kontrola řad
  for (let r = 0; r < size; r++) {
    const rowCells = cells.filter((c) => c.row === r)
    if (rowCells.length === size && rowCells.every((c) => c.isMarked)) {
      bingos++
    }
  }

  // Kontrola sloupců
  for (let col = 0; col < size; col++) {
    const colCells = cells.filter((c) => c.col === col)
    if (colCells.length === size && colCells.every((c) => c.isMarked)) {
      bingos++
    }
  }

  // Hlavní diagonála (0,0), (1,1), (2,2)...
  const mainDiag = cells.filter((c) => c.row === c.col)
  if (mainDiag.length === size && mainDiag.every((c) => c.isMarked)) {
    bingos++
  }

  // Vedlejší diagonála (0, size-1), (1, size-2)...
  const antiDiag = cells.filter((c) => c.row + c.col === size - 1)
  if (antiDiag.length === size && antiDiag.every((c) => c.isMarked)) {
    bingos++
  }

  return bingos
}

/**
 * Vygeneruje novou náhodnou desku pro zadaného uživatele.
 */
function createNewBoard(userId: string, size = DEFAULT_GRID_SIZE): BingoBoard {
  const neededQuotes = size * size
  // Zamíchání hlášek
  const shuffled = [...teacherQuotes].sort(() => Math.random() - 0.5)
  const selectedQuotes = shuffled.slice(0, Math.min(neededQuotes, shuffled.length))

  const cells: BingoCell[] = []
  let quoteIndex = 0

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const quote = selectedQuotes[quoteIndex] || {
        id: `q-fallback-${quoteIndex}`,
        teacherId: 't-unknown',
        teacherName: 'Učitel',
        quote: `Běžná hláška #${quoteIndex + 1}`,
        createdAt: new Date().toISOString(),
      }
      cells.push({
        id: `cell-${r}-${c}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        row: r,
        col: c,
        quote,
        isMarked: false,
      })
      quoteIndex++
    }
  }

  const board: BingoBoard = {
    id: `board-${Date.now()}`,
    userId,
    gridSize: size,
    cells,
    bingoCount: 0,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  }

  userBoards.set(userId, board)
  return board
}

/**
 * MSW Handlery pro backend Bingo featury:
 * - Správa a generování uživatelských bingo desek
 * - Ukládání a filtrování učitelských hlášek podle Teacher ID
 * - Počítadlo bingo výher (Bingo counter)
 */
export const bingoHandlers = [
  // 1. Získání aktuální aktivní desky přihlášeného uživatele (pokud nemá, vytvoří se nová)
  http.get('/api/bingo/board', () => {
    const userId = getActiveUserId()
    let board = userBoards.get(userId)
    if (!board) {
      board = createNewBoard(userId)
    }
    return HttpResponse.json(board)
  }),

  // 2. Vygenerování nové desky pro uživatele
  http.post('/api/bingo/board/new', async ({ request }) => {
    const userId = getActiveUserId()
    const url = new URL(request.url)
    const sizeParam = url.searchParams.get('size')
    const size = sizeParam ? parseInt(sizeParam, 10) : DEFAULT_GRID_SIZE

    const newBoard = createNewBoard(userId, Number.isNaN(size) ? DEFAULT_GRID_SIZE : size)
    return HttpResponse.json(newBoard, { status: 201 })
  }),

  // 3. Označení / odznačení políčka a přepočet Bingo counteru
  http.post('/api/bingo/cells/:cellId/toggle', ({ params }) => {
    const { cellId } = params
    const userId = getActiveUserId()
    const board = userBoards.get(userId)

    if (!board) {
      return HttpResponse.json({ title: 'Deska nenalezena', status: 404 }, { status: 404 })
    }

    const cell = board.cells.find((c) => c.id === cellId)
    if (!cell) {
      return HttpResponse.json({ title: 'Políčko nenalezeno', status: 404 }, { status: 404 })
    }

    // Přepnutí stavu označení
    cell.isMarked = !cell.isMarked

    const previousCount = board.bingoCount
    const newCount = calculateBingoCount(board.cells, board.gridSize)
    board.bingoCount = newCount

    const stats = getOrCreateUserStats(userId)
    let newBingoAchieved = false

    if (newCount > previousCount) {
      const difference = newCount - previousCount
      stats.totalBingos += difference
      newBingoAchieved = true
    } else if (newCount < previousCount) {
      // V případě odznačení políčka
      const difference = previousCount - newCount
      stats.totalBingos = Math.max(0, stats.totalBingos - difference)
    }

    if (board.cells.every((c) => c.isMarked)) {
      if (!board.isCompleted) {
        board.isCompleted = true
        stats.completedBoards++
      }
    } else {
      board.isCompleted = false
    }

    const response: ToggleCellResponse = {
      board,
      newBingoAchieved,
      totalBingos: stats.totalBingos,
    }

    return HttpResponse.json(response)
  }),

  // 4. Seznam učitelských hlášek (s možností filtru podle teacherId)
  http.get('/api/bingo/quotes', ({ request }) => {
    const url = new URL(request.url)
    const teacherId = url.searchParams.get('teacherId')

    const filtered = teacherId
      ? teacherQuotes.filter((q) => q.teacherId === teacherId)
      : teacherQuotes

    return HttpResponse.json(filtered)
  }),

  // 5. Přidání nové hlášky pro učitele (Teacher ID -> Quote)
  http.post('/api/bingo/quotes', async ({ request }) => {
    const body = (await request.json()) as CreateQuoteRequest

    if (!body.teacherId || !body.quote || !body.teacherName) {
      return HttpResponse.json(
        { title: 'Chybí povinná pole (teacherId, teacherName, quote)', status: 400 },
        { status: 400 }
      )
    }

    const newQuote: TeacherQuote = {
      id: `q-${teacherQuotes.length + 1}`,
      teacherId: body.teacherId,
      teacherName: body.teacherName,
      quote: body.quote,
      createdAt: new Date().toISOString(),
    }

    teacherQuotes = [...teacherQuotes, newQuote]
    return HttpResponse.json(newQuote, { status: 201 })
  }),

  // 6. Získání bingo counteru a statistik uživatele
  http.get('/api/bingo/stats', () => {
    const userId = getActiveUserId()
    const stats = getOrCreateUserStats(userId)
    return HttpResponse.json(stats)
  }),

  // 7. Reset statistik / bingo counteru
  http.post('/api/bingo/stats/reset', () => {
    const userId = getActiveUserId()
    const stats = getOrCreateUserStats(userId)
    stats.totalBingos = 0
    stats.completedBoards = 0
    return HttpResponse.json(stats)
  }),
]
