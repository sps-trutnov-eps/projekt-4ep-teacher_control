namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record DailyBingoWinnerDto(
    string UserId,
    string DisplayName,
    string BoardId,
    DateOnly Date,
    DateTimeOffset CompletedAt);
