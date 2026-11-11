namespace TeacherControl.Api.Features.Pololeti.Models;

/// <summary>
/// Položka seznamu učitelů pro featuru Pololetí – jen to, co je potřeba k výběru učitele.
/// </summary>
public record PololetiTeacherDto(int TeacherId, string Name, string? PhotoUrl);
