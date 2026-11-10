using Microsoft.EntityFrameworkCore;

using TeacherControl.Api.Features.TeacherBingo.Models;

namespace TeacherControl.Api.Features.TeacherBingo.Services;

public sealed partial class TeacherBingoService
{
    public async Task<UserBingoStatsDto> GetStatsAsync(string studentId, CancellationToken cancellationToken)
    {
        var student = await db.Users.FirstAsync(user => user.Id == studentId, cancellationToken);
        var boards = await db.BingoBoards
            .AsNoTracking()
            .Include(board => board.Quotes)
                .ThenInclude(quote => quote.Marks.Where(mark => mark.StudentId == studentId))
            .ToListAsync(cancellationToken);
        var completedBoards = boards.Count(board => BingoBoardMapper.IsCompleted(board.Quotes, studentId));

        return new UserBingoStatsDto(studentId, student.FinishedBingoCount, completedBoards);
    }

    public async Task<UserBingoStatsDto> ResetStatsAsync(string studentId, CancellationToken cancellationToken)
    {
        var student = await db.Users.FirstAsync(user => user.Id == studentId, cancellationToken);
        student.FinishedBingoCount = 0;
        await db.SaveChangesAsync(cancellationToken);
        return await GetStatsAsync(studentId, cancellationToken);
    }
}
