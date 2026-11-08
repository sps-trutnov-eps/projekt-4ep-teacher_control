using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record ClaimDailyBingoWinnerRequest
{
    /// <summary>ID of the bingo board completed by the authenticated student.</summary>
    [Required]
    [StringLength(12)]
    [RegularExpression("^[1-9][0-9]*$")]
    public required string BoardId { get; init; }

    /// <summary>Display name shown for the daily winner.</summary>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public required string DisplayName { get; init; }
}
