namespace TeacherControl.Api.Features.TeacherBingo.Services;

public interface IDailyBingoWinnerService
{
    Task<DailyBingoWinnerDto?> GetTodayAsync(CancellationToken cancellationToken);

    Task<ClaimDailyBingoWinnerResult?> ClaimAsync(
        string studentId,
        ClaimDailyBingoWinnerRequest request,
        CancellationToken cancellationToken);
}
