namespace TeacherControl.Api.Features.Abstence.Models;

/// <summary>
/// Výsledek zápisu (pozdní příchod / nálada) v AbstenceService – controller si podle něj vybere HTTP odpověď.
/// </summary>
public enum AbstenceWriteOutcome
{
    Success,
    TeacherNotFound,
    TooSoon
}
