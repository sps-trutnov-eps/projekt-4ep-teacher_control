namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record BingoBoardDto(
    string Id,
    string UserId,
    int GridSize,
    IReadOnlyList<BingoCellDto> Cells,
    int BingoCount,
    bool IsCompleted,
    string CreatedAt);
