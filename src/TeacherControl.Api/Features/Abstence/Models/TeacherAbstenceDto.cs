namespace TeacherControl.Api.Features.Abstence.Models;

/// <summary>
/// Data o učiteli pro featuru Abstence – čte se z API, vlastnosti se používají při serializaci.
/// </summary>
public record TeacherAbstenceDto(
    int TeacherId,
    string Name,
    string? PhotoUrl,
    float? Rating,
    float Mood,
    int LateArrivalMinutesToday
);
