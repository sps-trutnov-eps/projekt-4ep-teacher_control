using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.TeacherBingo.Models;

namespace TeacherControl.Api.Features.TeacherBingo.Services;

public sealed class DailyBingoWinnerService(AppDbContext db) : IDailyBingoWinnerService
{
    private const string WinnerDateConstraint = "PK_DailyBingoWinners";

    public async Task<DailyBingoWinnerDto?> GetTodayAsync(CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Europe/Prague"));
        var winner = await db.DailyBingoWinners
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Date == today, cancellationToken);

        return winner is null ? null : MapWinner(winner);
    }

    public async Task<ClaimDailyBingoWinnerResult?> ClaimAsync(
        string studentId,
        ClaimDailyBingoWinnerRequest request,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(request.BoardId, out var boardId) || string.IsNullOrWhiteSpace(request.DisplayName))
            return null;

        var today = DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Europe/Prague"));
        var existingWinner = await db.DailyBingoWinners
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Date == today, cancellationToken);
        if (existingWinner is not null)
            return new ClaimDailyBingoWinnerResult(MapWinner(existingWinner), false);

        var board = await db.BingoBoards
            .AsNoTracking()
            .Include(item => item.Quotes)
                .ThenInclude(item => item.Marks.Where(mark => mark.StudentId == studentId))
            .FirstOrDefaultAsync(item => item.Id == boardId && item.Date == today, cancellationToken);
        if (board is null || BingoBoardMapper.CalculateBingoCount(board.Quotes, studentId) == 0)
            return null;

        var winner = new DailyBingoWinnerEntity
        {
            Date = today,
            DisplayName = request.DisplayName.Trim(),
            UserId = studentId,
            User = null!,
            BoardId = board.Id,
            Board = null!,
            CompletedAt = DateTimeOffset.UtcNow
        };

        db.DailyBingoWinners.Add(winner);
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return new ClaimDailyBingoWinnerResult(MapWinner(winner), true);
        }
        catch (DbUpdateException exception) when (
            exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation,
                ConstraintName: WinnerDateConstraint
            })
        {
            db.Entry(winner).State = EntityState.Detached;
            var concurrentWinner = await db.DailyBingoWinners
                .AsNoTracking()
                .FirstAsync(item => item.Date == today, cancellationToken);
            return new ClaimDailyBingoWinnerResult(MapWinner(concurrentWinner), false);
        }
    }

    private static DailyBingoWinnerDto MapWinner(DailyBingoWinnerEntity winner) =>
        new(
            winner.UserId,
            winner.DisplayName,
            winner.BoardId.ToString(),
            winner.Date,
            winner.CompletedAt);

}
