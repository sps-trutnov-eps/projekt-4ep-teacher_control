namespace TeacherControl.Api.Features.Pololeti.Models;

/// <summary>
/// Karta učitele – jeho údaje a stav hlasování o titulech v aktuálním pololetí.
/// </summary>
public record TeacherCardDto(
    int TeacherId,
    string Name,
    string? PhotoUrl,
    string Description,
    int Pololeti,
    string PololetiText,
    List<TitleVotesDto> Titles
);
