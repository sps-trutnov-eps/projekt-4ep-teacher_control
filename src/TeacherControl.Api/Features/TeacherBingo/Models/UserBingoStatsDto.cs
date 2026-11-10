namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record UserBingoStatsDto(string UserId, int TotalBingos, int CompletedBoards);
