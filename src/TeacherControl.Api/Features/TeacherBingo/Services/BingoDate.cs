namespace TeacherControl.Api.Features.TeacherBingo.Services;

internal static class BingoDate
{
    internal static DateOnly GetPragueDate() => DateOnly.FromDateTime(
        TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Europe/Prague"));
}
