using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.TeacherBingo.Models;

namespace TeacherControl.Api.Features.TeacherBingo.Services;

public sealed partial class TeacherBingoService
{
    public async Task<BingoBoardDto?> GetBoardAsync(string studentId, CancellationToken cancellationToken)
    {
        var board = await GetTodaysBoardQuery(studentId)
            .FirstOrDefaultAsync(cancellationToken);

        if (board is not null)
            return BingoBoardMapper.Map(board, studentId);

        return await CreateBoardAsync(studentId, DefaultBoardSize, null, cancellationToken);
    }

    public async Task<BingoBoardDto?> CreateBoardAsync(
        string studentId,
        int requestedSize,
        IReadOnlyCollection<string>? teacherIds,
        CancellationToken cancellationToken)
    {
        var size = Math.Clamp(requestedSize, 2, 6);
        var selectedTeacherIds = new HashSet<int>();
        if (teacherIds is not null)
        {
            foreach (var teacherId in teacherIds)
            {
                if (!int.TryParse(teacherId, out var parsedTeacherId))
                    return null;

                selectedTeacherIds.Add(parsedTeacherId);
            }
        }

        var quotesQuery = db.TeacherQuotes
            .Where(quote => quote.IsActive);
        if (teacherIds is not null)
            quotesQuery = quotesQuery.Where(quote => selectedTeacherIds.Contains(quote.TeacherId));

        var quotes = await quotesQuery.ToListAsync(cancellationToken);
        if (quotes.Count == 0)
            return null;

        var shuffledQuotes = quotes.OrderBy(_ => Random.Shared.Next()).ToArray();
        var board = new BingoBoardEntity
        {
            Quotes = Enumerable.Range(0, size * size)
                .Select(position => new BingoBoardQuoteEntity
                {
                    Position = position,
                    QuoteId = shuffledQuotes[position % shuffledQuotes.Length].Id,
                    Quote = null!,
                    BingoBoard = null!,
                    BingoBoardId = 0
                })
                .ToList()
        };

        db.BingoBoards.Add(board);
        await db.SaveChangesAsync(cancellationToken);

        return await GetBoardByIdAsync(board.Id, studentId, cancellationToken);
    }

    public async Task<ToggleBingoCellDto?> ToggleCellAsync(
        string studentId,
        string cellId,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(cellId, out var boardQuoteId))
            return null;

        var boardQuote = await db.BingoBoardQuotes
            .Include(item => item.BingoBoard)
                .ThenInclude(board => board.Quotes)
                    .ThenInclude(quote => quote.Marks.Where(mark => mark.StudentId == studentId))
            .Where(item => item.Id == boardQuoteId)
            .FirstOrDefaultAsync(cancellationToken);
        if (boardQuote is null)
            return null;

        var previousBingoCount = BingoBoardMapper.CalculateBingoCount(boardQuote.BingoBoard.Quotes, studentId);
        var userMark = boardQuote.Marks.FirstOrDefault(mark => mark.StudentId == studentId);
        if (userMark is null)
        {
            userMark = new BingoBoardQuoteMarkEntity
            {
                StudentId = studentId,
                Student = null!,
                BingoBoardQuoteId = boardQuote.Id,
                BingoBoardQuote = boardQuote
            };
            boardQuote.Marks.Add(userMark);
            db.BingoBoardQuoteMarks.Add(userMark);
        }
        else
        {
            boardQuote.Marks.Remove(userMark);
            db.BingoBoardQuoteMarks.Remove(userMark);
        }

        var currentBingoCount = BingoBoardMapper.CalculateBingoCount(boardQuote.BingoBoard.Quotes, studentId);
        var bingoDifference = currentBingoCount - previousBingoCount;

        var student = await db.Users.FirstAsync(user => user.Id == studentId, cancellationToken);
        student.FinishedBingoCount = Math.Max(0, student.FinishedBingoCount + bingoDifference);
        await db.SaveChangesAsync(cancellationToken);

        var board = await GetBoardByIdAsync(boardQuote.BingoBoardId, studentId, cancellationToken);
        return board is null
            ? null
            : new ToggleBingoCellDto(board, bingoDifference > 0, student.FinishedBingoCount);
    }

    private IQueryable<BingoBoardEntity> GetTodaysBoardQuery(string studentId)
    {
        var today = BingoDate.GetPragueDate();
        return db.BingoBoards
            .AsNoTracking()
            .Include(board => board.Quotes)
                .ThenInclude(item => item.Quote)
                    .ThenInclude(quote => quote.Teacher)
            .Include(board => board.Quotes)
                .ThenInclude(item => item.Marks.Where(mark => mark.StudentId == studentId))
            .Where(board => board.Date == today)
            .OrderByDescending(board => board.Id);
    }

    private async Task<BingoBoardDto?> GetBoardByIdAsync(
        int boardId,
        string? studentId,
        CancellationToken cancellationToken)
    {
        var board = await db.BingoBoards
            .AsNoTracking()
            .Include(item => item.Quotes)
                .ThenInclude(item => item.Quote)
                    .ThenInclude(quote => quote.Teacher)
            .Include(item => item.Quotes)
                .ThenInclude(item => item.Marks.Where(mark => mark.StudentId == studentId))
            .FirstOrDefaultAsync(item => item.Id == boardId, cancellationToken);
        return board is null ? null : BingoBoardMapper.Map(board, studentId);
    }
}
