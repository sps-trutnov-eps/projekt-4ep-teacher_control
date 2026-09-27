using System.Collections.Concurrent;

namespace TeacherControl.Api.Features.TeacherBingo.Services;

public sealed class TeacherQuote
{
    public string Id { get; set; } = string.Empty;
    public string TeacherId { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public string Quote { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class BingoCell
{
    public string Id { get; set; } = string.Empty;
    public int Row { get; set; }
    public int Col { get; set; }
    public TeacherQuote Quote { get; set; } = new();
    public bool IsMarked { get; set; }
}

public sealed class BingoBoard
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int GridSize { get; set; }
    public List<BingoCell> Cells { get; set; } = [];
    public int BingoCount { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class UserBingoStats
{
    public string UserId { get; set; } = string.Empty;
    public int TotalBingos { get; set; }
    public int CompletedBoards { get; set; }
}

public sealed class ToggleCellResponse
{
    public BingoBoard Board { get; set; } = new();
    public bool NewBingoAchieved { get; set; }
    public int TotalBingos { get; set; }
}

public sealed class CreateQuoteRequest
{
    public string TeacherId { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public string Quote { get; set; } = string.Empty;
}

public class TeacherBingoService
{
    private const int DefaultGridSize = 3;

    private static readonly List<TeacherQuote> SeedQuotes =
    [
        new() { Id = "q-1", TeacherId = "t-novak", TeacherName = "Mgr. Jan Novák", Quote = "Zvoní pro učitele, ne pro vás!", CreatedAt = new DateTime(2026, 9, 1, 8, 0, 0, DateTimeKind.Utc) },
        new() { Id = "q-2", TeacherId = "t-dvorak", TeacherName = "Ing. Petr Dvořák", Quote = "Tohle byste měli znát už ze základní školy.", CreatedAt = new DateTime(2026, 9, 1, 8, 5, 0, DateTimeKind.Utc) },
        new() { Id = "q-3", TeacherId = "t-svoboda", TeacherName = "RNDr. Pavel Svoboda", Quote = "Vyndejte si papíry, dáme si rychlou pětiminutovku.", CreatedAt = new DateTime(2026, 9, 1, 8, 10, 0, DateTimeKind.Utc) },
        new() { Id = "q-4", TeacherId = "t-cerna", TeacherName = "Mgr. Eva Černá", Quote = "Tady se někdo baví a já to nejsem.", CreatedAt = new DateTime(2026, 9, 1, 8, 15, 0, DateTimeKind.Utc) },
        new() { Id = "q-5", TeacherId = "t-vesely", TeacherName = "Ing. Martin Veselý", Quote = "Kdo to nemá odevzdané včas, má automaticky za 5.", CreatedAt = new DateTime(2026, 9, 1, 8, 20, 0, DateTimeKind.Utc) },
        new() { Id = "q-6", TeacherId = "t-kral", TeacherName = "Mgr. Tomáš Král", Quote = "Ticho vzadu!", CreatedAt = new DateTime(2026, 9, 1, 8, 25, 0, DateTimeKind.Utc) },
        new() { Id = "q-7", TeacherId = "t-prochazka", TeacherName = "Ing. Aleš Procházka", Quote = "Příště už zkouším u tabule bez nápovědy.", CreatedAt = new DateTime(2026, 9, 1, 8, 30, 0, DateTimeKind.Utc) },
        new() { Id = "q-8", TeacherId = "t-kucera", TeacherName = "Mgr. Jiří Kučera", Quote = "Já mám času dost, my to v klidu doženeme o prázdninách.", CreatedAt = new DateTime(2026, 9, 1, 8, 35, 0, DateTimeKind.Utc) },
        new() { Id = "q-9", TeacherId = "t-moravec", TeacherName = "Ing. Roman Moravec", Quote = "Tohle je přesně ta otázka, která bude u maturity.", CreatedAt = new DateTime(2026, 9, 1, 8, 40, 0, DateTimeKind.Utc) },
        new() { Id = "q-10", TeacherId = "t-horak", TeacherName = "Mgr. Libor Horák", Quote = "Nezajímá mě, že vám nefunguje počítač.", CreatedAt = new DateTime(2026, 9, 1, 8, 45, 0, DateTimeKind.Utc) },
        new() { Id = "q-11", TeacherId = "t-sedlacek", TeacherName = "Ing. David Sedláček", Quote = "Smažte někdo tu tabuli, ať můžeme psát.", CreatedAt = new DateTime(2026, 9, 1, 8, 50, 0, DateTimeKind.Utc) },
        new() { Id = "q-12", TeacherId = "t-urban", TeacherName = "Mgr. Ondřej Urban", Quote = "Dneska jste nějak podezřele potichu, co se děje?", CreatedAt = new DateTime(2026, 9, 1, 8, 55, 0, DateTimeKind.Utc) },
        new() { Id = "q-13", TeacherId = "t-pokorny", TeacherName = "Ing. Milan Pokorný", Quote = "Kdo nedává pozor, ten to teď vysvětlí celé třídě.", CreatedAt = new DateTime(2026, 9, 1, 9, 0, 0, DateTimeKind.Utc) },
        new() { Id = "q-14", TeacherId = "t-kovar", TeacherName = "Mgr. Michal Kovář", Quote = "Mě nezajímá, co bylo včera, zajímá mě dnešek.", CreatedAt = new DateTime(2026, 9, 1, 9, 5, 0, DateTimeKind.Utc) },
        new() { Id = "q-15", TeacherId = "t-blaha", TeacherName = "Ing. Stanislav Bláha", Quote = "Tohle je naprosto triviální úloha na dvě minuty.", CreatedAt = new DateTime(2026, 9, 1, 9, 10, 0, DateTimeKind.Utc) },
        new() { Id = "q-16", TeacherId = "t-valenta", TeacherName = "Mgr. Václav Valenta", Quote = "Mobil schovej do batohu, nebo ti ho do konce hodiny zabavím.", CreatedAt = new DateTime(2026, 9, 1, 9, 15, 0, DateTimeKind.Utc) }
    ];

    private readonly ConcurrentDictionary<string, BingoBoard> _userBoards = new();
    private readonly ConcurrentDictionary<string, UserBingoStats> _userStats = new();
    private readonly List<TeacherQuote> _quotes = new(SeedQuotes);

    public BingoBoard GetOrCreateBoard(string userId)
    {
        return _userBoards.TryGetValue(userId, out var board)
            ? board
            : CreateBoard(userId, DefaultGridSize);
    }

    public BingoBoard CreateBoard(string userId, int requestedSize)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User id is required.", nameof(userId));
        }

        var size = requestedSize <= 0 ? DefaultGridSize : Math.Clamp(requestedSize, 2, 6);
        var board = BuildBoard(userId, size);
        _userBoards[userId] = board;
        return board;
    }

    public ToggleCellResponse ToggleCell(string userId, string cellId)
    {
        var board = _userBoards.TryGetValue(userId, out var existingBoard)
            ? existingBoard
            : CreateBoard(userId, DefaultGridSize);

        var cell = board.Cells.FirstOrDefault(c => c.Id == cellId);
        if (cell is null)
        {
            throw new KeyNotFoundException($"Políčko '{cellId}' nebylo nalezeno.");
        }

        cell.IsMarked = !cell.IsMarked;

        var previousCount = board.BingoCount;
        var newCount = CalculateBingoCount(board.Cells, board.GridSize);
        board.BingoCount = newCount;

        var stats = GetOrCreateStats(userId);
        var newBingoAchieved = false;

        if (newCount > previousCount)
        {
            var difference = newCount - previousCount;
            stats.TotalBingos += difference;
            newBingoAchieved = true;
        }
        else if (newCount < previousCount)
        {
            var difference = previousCount - newCount;
            stats.TotalBingos = Math.Max(0, stats.TotalBingos - difference);
        }

        if (board.Cells.Count > 0 && board.Cells.All(c => c.IsMarked))
        {
            if (!board.IsCompleted)
            {
                board.IsCompleted = true;
                stats.CompletedBoards++;
            }
        }
        else if (board.IsCompleted)
        {
            board.IsCompleted = false;
            stats.CompletedBoards = Math.Max(0, stats.CompletedBoards - 1);
        }

        return new ToggleCellResponse
        {
            Board = board,
            NewBingoAchieved = newBingoAchieved,
            TotalBingos = stats.TotalBingos
        };
    }

    public IReadOnlyList<TeacherQuote> GetQuotes(string? teacherId)
    {
        if (string.IsNullOrWhiteSpace(teacherId))
        {
            return _quotes.AsReadOnly();
        }

        return _quotes
            .Where(quote => quote.TeacherId.Equals(teacherId.Trim(), StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public TeacherQuote CreateQuote(CreateQuoteRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        var teacherId = request.TeacherId?.Trim();
        var teacherName = request.TeacherName?.Trim();
        var quoteText = request.Quote?.Trim();

        if (string.IsNullOrWhiteSpace(teacherId) ||
            string.IsNullOrWhiteSpace(teacherName) ||
            string.IsNullOrWhiteSpace(quoteText))
        {
            throw new ArgumentException("Chybí povinná pole (teacherId, teacherName, quote).", nameof(request));
        }

        var quote = new TeacherQuote
        {
            Id = $"q-{_quotes.Count + 1}",
            TeacherId = teacherId,
            TeacherName = teacherName,
            Quote = quoteText,
            CreatedAt = DateTime.UtcNow
        };

        _quotes.Add(quote);
        return quote;
    }

    public UserBingoStats GetStats(string userId)
    {
        return GetOrCreateStats(userId);
    }

    public UserBingoStats ResetStats(string userId)
    {
        var stats = GetOrCreateStats(userId);
        stats.TotalBingos = 0;
        stats.CompletedBoards = 0;
        return stats;
    }

    private UserBingoStats GetOrCreateStats(string userId)
    {
        return _userStats.GetOrAdd(userId, _ => new UserBingoStats
        {
            UserId = userId,
            TotalBingos = 0,
            CompletedBoards = 0
        });
    }

    private static BingoBoard BuildBoard(string userId, int gridSize)
    {
        var shuffled = SeedQuotes.OrderBy(_ => Guid.NewGuid()).ToList();
        var cells = new List<BingoCell>(gridSize * gridSize);

        for (var row = 0; row < gridSize; row++)
        {
            for (var col = 0; col < gridSize; col++)
            {
                var quote = shuffled.Count > 0 ? shuffled[(row * gridSize + col) % shuffled.Count] : new TeacherQuote
                {
                    Id = $"q-fallback-{row}-{col}",
                    TeacherId = "t-unknown",
                    TeacherName = "Učitel",
                    Quote = $"Běžná hláška #{row + col + 1}",
                    CreatedAt = DateTime.UtcNow
                };

                cells.Add(new BingoCell
                {
                    Id = $"cell-{row}-{col}-{Guid.NewGuid():N}",
                    Row = row,
                    Col = col,
                    Quote = quote,
                    IsMarked = false
                });
            }
        }

        return new BingoBoard
        {
            Id = $"board-{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}",
            UserId = userId,
            GridSize = gridSize,
            Cells = cells,
            BingoCount = 0,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static int CalculateBingoCount(IEnumerable<BingoCell> cells, int size)
    {
        if (size < 2)
        {
            return 0;
        }

        var cellList = cells.ToList();
        if (cellList.Count != size * size)
        {
            return 0;
        }

        var bingoCount = 0;

        for (var row = 0; row < size; row++)
        {
            var rowCells = cellList.Where(cell => cell.Row == row).ToList();
            if (rowCells.Count == size && rowCells.All(cell => cell.IsMarked))
            {
                bingoCount++;
            }
        }

        for (var col = 0; col < size; col++)
        {
            var columnCells = cellList.Where(cell => cell.Col == col).ToList();
            if (columnCells.Count == size && columnCells.All(cell => cell.IsMarked))
            {
                bingoCount++;
            }
        }

        var mainDiagonal = cellList.Where(cell => cell.Row == cell.Col).ToList();
        if (mainDiagonal.Count == size && mainDiagonal.All(cell => cell.IsMarked))
        {
            bingoCount++;
        }

        var antiDiagonal = cellList.Where(cell => cell.Row + cell.Col == size - 1).ToList();
        if (antiDiagonal.Count == size && antiDiagonal.All(cell => cell.IsMarked))
        {
            bingoCount++;
        }

        return bingoCount;
    }
}