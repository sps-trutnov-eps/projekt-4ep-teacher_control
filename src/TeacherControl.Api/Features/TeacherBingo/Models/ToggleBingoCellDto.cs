namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record ToggleBingoCellDto(BingoBoardDto Board, bool NewBingoAchieved, int TotalBingos);
