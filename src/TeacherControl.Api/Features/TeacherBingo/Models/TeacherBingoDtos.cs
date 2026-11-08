namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record CreateBingoBoardRequest(int Size = 3, IReadOnlyCollection<string>? TeacherIds = null);

public sealed record CreateTeacherQuoteRequest(string TeacherId, string TeacherName, string Quote);

public sealed record TeacherQuoteDto(string Id, string TeacherId, string TeacherName, string Quote);

public sealed record BingoCellDto(string Id, int Row, int Col, TeacherQuoteDto Quote, bool IsMarked);

public sealed record BingoBoardDto(
    string Id,
    string UserId,
    int GridSize,
    IReadOnlyList<BingoCellDto> Cells,
    int BingoCount,
    bool IsCompleted,
    string CreatedAt);

public sealed record ToggleBingoCellDto(BingoBoardDto Board, bool NewBingoAchieved, int TotalBingos);

public sealed record UserBingoStatsDto(string UserId, int TotalBingos, int CompletedBoards);

public sealed record ClaimDailyBingoWinnerRequest
{
    /// <summary>ID of the bingo board completed by the authenticated student.</summary>
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(12)]
    [System.ComponentModel.DataAnnotations.RegularExpression("^[1-9][0-9]*$")]
    public required string BoardId { get; init; }

    /// <summary>Display name shown for the daily winner.</summary>
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(50, MinimumLength = 1)]
    public required string DisplayName { get; init; }
}

public sealed record DailyBingoWinnerDto(
    string UserId,
    string DisplayName,
    string BoardId,
    DateOnly Date,
    DateTimeOffset CompletedAt);

public sealed record ClaimDailyBingoWinnerResult(DailyBingoWinnerDto Winner, bool IsNew);
