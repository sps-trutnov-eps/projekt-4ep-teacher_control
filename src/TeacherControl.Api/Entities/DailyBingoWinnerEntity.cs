using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Entities;

public class DailyBingoWinnerEntity
{
    public DateOnly Date { get; set; }

    [MaxLength(50)]
    public required string DisplayName { get; set; }

    public required string UserId { get; set; }
    public required UserEntity User { get; set; }

    public required int BoardId { get; set; }
    public required BingoBoardEntity Board { get; set; }

    public DateTimeOffset CompletedAt { get; set; }
}
