namespace TeacherControl.Api.Features.Abstence.Models;

public record TeacherAbstenceDto(
    int TeacherId,
    string Name,
    string? PhotoUrl,
    float? Rating,
    float Mood,
    int LateArrivalMinutesToday
);

public record SubmitLateArrivalRequest(int Minutes);

public record SubmitMoodRequest(float Value);

public enum AbstenceWriteOutcome
{
    Success,
    TeacherNotFound,
    TooSoon,
}

public record AbstenceWriteResult(AbstenceWriteOutcome Outcome, TeacherAbstenceDto? Teacher = null, TimeSpan? RetryAfter = null);
