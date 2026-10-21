namespace TeacherControl.Api.Features.Abstence.Models;

/// <summary>
/// RetryAfter je vyplněný jen u výsledku TooSoon – zbývající čas do konce cooldownu.
/// </summary>
public record AbstenceWriteResult(AbstenceWriteOutcome Outcome, TeacherAbstenceDto? Teacher = null, TimeSpan? RetryAfter = null);
